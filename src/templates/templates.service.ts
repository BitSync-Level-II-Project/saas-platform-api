import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Prisma, TemplateVersion } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateTemplateDto } from './dto/create-template.dto.js';
import type { ListTemplatesDto } from './dto/list-templates.dto.js';
import type { UpdateTemplateDto } from './dto/update-template.dto.js';
import type { PublishTemplateDto } from './dto/publish-template.dto.js';
import { prepareTemplateSnapshot } from './prepare-template-snapshot.js';

const templateReadInclude = {
  versions: {
    orderBy: { version: 'desc' },
    take: 1,
    select: {
      version: true,
      sourceDraftRevision: true,
      publishedAt: true,
    },
  },
} satisfies Prisma.TemplateInclude;

type TemplateWithVersions = Prisma.TemplateGetPayload<{
  include: typeof templateReadInclude;
}>;

@Injectable()
export class TemplatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private getDevelopmentContext() {
    const enabled =
      this.config.get<string>('NODE_ENV') === 'development' &&
      this.config.get<string>('ENABLE_TEMPLATE_DEV_API') === 'true';

    if (!enabled) {
      throw new NotFoundException();
    }

    const organizationId = this.config
      .get<string>('DEV_ORGANIZATION_ID')
      ?.trim();

    const userId = this.config.get<string>('DEV_USER_ID')?.trim();

    if (!organizationId || !userId) {
      throw new ServiceUnavailableException(
        'Template development context is not configured.',
      );
    }

