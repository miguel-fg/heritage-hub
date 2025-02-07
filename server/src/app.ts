import express, { Express } from "express";
import cors from "cors";
import morgan from "morgan";

const app: Express = express();

const corsOptions = {
    origin: "http://localhost:5173"
};


// middleware
app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(express.json());

export default app;
