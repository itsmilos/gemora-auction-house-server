import { prisma } from "../lib/prisma.js";
import { io } from "../../server.js";
import { bidSchema } from "../schemas/bidSchemas.js";

export const placeBid = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        const auction = await prisma.auction.findUnique({ where: { id } });
        if (!auction) {
            const error = new Error('Auction not found');
            error.statusCode = 404;
            return next(error);
        }
        if (auction.status !== 'ACTIVE') {
            const error = new Error('Auction is not active');
            error.statusCode = 400;
            return next(error);
        }
        if (auction.endsAt < new Date()) {
            const error = new Error('Auction has already ended');
            error.statusCode = 400;
            return next(error);
        }
        if (auction.sellerId === userId) {
            const error = new Error('You cannot bid on your own auction');
            error.statusCode = 400;
            return next(error);
        }
        const { success, data, error: zodError } = bidSchema.safeParse(req.body);
        if (!success) {
            const error = new Error(zodError.issues[0].message);
            error.statusCode = 400;
            return next(error);
        }
        const { amount } = data;
        if (!amount || parseFloat(amount) <= parseFloat(auction.currentPrice)) {
            const error = new Error('Bid amount must be greater than current price');
            error.statusCode = 400;
            return next(error);
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
        const bidWithUser = await prisma.bid.findUnique({
            where: { id: bid.id },
            include: {
                bidder: {
                    select: {
                        username: true
                    }
                }
            }
        });

        io.to(id).emit('new-bid', {
            bid: bidWithUser,
            currentPrice: updatedAuction.currentPrice
        });
        return res.status(201).json({ message: 'Bid placed successfully', bid });
    } catch (error) {
        return next(error);
    }
}

export const getBidsForAuction = async (req, res, next) => {
    try {
        const { id } = req.params;
        const bids = await prisma.bid.findMany({
            where: { auctionId: id },
            orderBy: { amount: 'desc' },
            include: { bidder: { select: { username: true } } }
        });
        return res.status(200).json({ bids });
    } catch (error) {
        return next(error);
    }
}