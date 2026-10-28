import { createHmac, timingSafeEqual } from "node:crypto";
import { AuthAccesser } from "./Authacesser";
import { createAuthToken} from "./helper";

  

 

 

export class AuthService {



    async register(name: string, email: string, password: string): Promise<any> {
     // check weather user already exist or not 

     const user = await new AuthAccesser().findByEmail(email);
     if(user){
        throw new Error("user already exist");
     }
       // Replace this with actual user creation logic

       else {
        const newUser = await new AuthAccesser().createUser(name, email, password);
        return newUser;
       }
        
    }

   async login(email: string, password: string) {
      const user = await new AuthAccesser().findByEmail(email);
      if (!user || user.password !== password) {
         return null;
      }

      return {
         user: {
            id: user.id,
            name: user.name,
            email: user.email,
         },
         token: createAuthToken(String(user.id)),
      };
   }

   
}