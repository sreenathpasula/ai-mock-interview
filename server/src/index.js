import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import routes from "./routes/index.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ updated CORS — allow both local and deployed frontend
// app.use(
//   cors({
//     origin: [
//       "http://localhost:5173",
//       "https://ai-mock-interview-livid-one.vercel.app",
//     ],
//     credentials: true,
//   })
// );

app.use(
  cors({
    origin: "*",
    credentials: false,
  })
);

app.use(express.json());
app.use("/api", routes);

app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Server Error",
  });
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connection successfully");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });
