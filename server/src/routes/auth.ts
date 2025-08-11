import { Router } from "express";
import { redirectCAS, validateCASTicket } from "../controllers/auth";

const router = Router();

router.get("/cas/login", redirectCAS);
router.get("/cas/callback", validateCASTicket);

export default router;
