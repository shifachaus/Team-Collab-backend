import jwt, { SignOptions } from "jsonwebtoken";
import { UserDocument } from "../models/user.model";
import { config } from "../config/app.config";



export type AccessTPayload = {
  userId: UserDocument["_id"];
};

type SignOptionAndSecret = SignOptions & {
  secret: string;
};

const defaults: SignOptions = {
  audience: ["User"],
};

export const accessTokenSignOption: SignOptionAndSecret = {
  expiresIn:'1d',
  secret: config.JWT_SECRET,
};


export const signJwtToken = (
  payload: AccessTPayload,
  options?: SignOptionAndSecret
) => {
  const { secret, ...opts } = options || accessTokenSignOption;
  
  return jwt.sign(payload, secret, {
    ...defaults,
    ...opts,
  });
};
