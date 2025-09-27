import {
  AuditEntityEnum,
  AuditActionEnum,
  AuditActionEnumType,
  AuditEntityEnumType,
} from "../enums/auditlog.enum";

export const getMetadata = (
  entityType: AuditEntityEnumType,
  entity: any,
  action?: AuditActionEnumType
): Record<string, any> => {
  switch (entityType) {
    case AuditEntityEnum.WORKSPACE:
      if (action === AuditActionEnum.UPDATE) {
        return {
          oldValue: entity.oldValue,
          newValue: entity.newValue,
          updaetdedBy: entity.updaetdedBy,
          comment: entity.comment || "",
        };
      }
      return {
        workspaceName: entity.name,
        createdBy: entity.createdBy,
        comment: entity.comment || "",
      };

    case AuditEntityEnum.PROJECT:
      if (action === AuditActionEnum.UPDATE) {
        return {
          oldValue: entity.oldValue,
          newValue: entity.newValue,
          updaetdedBy: entity.updaetdedBy,
          comment: entity.comment || "",
        };
      } else if (action === AuditActionEnum.DELETE) {
        return {
          projectName: entity.name,
          deletedBy: entity.deletedBy,
          deletedAt: entity.deletedAt,
          comment: entity.comment || "",
        };
      }

      return {
        projectName: entity.name,
        createdBy: entity.createdBy,
        comment: entity.comment || "",
      };

    case AuditEntityEnum.TASK:
      if (action === AuditActionEnum.UPDATE) {
        return {
          oldValue: entity.oldValue,
          newValue: entity.newValue,
          updaetdedBy: entity.updaetdedBy,
          comment: entity.comment || "",
        };
      } else if (action === AuditActionEnum.DELETE) {
        return {
          taskName: entity.name,
          deletedBy: entity.deletedBy,
          deletedAt: entity.deletedAt,
          comment: entity.comment || "",
        };
      }
      return {
        taskTitle: entity.title,
        createdBy: entity.createdBy,
        assignedTo: entity.assignedTo || null,
        comment: entity.comment || "",
      };

    default:
      return {};
  }
};
