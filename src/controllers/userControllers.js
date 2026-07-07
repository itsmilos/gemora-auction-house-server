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