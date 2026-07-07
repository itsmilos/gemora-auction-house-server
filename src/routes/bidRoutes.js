import express from "express";
import { placeBid, getBidsForAuction } from "../controllers/bidController.js";
import { AuthMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router({ mergeParams: true });

router.post("/", AuthMiddleware, placeBid);
router.get("/", getBidsForAuction);

export default router;