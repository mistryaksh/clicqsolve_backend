import bodyParser from "body-parser";
import express, { Express } from "express";
import mongoose from "mongoose";
import config from "config";
import cors from "cors";
import morgan from "morgan";
import { errorHandler, notFoundMiddleware } from "./middleware";
import { registerRoutesV1 } from "api";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();

class App {
     express: Express;

     constructor() {
          this.express = express();
          this.middleware();
          this.connectDb();
          this.routes();
          this.useErrorHandler();
          this.useNotFoundMiddleware();
     }

     // Configure Express middleware.
     private middleware(): void {
          this.express.use(bodyParser.json());
          this.express.use(express.json());
          this.express.use(bodyParser.urlencoded({ extended: true }));

          this.express.use(
               cors({
                    origin: "*",
                    credentials: true,
               })
          );
          this.express.use(cookieParser());
          this.express.use(morgan("dev"));
     }

     private useErrorHandler() {
          this.express.use(errorHandler);
     }

     private useNotFoundMiddleware() {
          this.express.use(notFoundMiddleware);
     }

     private routes(): void {
          registerRoutesV1(this.express);
     }

     private async connectDb() {
          try {
               await mongoose.connect(process.env.DB_PATH || config.get("DB_PATH"));
               console.log("database connected");
          } catch (err) {
               return console.log(err);
          }
     }
}

const app = new App();
const server = app.express;

export default server;
