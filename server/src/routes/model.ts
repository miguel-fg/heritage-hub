import { Router } from "express";
import {
  getModels,
  getModel,
  newModel,
  updateModel,
  getModelThumbnailUrl,
  getModelObjectUrl,
  getModelUploadUrl,
  deleteModel,
} from "../controllers/model";
import { validateBody } from "../middleware/validate";
import { modelSchema } from "../scripts/validators";

const router = Router();

router.get("/", getModels);
router.get("/:id", getModel);
router.get("/:id/thumbnail-url", getModelThumbnailUrl);
router.get("/:id/object", getModelObjectUrl);

router.post("/", validateBody(modelSchema), newModel);
router.post("/update", validateBody(modelSchema), updateModel);
router.post("/upload-url", getModelUploadUrl);

router.delete("/:id", deleteModel);

export default router;
