import { Router } from "express";
import { redirectCAS, validateCASTicket } from "../controllers/auth";

const router = Router();

router.get("/login", redirectCAS);
router.get("/callback", validateCASTicket);

export default router;
