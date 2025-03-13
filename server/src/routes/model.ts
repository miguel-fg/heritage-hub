import { Router } from "express";
import {
  getModels,
  getModel,
  newModel,
  getModelThumbnailUrl,
  getModelObjectUrl,
} from "../controllers/model";

const router = Router();

router.get("/", getModels);
router.get("/:id", getModel);
router.get("/:id/thumbnail-url", getModelThumbnailUrl);
router.get("/:id/object", getModelObjectUrl);
router.post("/", newModel);

export default router;
