import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { TenantContext } from './types.js';

@Injectable()
export class ReferenceService {
  constructor(private readonly prisma: PrismaService) {}

  async getReference(context: TenantContext) {
    // 1. Load warehouses from DB
    let warehouses: any[] = [];
    try {
      warehouses = await (this.prisma as any).warehouse.findMany({
        where: { organizationId: context.organizationId },
        orderBy: { name: 'asc' },
      });
    } catch {
      warehouses = [];
    }

    // 2. Load templates from DB
    let templates: any[] = [];
    try {
      templates = await (this.prisma as any).template.findMany({
        where: { organizationId: context.organizationId },
        orderBy: { name: 'asc' },
      });
    } catch {
      templates = [];
    }

    // Default seed fallback if DB hasn't been populated with other modules yet
    const sites =
      warehouses.length > 0
        ? warehouses.map((w) => ({ id: w.id, name: w.name }))
        : [
            { id: 's-colombo', name: 'Colombo warehouse' },
            { id: 's-kandy', name: 'Kandy warehouse' },
            { id: 's-galle', name: 'Galle warehouse' },
          ];

    const locations = [
      { id: 'l-machine', siteId: sites[0]?.id ?? 's-colombo', name: 'Machine room' },
      { id: 'l-bay', siteId: sites[0]?.id ?? 's-colombo', name: 'Loading bay' },
      { id: 'l-cold', siteId: sites[1]?.id ?? 's-kandy', name: 'Cold store' },
      { id: 'l-pack', siteId: sites[2]?.id ?? 's-galle', name: 'Packing hall' },
    ];

    const devices = [
      { id: 'd-phone01', siteId: sites[0]?.id ?? 's-colombo', locationId: 'l-machine', name: 'Phone-01' },
      { id: 'd-phone02', siteId: sites[0]?.id ?? 's-colombo', locationId: 'l-bay', name: 'Phone-02' },
      { id: 'd-phone03', siteId: sites[1]?.id ?? 's-kandy', locationId: 'l-cold', name: 'Phone-03' },
    ];

    const formattedTemplates =
      templates.length > 0
        ? templates.map((t) => ({
            id: t.id,
            name: t.name,
            fields: Array.isArray(t.fields) ? t.fields : [],
          }))
        : [
            {
              id: 't-inspection',
              name: 'Equipment inspection',
              fields: [
                { key: 'temperature', label: 'Temperature', unit: '°C' },
                { key: 'pressure', label: 'Hydraulic pressure', unit: 'bar' },
                { key: 'vibration', label: 'Vibration', unit: 'mm/s' },
              ],
            },
            {
              id: 't-telemetry',
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
