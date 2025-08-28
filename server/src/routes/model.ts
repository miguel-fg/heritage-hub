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
import { validateBody, validateUploadPermissions, validateModifyPermissions } from "../middleware/validate";
import { authGuard } from "../middleware/authGuard";
import { modelSchema } from "../scripts/validators";

const router = Router();

router.get("/", getModels);
router.get("/:id", getModel);
router.get("/:id/thumbnail-url", getModelThumbnailUrl);
router.get("/:id/object", getModelObjectUrl);

router.post("/", authGuard, validateUploadPermissions, validateBody(modelSchema), newModel);
router.post("/upload-url", authGuard, validateUploadPermissions, getModelUploadUrl);

router.put("/:id", authGuard, validateModifyPermissions, validateBody(modelSchema), updateModel);
router.delete("/:id", authGuard, validateModifyPermissions, deleteModel);

export default router;
