import { Request, Response } from "express";
import { IControllerRoutes, IController, IUserProps } from "interface";
import { TwilioService } from "services/twilio.service";
import { Ok, UnAuthorized } from "utils";
import jwt from "jsonwebtoken";
import { User } from "model";
import { LoginRequired } from "middleware";
import config from "config";

export class UserAuthController implements IController {
  public routes: IControllerRoutes[] = [];

  constructor() {
    this.routes.push({
      handler: this.RegisterUser,
      method: "POST",
      path: "/new-user",
    });
    this.routes.push({
      path: "/send-otp",
      handler: this.SentOtp,
      method: "POST",
    });
    this.routes.push({
      path: "/verify-otp",
      handler: this.VerifyOtp,
      method: "POST",
    });
    this.routes.push({
      path: "/remove-auth",
      handler: this.RemoveAuthentication,
      method: "POST",
      middleware: [LoginRequired],
    });
    this.routes.push({
      path: "/profile",
      handler: this.GetUserProfile,
      method: "GET",
      middleware: [LoginRequired],
    });
    this.routes.push({
      handler: this.UpdateProfile,
      method: "PUT",
      path: "/update-profile",
      middleware: [LoginRequired],
    });
  }

  public async RegisterUser(req: Request, res: Response) {
    try {
      const { mobile, email, name }: IUserProps = req.body;
      const userMobile = await User.findOne({ mobile });
      const userEmail = await User.findOne({ email });

      if (userEmail) {
        return UnAuthorized(res, "try with different email");
      }

      if (userMobile) {
        return UnAuthorized(res, "try with different mobile");
      }

      const newUser = await new User({
        email,
        mobile,
        name,
        verified: false,
      }).save();

      return Ok(res, `OTP sent on ${newUser.mobile}`);
    } catch (err) {
      return UnAuthorized(res, err);
    }
  }

  public async SentOtp(req: Request, res: Response) {
    try {
      const { mobile }: { mobile: string } = req.body;
      const user = await User.findOne({ mobile });
      if (!user) {
        return UnAuthorized(res, "no user found");
      }
      const otp = await TwilioService.SendOtp(mobile.trim());
      await User.findOneAndUpdate(
        { mobile: user.mobile },
        { $set: { otpSentOn: new Date().toString() } }
      );

      if (otp.status === "pending") {
        return Ok(res, `otp has been sent to ${mobile}`);
      }
    } catch (err) {
      console.log(err);
      return UnAuthorized(res, err);
    }
  }

  public async VerifyOtp(req: Request, res: Response) {
    try {
      const { mobile, otp } = req.body;
      const user = await User.findOne({ mobile });
      if (!user) {
        return UnAuthorized(res, "no user found");
      }
      const otpService = await TwilioService.VerifyOtp({ mobile, otp });
      if (otpService.status === "approved") {
        await User.findOneAndUpdate(
          { mobile: user.mobile },
          { $set: { lastOtp: otp } }
        );

        const token = jwt.sign(
          {
            id: user._id,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: process.env.JWT_EXPIRE,
          }
        );
        return Ok(res, {
          token,
          credential: {
            mobile,
            message: `verified on ${user.otpSentOn} for mobile no ${user.mobile}`,
          },
        });
      }
    } catch (err) {
      return UnAuthorized(res, err);
    }
  }

  public async RemoveAuthentication(req: Request, res: Response) {
    try {
      res.removeHeader("Authorization");
      return Ok(res, "LOGGED_OUT");
    } catch (err) {
      return UnAuthorized(res, err);
    }
  }

  public async GetUserProfile(req: Request, res: Response) {
    try {
      const verifiedToken = jwt.verify(
        req.headers.authorization,
        config.get("JWT_SECRET")
      ) as any;
      const user = await User.findById({ _id: verifiedToken.id });
      return Ok(res, user);
    } catch (err) {
      console.log(err);
      return UnAuthorized(res, err);
    }
  }

  public async UpdateProfile(req: Request, res: Response) {
    try {
      const verifiedToken = jwt.verify(
        req.headers.authorization,
        config.get("JWT_SECRET")
      ) as any;
      const user = await User.findById({ _id: verifiedToken.id });
      if (user) {
        await User.findByIdAndUpdate(
          { _id: verifiedToken.id },
          { $set: { ...req.body } }
        );
        return Ok(res, "PROFILE_UPDATED");
      }
    } catch (err) {
      return UnAuthorized(res, err);
    }
  }
}
