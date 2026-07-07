import { prisma } from "../lib/prisma.js";
import { io } from "../../server.js";

export const placeBid = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        const auction = await prisma.auction.findUnique({ where: { id } });
        if (!auction) {
            return res.status(404).json({ message: 'Auction not found' });
        }
        if (auction.status !== 'ACTIVE') {
            return res.status(400).json({ message: 'Auction is not active' });
        }
        if (auction.endsAt < new Date()) {
            return res.status(400).json({ message: 'Auction has already ended' });
        }
        if (auction.sellerId === userId) {
            return res.status(400).json({ message: 'You cannot bid on your own auction' });
        }
        const { amount } = req.body;
        if (!amount || parseFloat(amount) <= parseFloat(auction.currentPrice)) {
            return res.status(400).json({ message: 'Bid amount must be greater than current price' });
        }
        const timeToEnd = auction.endsAt - new Date();
        const fiveMinutes = 5 * 60 * 1000;
        const newEndsAt = timeToEnd <= fiveMinutes ? new Date(Date.now() + 60 * 1000) : auction.endsAt;

        const [bid, updatedAuction] = await prisma.$transaction([
            prisma.bid.create({
                data: { amount, auctionId: id, bidderId: userId }
            }),
            prisma.auction.update({
                where: { id },
                data: { currentPrice: parseFloat(amount), endsAt: newEndsAt }
            })
        ]);
        io.to(id).emit('new-bid', { bid, currentPrice: updatedAuction.currentPrice });
        return res.status(201).json({ message: 'Bid placed successfully', bid });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error occurred while placing bid' });
    }
}

export const getBidsForAuction = async (req, res) => {
    try {
        const { id } = req.params;
        const bids = await prisma.bid.findMany({
            where: { auctionId: id },
            orderBy: { amount: 'desc' },
            include: { bidder: { select: { username: true } } }
        });
        return res.status(200).json({ bids });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error occurred while fetching bids' });
    }
}