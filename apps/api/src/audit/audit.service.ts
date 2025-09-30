import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async logEvent(actorId: string, entity: string, entityId: string, action: string, payload: any) {
    return this.prisma.auditEvent.create({
      data: {
        actorId,
        entity,
        entityId,
        action,
        payload,
      },
    });
  }

  async getAuditLog(entity?: string, entityId?: string, actorId?: string) {
    const where: any = {};
    
    if (entity) where.entity = entity;
    if (entityId) where.entityId = entityId;
    if (actorId) where.actorId = actorId;

    return this.prisma.auditEvent.findMany({
      where,
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { ts: 'desc' },
      take: 100,
    });
  }
}