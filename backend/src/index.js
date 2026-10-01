// require('dotenv').config({path:'./env'});
import dotenv from "dotenv";
import mongoose from "mongoose";
import { DB_NAME } from "./constant.js";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: './.env'
});

app.on("error", (error)=>{
    console.log("Express application error", error);
    throw error;
})

connectDB()
.then(() =>{
    const port = process.env.PORT || 8000;
    app.listen(port, () => {
    console.log(` Server is running at port : ${port}`);
});
})
.catch((error)=> {
    console.log("MONGODB connection failed", error);
})