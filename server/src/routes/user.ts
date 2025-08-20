import { Router } from "express";
import { exchangeOneTimeCode, getCurrentUser, deleteUserSession } from "../controllers/user";

const router = Router();

router.get("/me", getCurrentUser);
router.post("/otc", exchangeOneTimeCode);
router.post("/logout", deleteUserSession);

export default router;
