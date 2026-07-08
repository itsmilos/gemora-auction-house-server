import { prisma } from '../lib/prisma.js';
import { createAuctionSchema, updateAuctionSchema } from '../schemas/auctionSchemas.js';

export const createAuction = async (req, res, next) => {
    const { success, data, error } = createAuctionSchema.safeParse(req.body);
    if (!success) {
        const err = new Error(error.issues[0].message);
        err.statusCode = 400;
        return next(err);
    }
    try {
        const { title, description, startPrice, endsAt, category } = data;
        const currentPrice = parseFloat(startPrice);

        const auction = await prisma.auction.create({
            data: {
                title,
                description,
                startPrice: parseFloat(startPrice),
                currentPrice,
                endsAt: new Date(endsAt),
                sellerId: req.user.userId,
                category
            }
        });
        return res.status(201).json({ message: 'Auction created successfully', auction });
    } catch (error) {
        next(error);
    }
}

export const getAuctions = async (req, res, next) => {
    const { search, minPrice, maxPrice, category } = req.query;

    const where = {
        status: 'ACTIVE',
        endsAt: { gt: new Date() },
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

export const getAuctionById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const auction = await prisma.auction.findUnique({
            where: { id },
            include: {
                seller: { select: { username: true } },
                bids: { orderBy: { amount: 'desc' } }
            }
        });
        if (!auction) {
            const error = new Error('Auction not found');
            error.statusCode = 404;
            return next(error);
        }
        return res.status(200).json({ auction });
    } catch (error) {
        next(error);
    }
}

export const updateAuction = async (req, res, next) => {
    try {
        const { id } = req.params;
        const auction = await prisma.auction.findUnique({ where: { id } });
        if (!auction) {
            const error = new Error('Auction not found');
            error.statusCode = 404;
            return next(error);
        }

        if (auction.sellerId !== req.user.userId) {
            const error = new Error('You are not authorized to update this auction');
            error.statusCode = 403;
            return next(error);
        }

        const { success, data, error: zodError } = updateAuctionSchema.safeParse(req.body);
        if (!success) {
            const error = new Error(zodError.issues[0].message);
            error.statusCode = 400;
            return next(error);
        }

        const { title, description, startPrice, endsAt } = data;
        const updatedAuction = await prisma.auction.update({
            where: { id },
            data: {
                title: title || auction.title,
                description: description || auction.description,
                startPrice: startPrice ? parseFloat(startPrice) : auction.startPrice,
                endsAt: endsAt ? new Date(endsAt) : auction.endsAt,
            }
        });
        return res.status(200).json({ message: 'Auction updated successfully', auction: updatedAuction });
    } catch (error) {
        next(error);
    }
}

export const deleteAuction = async (req, res, next) => {
    try {
        const { id } = req.params;
        const auction = await prisma.auction.findUnique({ where: { id } });
        if (!auction) {
            const error = new Error('Auction not found');
            error.statusCode = 404;
            return next(error);
        }

        if (auction.sellerId !== req.user.userId) {
            const error = new Error('You are not authorized to delete this auction');
            error.statusCode = 403;
            return next(error);
        }

        await prisma.auction.delete({ where: { id } });
        return res.status(200).json({ message: 'Auction deleted successfully' });
    } catch (error) {
        next(error);
    }
}