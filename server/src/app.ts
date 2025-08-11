import express, { Express } from "express";
import cors from "cors";
import morgan from "morgan";
import modelRoutes from "./routes/model";
import tagRoutes from "./routes/tag";
import materialRoutes from "./routes/material";
import searchRoutes from "./routes/search";
import authRoutes from "./routes/auth";

const app: Express = express();

const corsOptions = {
  origin: ["http://localhost:5173", "https://heritage-hub-7h45.onrender.com"],
};

// middleware
app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(express.json());

// routes
app.use("/api/models", modelRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/auth", authRoutes);

export default app;
