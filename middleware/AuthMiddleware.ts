import {Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../controller/Auth/authtype'
import jwt from 'jsonwebtoken';



export const AuthMiddleware = (
      req: AuthenticatedRequest,
      res: Response, 
      next: NextFunction) => {

const authHeader = req.headers.authorization;
if (!authHeader) {
    return res.status(401).json({
        success: false,
        message: "Authorization header is missing",
    });
 }

 const token = authHeader.split(" ")[1];
 const secretkey = process.env.JWT_SECRET_KEY;
  if (!secretkey) {
    res.status(500).json({ message: "Server configuration error" });
    return;
  }
try {
   // Verify the token
    const decoded = jwt.verify(token, secretkey);

    // Check the payload
    if (
      typeof decoded === "string" ||
      typeof decoded.sub !== "string"
    ) {
      res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
      return;
    }

    //  checking weather userID is present in the payload or not
    req.userId = decoded.sub;
    next();

}catch{
      res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
}

} 