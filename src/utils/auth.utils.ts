import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import config from "config";

export const hashPassword = (password: string) => {
     return bcrypt.hashSync(password, 10);
};
export const comparePassword = (password: string, hashed: string) => {
     return bcrypt.compareSync(password, hashed);
};

export const SignAdminToken = (id: string) => {
     return jwt.sign(
          {
               id: id,
          },
          process.env.JWT_SECRET || config.get("JSONWEBTOKENSECRET") || config.get("3d"),
          { expiresIn: "30d" }
     );
};

export const VerifyAdminToken = (token: string) => {
     return jwt.verify(token, process.env.JWT_SECRET || config.get("JSONWEBTOKENSECRET") || config.get("3d"));
};
