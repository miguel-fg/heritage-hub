import { Router } from "express";
import { authGuard } from "../middleware/authGuard";
import { exchangeOneTimeCode, getCurrentUser, patchUser, deleteUserSession } from "../controllers/user";

const router = Router();

router.get("/me", authGuard, getCurrentUser);
router.patch("/me", authGuard, patchUser);
router.post("/otc", exchangeOneTimeCode);
router.post("/logout", deleteUserSession);

export default router;
