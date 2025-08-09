import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { ContentModel, UserModel } from "./db.js";
import { JWT_PASSWORD } from "./config.js"
import { userMiddleware } from "./middleware.js";

const app =  express();
app.use(express.json())

app.post("/api/v1/signup", async (req,res) => {
    // add zod validation
    const username = req.body.username;
    const password = req.body.password;

    try{
        await UserModel.create({
            username,
            password
        })

        res.json({
            message: "User signed up"
        })
    } catch(e){
        res.status(411).json({
            message: "User already exits"
        })
    }
})

app.post("/api/v1/signin", async (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    const existingUser = await UserModel.findOne({
        username,
        password
    })
    if(existingUser){
        const token = jwt.sign({
            id: existingUser._id
        }, JWT_PASSWORD);

        res.json({
            token
        })
    }
    else{
        res.status(403).json({
            message: "Incorrect credentials"
        })
    }
})

app.post("/api/v1/content",userMiddleware,async (req,res) => {
    const link = req.body.link;
    const title = req.body.title;
    //@ts-ignore
    const userId = req.userId;
    await ContentModel.create({
        title,
        link,
        tags: [],
        userId
    })
    res.json({
        message: "Content Added"
    })
})

app.get("/api/v1/content", userMiddleware,async (req,res) => {
    //@ts-ignore
    const userId = req.userId;
    const content = await ContentModel.find({
        userId
    }).populate("userId", "username")

    res.json({
        content
    })

})

app.delete("/api/v1/content", userMiddleware, async (req,res) => {
    const contentId = req.body.contentId;

    await ContentModel.deleteOne({
        contentId,
        //@ts-ignore
        userId: req.userId
    })

    res.json({
        message: "Content deleted"
    })
})

app.post("/api/v1/brain/share", (req,res) => {

})

app.get("/api/v1/brain/:shareLink", (req,res) => {

})

app.listen(3000)