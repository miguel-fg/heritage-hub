import { Router } from "express";
import { authGuard } from "../middleware/authGuard";
import { exchangeOneTimeCode, getCurrentUser, patchUser, deleteUserSession, getAllUsers, patchUsers } from "../controllers/user";

const router = Router();

router.get("/me", authGuard, getCurrentUser);
router.patch("/me", authGuard, patchUser);

router.get("/all", authGuard, getAllUsers);
router.patch("/all", authGuard, patchUsers);

router.post("/otc", exchangeOneTimeCode);
router.post("/logout", deleteUserSession);

export default router;
