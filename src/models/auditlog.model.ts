import mongoose, { Document, Schema } from "mongoose";
import {
  AuditActionEnum,
  AuditActionEnumType,
  AuditEntityEnum,
  AuditEntityEnumType,
} from "../enums/auditlog.enum";

export interface AuditLogDocument extends Document {
  workspaceId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  taskId?: mongoose.Types.ObjectId;
  action: AuditActionEnumType;
  entityType: AuditEntityEnumType;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const auditLogSchema = new Schema<AuditLogDocument>(
  {
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },

    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },

    action: {
      type: String,
      enum: Object.values(AuditActionEnum),
      default: AuditActionEnum.CREATE,
    },

    entityType: {
      type: String,
      enum: Object.values(AuditEntityEnum),
      default: AuditEntityEnum.WORKSPACE,
    },
  },
  {
    timestamps: true,
  }
);

const AuditLogModel = mongoose.model<AuditLogDocument>(
  "Auditlog",
  auditLogSchema
);
export default AuditLogModel;
