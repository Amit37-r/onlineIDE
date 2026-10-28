 import jwt from "jsonwebtoken";
const secretkey = process.env.JWT_SECRET_KEY
 
 
 
 export const createAuthToken = (userId: string): string => {
  return jwt.sign({}, secretkey, {
    subject: userId,
    expiresIn: "7d",
  });
};