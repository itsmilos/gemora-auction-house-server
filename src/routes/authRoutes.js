import express from "express";
import { register, login, getUser } from "../controllers/authController.js";
import { AuthMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get('/me', AuthMiddleware, getUser)

export default router;