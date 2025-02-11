import { Router } from "express";
import { getModels, getModel, newModel } from "../controllers/model";

const router = Router();

router.get("/", getModels);
router.get("/:id", getModel);
router.post("/", newModel);

export default router;
