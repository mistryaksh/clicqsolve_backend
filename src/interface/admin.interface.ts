import mongoose from "mongoose";

export interface IAdminProps {
     name: string;
     email: string;
     mobile: string;
     password: string;
     createdAt?: Date;
     updatedAt?: Date;
     _id?: mongoose.Schema.Types.ObjectId;
}
