import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import notificationRoutes from "./routes/notification.route.js";

import connectMongoBD from "./db/connectDB.js";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.ClOUDINARY_CLOUD_NAME,
  api_key: process.env.ClOUDINARY_API_KEY,
  api_secret: process.env.ClOUDINARY_API_SECRET,
});

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json({ limit: "6mb" })); //to get body data
app.use(express.urlencoded({ extended: true })); //to parse form data
app.use(cookieParser()); //to parse cookies
app.use(
  cors({
    origin: "https://678ddc2d80a976374699f53b--legendary-churros-cab1af.netlify.app/", // Replace with your frontend's URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // If you need cookies or authentication headers
  })
);
app.use("/api/auth", authRoutes); //to use auth routes
app.use("/api/users", userRoutes); //to use user routes
app.use("/api/posts", postRoutes); //to use post routes
app.use("/api/notifications", notificationRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  connectMongoBD();
});
