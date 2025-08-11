import mongoose, { Document, Schema } from "mongoose";
import { generateInviteCode } from "../utils/uuid";

export interface workspaceDocument extends Document {
  name: string;
  description: string;
  owner: mongoose.Types.ObjectId;
  inviteCode: string;
  createdAt: string;
  updatedAt: string;
}

const workspaceSchema = new Schema(
  {
    name: {
      type: String,
      require: true,
      trim: true,
    },

    description: {
      type: String,
      require: false,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    inviteCode: {
      type: String,
      required: true,
      unique: true,
      default: generateInviteCode,
    },
  },
  {
    timestamps: true,
  }
);

workspaceSchema.methods.resetInviteCode = function () {
  this.inviteCode = generateInviteCode();
};

const workspaceModel = mongoose.model<workspaceDocument>(
  "Workspace",
  workspaceSchema
);
export default workspaceModel;
