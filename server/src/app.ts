import express, { Express } from "express";
import cors from "cors";
import morgan from "morgan";
import modelRoutes from "./routes/model";

const app: Express = express();

const corsOptions = {
  origin: "http://localhost:5173",
};

// middleware
app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(express.json());

app.use("/api/models", modelRoutes);

export default app;
