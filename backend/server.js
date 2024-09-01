import express from "express";

import dotenv from "dotenv";
import connectMongoDb from './db/connectMongoDb.js'
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import postRoutes from "./routes/post.routes.js";
import notificationRoutes from "./routes/notification.routes.js";


import {v2 as cloudinary} from "cloudinary"
import cookieParser from "cookie-parser";
const app = express();

dotenv.config();
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

const PORT = process.env.PORT || 5000;

app.use(express.json({limit:"5mb"}));
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());


app.use("/api/auth", authRoutes)
app.use("/api/user", userRoutes)
app.use("/api/post", postRoutes)
app.use("/api/notification", notificationRoutes)






app.listen( PORT, () => {
    console.log("Server is running");
    connectMongoDb();
})