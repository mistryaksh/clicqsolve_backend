import mongoose from "mongoose";

export interface IUserProps {
  mobile: string;
  lastOtp: string;
  otpSentOn?: string;
  email: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
  _id: mongoose.Schema.Types.ObjectId;
  verified?: boolean;
}
