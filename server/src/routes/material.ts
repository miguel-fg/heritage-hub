import { Router } from "express";
import { getMaterials } from "../controllers/material";

const router = Router();

router.get("/", getMaterials);

export default router;
