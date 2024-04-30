import { Request, Response } from "express";
import { IAdminProps, IController, IControllerRoutes } from "interface";
import { Admin } from "model";
import {
  comparePassword,
  hashPassword,
  Ok,
  SignAdminToken,
  UnAuthorized,
} from "utils";

export class AuthAdminController implements IController {
  public routes: IControllerRoutes[] = [];

  constructor() {
    this.routes.push({
      handler: this.SignUpAdmin,
      method: "POST",
      path: "/admin/sign-up",
    });
    this.routes.push({
      handler: this.SignInAdmin,
      method: "POST",
      path: "/admin/sign-in",
    });
  }

  public async SignUpAdmin(req: Request, res: Response) {
    try {
      const { email, mobile, name, password }: IAdminProps = req.body;

      if (!email || !mobile || !name || !password) {
        return UnAuthorized(res, "missing credentials");
      }

      const userEmail = await Admin.findOne({ email });
      const userMobile = await Admin.findOne({ mobile });

      if (userEmail || userMobile) {
        return UnAuthorized(res, "email / mobile is already in use");
      }

      const bcryptPassword = hashPassword(password);

      const newAdmin = await new Admin({
        password: bcryptPassword,
        email,
        mobile,
        name,
      }).save();

      const message: string = `${newAdmin.name} is registered`;
      return Ok(res, message);
    } catch (err) {
      console.log(err);
      return UnAuthorized(res, err);
    }
  }

  public async SignInAdmin(req: Request, res: Response) {
    try {
      const { mobile, password } = req.body;

      if (!mobile || !password) {
        return UnAuthorized(res, "invalid credentials");
      }

      const user = await Admin.findOne({ mobile });

      if (!user) {
        return UnAuthorized(res, "no user found");
      }

      if (!comparePassword(password, user.password)) {
        return UnAuthorized(res, "invalid password");
      }

      const token = SignAdminToken(user.id);
      return Ok(res, {
        message: `${user.name} is logged in`,
        token,
      });
    } catch (err) {
      return UnAuthorized(res, err);
    }
  }

  public async SignOutAdmin(req: Request, res: Response) {
    try {
      res.removeHeader("Authorization");
      return Ok(res, "LOGGED_OUT");
    } catch (err) {
      return UnAuthorized(res, err);
    }
  }
}
