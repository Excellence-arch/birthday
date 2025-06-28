// middleware/auth.middleware.ts
import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import accountModel from "../models/account.model";
import { IAccount, IAccountRequest } from "../interfaces/Account.interface";

// declare global {
//   namespace Express {
//     interface Request {
//       user: any; // Replace 'any' with your user type if you have one
//     }
//   }
// }

const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  // console.log(req.headers);
  const token = req.headers.authorization?.split(" ")[1];
  // console.log(token);
  if (!token) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    // console.log("Decoded token:", decoded);
    
    // Verify the user exists in the database
    const user: IAccountRequest | null = await accountModel.findById(decoded._id);
    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }
    
    req.user = user; // Attach user info to request object
    next();
  } catch (error) {
    // console.error("Authentication error:", error);
    if(error instanceof jwt.JsonWebTokenError) {
      // Handle specific JWT errors
      if (error.name === 'TokenExpiredError') {
        res.status(401).json({ message: "Token expired" });
        return;
      }
      if (error.name === 'JsonWebTokenError') {
        res.status(401).json({ message: "Invalid token" });
        return;
      }
    }
    res.status(401).json({ message: "Invalid token" });
    return;
  }
}

export default authenticate;