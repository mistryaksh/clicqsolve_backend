import { IAdminProps } from "interface";
import mongoose from "mongoose";

const string = { type: mongoose.Schema.Types.String, required: true };

const AdminSchema = new mongoose.Schema<IAdminProps>(
     {
          email: string,
          mobile: string,
          name: string,
          password: string,
     },
     {
          timestamps: true,
     }
);

export const Admin = mongoose.model<IAdminProps>("Admin", AdminSchema);
