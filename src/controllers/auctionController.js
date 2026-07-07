import { prisma } from '../lib/prisma.js';

export const createAuction = async (req, res) => {
    try {
        const { title, description, startPrice, endsAt } = req.body;

        if (!title || !description || !startPrice || !endsAt) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const currentPrice = parseFloat(startPrice);

        const auction = await prisma.auction.create({
            data: {
                title,
                description,
                startPrice: parseFloat(startPrice),
                currentPrice,
                endsAt: new Date(endsAt),
                sellerId: req.user.userId,
            }
        });
        return res.status(201).json({ message: 'Auction created successfully', auction });
    } catch (error) {
        return res.status(500).json({ message: 'Error occurred while creating auction' });
    }
}

export const getAuctions = async (req, res) => {
    const { search, minPrice, maxPrice, sortBy, order } = req.query;

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

    try {
        const auctions = await prisma.auction.findMany({
            where,
            orderBy: { endsAt: 'asc' }
        });
        return res.status(200).json({ auctions });
    } catch (error) {
        return res.status(500).json({ message: 'Error occurred while fetching auctions' });
    }
}

export const getAuctionById = async (req, res) => {
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
            return res.status(404).json({ message: 'Auction not found' });
        }
        return res.status(200).json({ auction });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error occurred while fetching auction' });
    }
}

export const updateAuction = async (req, res) => {
    try {
        const { id } = req.params;
        const auction = await prisma.auction.findUnique({ where: { id } });
        if (!auction) {
            return res.status(404).json({ message: 'Auction not found' });
        }

        if (auction.sellerId !== req.user.userId) {
            return res.status(403).json({ message: 'You are not authorized to update this auction' });
        }

        const { title, description, startPrice, endsAt } = req.body;
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
        console.error(error);
        return res.status(500).json({ message: 'Error occurred while updating auction' });
    }
}

export const deleteAuction = async (req, res) => {
    try {
        const { id } = req.params;
        const auction = await prisma.auction.findUnique({ where: { id } });
        if (!auction) {
            return res.status(404).json({ message: 'Auction not found' });
        }

        if (auction.sellerId !== req.user.userId) {
            return res.status(403).json({ message: 'You are not authorized to delete this auction' });
        }

        await prisma.auction.delete({ where: { id } });
        return res.status(200).json({ message: 'Auction deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error occurred while deleting auction' });
    }
}

