export class AuditLogDto {
  id: string;
  userId: string;
  action: string;
  entityId: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}
