import express from "express";

import dotenv from "dotenv";
import connectMongoDb from './db/connectMongoDb.js'
import authRoutes from "./routes/auth.routes.js";
const app = express();

dotenv.config();
const PORT = process.env.PORT || 5000;

app.use("/api/auth", authRoutes)



app.listen( PORT, () => {
    console.log("Server is running");
    connectMongoDb();
})