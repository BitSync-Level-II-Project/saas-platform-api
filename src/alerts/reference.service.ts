import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { TenantContext } from './types.js';

@Injectable()
export class ReferenceService {
  constructor(private readonly prisma: PrismaService) {}

  async getReference(context: TenantContext) {
    const where = { organizationId: context.organizationId };
    const [warehouses, templates] = await Promise.all([
      this.prisma.warehouse.findMany({ where, orderBy: { name: 'asc' }, select: { id: true, name: true } }),
      this.prisma.template.findMany({ where, orderBy: { name: 'asc' }, select: { id: true, name: true, fields: true } }),
    ]);

    // Default seed fallback if DB hasn't been populated with other modules yet
    const sites =
      warehouses.length > 0
        ? warehouses.map((w) => ({ id: w.id, name: w.name }))
        : [
            { id: '00000000-0000-4000-8000-000000000001', name: 'Colombo warehouse' },
            { id: '00000000-0000-4000-8000-000000000002', name: 'Kandy warehouse' },
            { id: '00000000-0000-4000-8000-000000000003', name: 'Galle warehouse' },
          ];

    const locations = [
      { id: 'l-machine', siteId: sites[0].id, name: 'Machine room' },
      { id: 'l-bay', siteId: sites[0].id, name: 'Loading bay' },
      { id: 'l-cold', siteId: sites[1]?.id ?? sites[0].id, name: 'Cold store' },
      { id: 'l-pack', siteId: sites[2]?.id ?? sites[0].id, name: 'Packing hall' },
    ];

    const devices = [
      { id: 'd-phone01', siteId: sites[0].id, locationId: 'l-machine', name: 'Phone-01' },
      { id: 'd-phone02', siteId: sites[0].id, locationId: 'l-bay', name: 'Phone-02' },
      { id: 'd-phone03', siteId: sites[1]?.id ?? sites[0].id, locationId: 'l-cold', name: 'Phone-03' },
    ];

    const formattedTemplates =
      templates.length > 0
        ? templates.map((t) => ({
            id: t.id,
            name: t.name,
            fields: Array.isArray(t.fields) ? t.fields.flatMap((field) => {
              if (!field || typeof field !== 'object' || Array.isArray(field)) return [];
              const key = field.key ?? field.id;
              if (typeof key !== 'string') return [];
              return [{
                key, label: typeof field.label === 'string' ? field.label : key,
                ...(typeof field.unit === 'string' ? { unit: field.unit } : {}),
              }];
            }) : [],
          }))
        : [
            {
              id: '00000000-0000-4000-8000-000000000004',
              name: 'Equipment inspection',
              fields: [
                { key: 'temperature', label: 'Temperature', unit: '°C' },
                { key: 'pressure', label: 'Hydraulic pressure', unit: 'bar' },
                { key: 'vibration', label: 'Vibration', unit: 'mm/s' },
              ],
            },
            {
              id: '00000000-0000-4000-8000-000000000005',
              name: 'Stationed phone telemetry',
              fields: [
                { key: 'temperature', label: 'Temperature', unit: '°C' },
                { key: 'soundDb', label: 'Sound level', unit: 'dB' },
                { key: 'battery', label: 'Battery', unit: '%' },
                { key: 'minutesSinceContact', label: 'Minutes since last contact', unit: 'min' },
              ],
            },
          ];

    return {
      tenant: { id: context.organizationId, name: 'Nova Industries' },
      sites,
      locations,
      devices,
      templates: formattedTemplates,
    };
  }
}
