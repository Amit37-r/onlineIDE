
import { Request, Response ,  NextFunction } from 'express';
import {AuthService} from "./AuthService";
import { AuthenticatedRequest } from './authtype';


export class AuthController {
private authService =  new AuthService;


async register(
     req:Request,
     res:Response,
     next:NextFunction):
     Promise<void>{
        try {

            const { name , email , password} = req.body;
            const user = await this.authService.register(name , email , password)
            res.status(201).json({
                success:true,
                message : "user registered succesfully",
                data : user
            });
            
        } catch (error) {
            next(error)
        }              
     }


async login(
    req:Request,
    res:Response,
    next:NextFunction):
    Promise<void>{
       try {
            const { email, password } = req.body ?? {};
            if (typeof email !== "string" || typeof password !== "string") {
                res.status(400).json({
                    success: false,
                    message: "Email and password are required",
                });
                return;
            }

            const user = await this.authService.login(email, password);
            if (!user) {
                res.status(401).json({
                    success: false,
                    message: "Invalid email or password",
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: "User logged in successfully",
                data: user,
            });

       }catch (error) {
        next(error)
       }

    }

async logout(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            res.status(200).json({
                success: true,
                message: "User logged out successfully",
            });
        } catch (error) {
            next(error);
        }
    }
 async getMe(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
          const userid = req.userId
     
        } catch (error) {
            next(error);
        }

    }
    

 
  }
