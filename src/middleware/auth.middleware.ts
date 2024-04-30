import { NextFunction, Request, Response } from "express";
import { UnAuthorized } from "utils";

export const LoginRequired = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.headers.authorization.length) {
      return UnAuthorized(res, `LOGIN_REQUIRED`);
    }
    next();
  } catch (err) {
    return UnAuthorized(res, err);
  }
};