    return { organizationId, userId };
  }

  private getMetadataText(metadata: Prisma.JsonValue, key: string): string {
    if (
      metadata === null ||
      typeof metadata !== 'object' ||
      Array.isArray(metadata)
    ) {
      return '';
    }

    const value = metadata[key];

    return typeof value === 'string' ? value : '';
  }

  private toTemplateSummary(template: TemplateWithVersions) {
    const latestVersion = template.versions[0];

    const status =
      latestVersion?.sourceDraftRevision === template.draftRevision
        ? ('published' as const)
        : ('draft' as const);

    return {
      id: template.id,
      status,
      draftRevision: template.draftRevision,
      version: latestVersion?.version ?? null,
      publishedAt: latestVersion?.publishedAt ?? null,
      details: {
        name: template.name,
        description: template.description,
        industry: this.getMetadataText(template.metadata, 'industry'),
        process: this.getMetadataText(template.metadata, 'process'),
        warehouse: this.getMetadataText(template.metadata, 'warehouse'),
      },
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    };
  }
  private async lockTemplate(
    tx: Prisma.TransactionClient,
    id: string,
    organizationId: string,
  ): Promise<void> {
    const rows = await tx.$queryRaw<Array<{ id: string }>>`
      SELECT "id"
      FROM "templates"
      WHERE "id" = ${id}::uuid
        AND "organizationId" = ${organizationId}
      FOR UPDATE
    `;

    if (rows.length === 0) {
      throw new NotFoundException('Template not found.');
    }
  }

  private toPublishedResponse(version: TemplateVersion) {
    return {
      id: version.templateId,
      versionId: version.id,
      status: 'published' as const,
      version: version.version,
      sourceDraftRevision: version.sourceDraftRevision,
      publishedAt: version.publishedAt,
      details: {
        name: version.name,
        description: version.description,
        industry: this.getMetadataText(version.metadata, 'industry'),
        process: this.getMetadataText(version.metadata, 'process'),
        warehouse: this.getMetadataText(version.metadata, 'warehouse'),
      },
      fields: version.fields,
    };
  }

  async createDraft(dto: CreateTemplateDto) {
    const context = this.getDevelopmentContext();

    const template = await this.prisma.template.create({
      data: {
        organizationId: context.organizationId,
        createdById: context.userId,
        name: dto.name,
        description: dto.description?.trim() ?? '',
        metadata: {
          industry: dto.industry?.trim() ?? '',
          process: dto.process?.trim() ?? '',
          warehouse: dto.warehouse?.trim() ?? '',
        },
        fields: [],
      },
      include: templateReadInclude,
    });

    return {
      ...this.toTemplateSummary(template),
      fields: template.fields,
    };
  }

  async findAll(query: ListTemplatesDto) {
    const context = this.getDevelopmentContext();
    const { page, limit, search, status } = query;

    const where: Prisma.TemplateWhereInput = {
      organizationId: context.organizationId,
    };

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    if (status === 'draft') {
      where.versions = {
        none: {},
      };
    } else if (status === 'published') {
      where.versions = {
        some: {},
      };
    }

    const templates = await this.prisma.template.findMany({
      where,
      orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
      skip: (page - 1) * limit,
      take: limit + 1,
      include: templateReadInclude,
    });

    return {
      items: templates
        .slice(0, limit)
        .map((template) => this.toTemplateSummary(template)),
      page,
      limit,
      hasMore: templates.length > limit,
    };
  }

  async findOne(id: string) {
    const context = this.getDevelopmentContext();

    const template = await this.prisma.template.findFirst({
      where: {
        id,
        organizationId: context.organizationId,
      },
      include: templateReadInclude,
    });

    if (!template) {
      throw new NotFoundException('Template not found.');
    }

    return {
      ...this.toTemplateSummary(template),
      fields: template.fields,
    };
  }
  async updateDraft(id: string, dto: UpdateTemplateDto) {
    const context = this.getDevelopmentContext();

    const fieldIds = dto.fields.map((field) => field.id);

    if (new Set(fieldIds).size !== fieldIds.length) {
      throw new BadRequestException('Each field must have a unique ID.');
    }

    const fields: Prisma.InputJsonArray = dto.fields.map((field) => ({
      id: field.id,
      type: field.type,
      label: field.label,
      required: field.required,

      ...(field.type === 'dropdown' ? { options: field.options ?? [] } : {}),

      ...(field.type === 'number'
        ? {
            min: field.min ?? null,
            max: field.max ?? null,
          }
        : {}),
    }));

    return this.prisma.$transaction(
      async (tx) => {
        await this.lockTemplate(tx, id, context.organizationId);

        const current = await tx.template.findFirst({
          where: {
            id,
            organizationId: context.organizationId,
          },
          include: templateReadInclude,
        });

        if (!current) {
          throw new NotFoundException('Template not found.');
        }

        if (current.versions.length > 0) {
          throw new ConflictException('Published templates are read-only.');
        }

        if (current.draftRevision !== dto.expectedRevision) {
          throw new ConflictException(
            'This draft has changed. Reload it and review the latest changes before saving.',
          );
        }

        const existingMetadata =
          current.metadata !== null &&
          typeof current.metadata === 'object' &&
          !Array.isArray(current.metadata)
            ? current.metadata
            : {};

        const result = await tx.template.updateMany({
          where: {
            id,
            organizationId: context.organizationId,
            draftRevision: dto.expectedRevision,
            versions: {
              none: {},
            },
          },
          data: {
            name: dto.details.name,
            description: dto.details.description?.trim() ?? '',
            metadata: {
              ...existingMetadata,
              industry: dto.details.industry?.trim() ?? '',
              process: dto.details.process?.trim() ?? '',
              warehouse: dto.details.warehouse?.trim() ?? '',
            },
            fields,
            draftRevision: {
              increment: 1,
            },
          },
        });

        if (result.count !== 1) {
          throw new ConflictException(
            'The draft could not be saved because it changed. Reload it before trying again.',
          );
        }

        const updated = await tx.template.findFirstOrThrow({
          where: {
            id,
            organizationId: context.organizationId,
          },
          include: templateReadInclude,
        });

        return {
          ...this.toTemplateSummary(updated),
          fields: updated.fields,
        };
      },
      {
        isolationLevel: 'ReadCommitted',
      },
    );
  }
  async publish(id: string, dto: PublishTemplateDto) {
    const context = this.getDevelopmentContext();

    return this.prisma.$transaction(
      async (tx) => {
        await this.lockTemplate(tx, id, context.organizationId);

        const current = await tx.template.findFirst({
          where: {
            id,
            organizationId: context.organizationId,
          },
          include: templateReadInclude,
        });

        if (!current) {
          throw new NotFoundException('Template not found.');
        }

        if (current.versions.length > 0) {
          throw new ConflictException(
            'This template is already published and is read-only.',
          );
        }

        if (current.draftRevision !== dto.expectedRevision) {
          throw new ConflictException(
            'This draft has changed. Reload it before publishing.',
          );
        }

        const snapshot = prepareTemplateSnapshot(current);

        const version = await tx.templateVersion.create({
          data: {
            templateId: current.id,
            organizationId: context.organizationId,
            version: 1,
            sourceDraftRevision: current.draftRevision,
            name: current.name,
            description: current.description,
            metadata: snapshot.metadata,
            fields: snapshot.fields,
            publishedById: context.userId,
          },
        });

        return this.toPublishedResponse(version);
      },
      {
        isolationLevel: 'ReadCommitted',
      },
    );
  }

  async findPublished(id: string) {
    const context = this.getDevelopmentContext();

    const version = await this.prisma.templateVersion.findFirst({
      where: {
        templateId: id,
        organizationId: context.organizationId,
      },
      orderBy: {
        version: 'desc',
      },
    });

    if (!version) {
      throw new NotFoundException('Published template version not found.');
    }

    return this.toPublishedResponse(version);
  }
}
