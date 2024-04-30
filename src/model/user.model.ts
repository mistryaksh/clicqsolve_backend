import { IUserProps } from "interface";
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema<IUserProps>(
  {
    mobile: { type: mongoose.Schema.Types.String, required: true },
    lastOtp: { type: mongoose.Schema.Types.String },
    otpSentOn: { type: mongoose.Schema.Types.String },
    name: { type: mongoose.Schema.Types.String, lowercase: true },
    email: {
      type: mongoose.Schema.Types.String,
      unique: true,
      lowercase: true,
    },
    verified: { type: mongoose.Schema.Types.Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUserProps>("User", UserSchema);
