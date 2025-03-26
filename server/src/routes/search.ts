import { Router } from "express";

import { searchModels } from "../controllers/search";

const router = Router();

router.get("/", searchModels);

export default router;
