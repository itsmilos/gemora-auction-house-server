import express from 'express';
import { getUserAuctions, getUserBids, getUserById } from '../controllers/userControllers.js';

const router = express.Router();

router.get('/:id', getUserById);
router.get('/:id/auctions', getUserAuctions);
router.get('/:id/bids', getUserBids);

export default router;