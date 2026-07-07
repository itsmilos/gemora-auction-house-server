import { prisma } from "../lib/prisma.js";
import cron from "node-cron";

export async function closeExpiredAuctions() {
    const res = await prisma.auction.updateMany({
        where: {
            status: 'ACTIVE',
            endsAt: {
                lt: new Date()
            }
        },
        data: {
            status: 'ENDED'
        }
    })
}

cron.schedule('* * * * *', closeExpiredAuctions);