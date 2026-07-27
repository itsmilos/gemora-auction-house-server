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
        const { title, description, startPrice, endsAt, category, imageUrl } = data;
        const currentPrice = parseFloat(startPrice);

        const auction = await prisma.auction.create({
            data: {
                title,
                description,
                startPrice: parseFloat(startPrice),
                currentPrice,
                endsAt: new Date(endsAt),
                sellerId: req.user.userId,
                category,
                imageUrl
            }
        });
        return res.status(201).json({ message: 'Auction created successfully', auction });
    } catch (error) {
        next(error);
    }
}

export const getAuctions = async (req, res, next) => {
    const { search, minPrice, maxPrice, category, sortby } = req.query;

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

    let orderBy = { endsAt: 'asc' };

    if (sortby === 'newest') {
        orderBy = { createdAt: 'desc' };
    } else if (sortby === 'price_asc') {
        orderBy = { currentPrice: 'asc' };
    } else if (sortby === "price_desc") {
        orderBy = { currentPrice: 'desc' };
    }

    try {
        const auctions = await prisma.auction.findMany({
            where,
            orderBy
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
                seller: { select: { id: true, username: true } },
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
        const auction = await prisma.auction.findUnique({ where: { id }, include: { bids: true } });
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

        if (auction.bids.length > 0) {
            const error = new Error('Cannot edit an auction that already has bids');
            error.statusCode = 403;
            return next(error);
        }

        const { success, data, error: zodError } = updateAuctionSchema.safeParse(req.body);
        if (!success) {
            const error = new Error(zodError.issues[0].message);
            error.statusCode = 400;
            return next(error);
        }

        const { title, description, startPrice, endsAt, category, imageUrl } = data;

        const updatedAuction = await prisma.auction.update({
            where: { id },
            data: {
                title: title || auction.title,
                description: description || auction.description,
                startPrice: startPrice ? parseFloat(startPrice) : auction.startPrice,
                endsAt: endsAt ? new Date(endsAt) : auction.endsAt,
                category: category || auction.category,
                imageUrl: imageUrl || auction.imageUrl,
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
        const auction = await prisma.auction.findUnique({ where: { id }, include: { bids: true } });
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

        if (auction.bids.length > 0) {
            const error = new Error('Cannot delete an auction that already has bids');
            error.statusCode = 403;
            return next(error);
        }

        await prisma.auction.delete({ where: { id } });
        return res.status(200).json({ message: 'Auction deleted successfully' });
    } catch (error) {
        next(error);
    }
}