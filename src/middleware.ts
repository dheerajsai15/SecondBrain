import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"
import { JWT_PASSWORD } from "./config.js";

export const userMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const headers = req.headers["authorization"];
    const decoded = jwt.verify(headers as string,JWT_PASSWORD);
    if(decoded){
        //@ts-ignore
        req.userId = decoded.id;
        next();
    }else{
        res.status(403).json({
            message: "You are not logged in"
        })
    }
}