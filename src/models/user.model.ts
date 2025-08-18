import mongoose, { Document, Schema } from "mongoose";
import { comapreValue, hashValue } from "../utils/bcrypt";

export interface UserDocument extends Document {
  name: string;
  email: string;
  password?: string;
  profilePicture: string | null;
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
  currentWorkspace: mongoose.Types.ObjectId | null;
  comparePassword(value: string): Promise<boolean>;
  omitPassword(): Omit<UserDocument, "password">;
}

const userSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      require: false,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      select: true,
    },

    profilePicture: {
      type: String,
      default: null,
    },

    currentWorkspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    if (this.password) {
      this.password = await hashValue(this.password);
    }
  }
  next();
});

// Remove password from user object
userSchema.methods.omitPassword = function (): Omit<UserDocument, "password"> {
  const userObj = this.toObject();
  delete userObj.password;
  return userObj;
};

// Check if entered password matches the stored one
userSchema.methods.comparePassword = async function (value: string) {
  return comapreValue(value, this.password);
};

const UserModel = mongoose.model("User", userSchema);
export default UserModel;
