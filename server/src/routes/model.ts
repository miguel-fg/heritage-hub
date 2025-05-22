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
import { validateBody } from "../middleware/validate";
import { newModelSchema } from "../scripts/validators";

const router = Router();

router.get("/", getModels);
router.get("/:id", getModel);
router.get("/:id/thumbnail-url", getModelThumbnailUrl);
router.get("/:id/object", getModelObjectUrl);

router.post("/", validateBody(newModelSchema), newModel);
router.post("/upload-url", getModelUploadUrl);

router.delete("/:id", deleteModel);

export default router;
