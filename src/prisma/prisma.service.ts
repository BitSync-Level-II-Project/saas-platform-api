import { Injectable, Logger } from '@nestjs/common';

import type {
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../generated/prisma/client.js';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(configService: ConfigService) {
    const adapter = new PrismaPg({
      connectionString:
        configService.getOrThrow<string>('DATABASE_URL'),
      connectionTimeoutMillis: 5000,
    });

    super({ adapter });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();

    await this.$queryRaw`SELECT 1`;

    this.logger.log('Database connection verified');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}