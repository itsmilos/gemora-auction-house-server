import { prisma } from "../lib/prisma.js";

export const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                username: true,
                createdAt: true,
            }
        });
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            return next(error);
        }
        return res.status(200).json({ user });
    } catch (error) {
        next(error);
    }
}

export const getUserAuctions = async (req, res, next) => {
    const { id } = req.params;
    const { search, minPrice, maxPrice, category } = req.query;

    const where = {
        sellerId: id,
    };

    if (search) {
        where.title = { contains: search, mode: 'insensitive' };
    }

    if (minPrice || maxPrice) {
        where.currentPrice = {};
        if (minPrice) where.currentPrice.gte = parseFloat(minPrice);
        if (maxPrice) where.currentPrice.lte = parseFloat(maxPrice);
    }

    if (category) {
        where.category = category;
    }

    try {
        const auctions = await prisma.auction.findMany({
            where,
            orderBy: { endsAt: 'asc' }
        });
        return res.status(200).json({ auctions });
    } catch (error) {
        next(error);
    }
}

export const getUserBids = async (req, res, next) => {
    try {
        const { id } = req.params;
        const bids = await prisma.bid.findMany({ where: { bidderId: id }, include: { auction: { select: { id: true, title: true, currentPrice: true, status: true } } } });
        return res.status(200).json({ bids });
    } catch (error) {
        return next(error);
    }
}

