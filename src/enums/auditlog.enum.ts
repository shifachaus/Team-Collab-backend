export const AuditActionEnum = {
    CREATE: "CREATE",
    UPDATE: "UPDATE",
    DELETE: "DELETE",
  } as const;
  
  export const AuditEntityEnum = {
    WORKSPACE: "WORKSPACE",
    PROJECT: "PROJECT",
    TASK: "TASK",
  } as const;
  
  export type AuditActionEnumType = keyof typeof AuditActionEnum;
  export type AuditEntityEnumType = keyof typeof AuditEntityEnum;