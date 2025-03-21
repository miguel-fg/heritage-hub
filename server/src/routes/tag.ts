import { Router } from "express";
import { getTags } from "../controllers/tag";

const router = Router();

router.get("/", getTags);

export default router;
