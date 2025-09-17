import mongoose, { Document, Schema } from "mongoose";

export interface ProjectDocument extends Document {
  name: string;
  description: string | null;
  emoji: string;
  workspace: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<ProjectDocument>(
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

    emoji: {
      type: String,
      required: false,
      trim: true,
      default: "📊",
    },

    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      require: "Workspace",
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      require: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const ProjectModel = mongoose.model<ProjectDocument>("Project", projectSchema);
export default ProjectModel;
