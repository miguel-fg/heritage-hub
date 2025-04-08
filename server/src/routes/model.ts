import { Router } from "express";
import {
  getModels,
  getModel,
  newModel,
  getModelThumbnailUrl,
  getModelObjectUrl,
  getModelUploadUrl,
  deleteModel,
} from "../controllers/model";

const router = Router();

router.get("/", getModels);
router.get("/:id", getModel);
router.get("/:id/thumbnail-url", getModelThumbnailUrl);
router.get("/:id/object", getModelObjectUrl);

router.post("/", newModel);
router.post("/upload-url", getModelUploadUrl);

router.delete("/:id", deleteModel);

export default router;
