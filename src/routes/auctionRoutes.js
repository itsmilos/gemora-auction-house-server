import express from "express";
import { createAuction, getAuctions, getAuctionById, updateAuction, deleteAuction } from "../controllers/auctionController.js";
import { AuthMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", AuthMiddleware, createAuction);
router.get("/", getAuctions);
router.get("/:id", getAuctionById);
router.put("/:id", AuthMiddleware, updateAuction);
router.delete("/:id", AuthMiddleware, deleteAuction);

export default router;