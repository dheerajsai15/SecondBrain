import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { ContentModel, LinkModel, UserModel } from "./db.js";
import { JWT_PASSWORD } from "./config.js"
import { userMiddleware } from "./middleware.js";
import { random } from "./utils.js";
import cors from "cors";

const app =  express();
app.use(express.json());
app.use(cors());

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
    const type = req.body.type;
    //@ts-ignore
    const userId = req.userId;
    await ContentModel.create({
        title,
        link,
        type,
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
        _id: contentId,
        userId: req.userId
    })

    res.json({
        message: "Content deleted"
    })
})

app.post("/api/v1/brain/share",userMiddleware,async (req,res) => {
    const share = req.body.share;
    if(share){
        const existingLink = await LinkModel.findOne({
            userId: req.userId
        })
        if(existingLink){
            res.json({
                message: "/share/" + existingLink.hash,
                hash: existingLink.hash
            })
        }
        else{
            const hash = random(10)
            await LinkModel.create({
                userId: req.userId,
                hash: hash
            })

            res.json({
                message: "/share/" + hash,
                hash: hash
            })
        }
    } else{
        await LinkModel.deleteOne({
            userId: req.userId
        })

        res.json({
            message: "removed link"
        })
    }
})

app.get("/api/v1/brain/:shareLink",async (req,res) => {
    const hash = req.params.shareLink;

    const link = await LinkModel.findOne({
        hash
    })

    if(!link){
        res.status(411).json({
            message: "Sorry Incorrect Input"
        })
        return;
    }

    const content = await ContentModel.find({
        userId: link.userId
    })

    const user = await UserModel.findOne({
        _id: link.userId
    })

    res.json({
        username: user?.username,
        content: content
    })
})

app.listen(3000)