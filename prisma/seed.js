import { PrismaClient } from "../src/generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const auctions = [
    { title: "Classic Porsche 911 (1978)", category: "VEHICLES", description: "Well-preserved rare model, perfect for collectors." },
    { title: "Vintage Volkswagen Beetle (1965)", category: "VEHICLES", description: "Fully restored, original engine, runs smoothly." },
    { title: "Rolex Submariner (1985)", category: "WATCHES", description: "Iconic diver's watch, excellent condition." },
    { title: "Omega Speedmaster Professional", category: "WATCHES", description: "The legendary moonwatch, box and papers included." },
    { title: "Original Oil Painting - Countryside", category: "ART", description: "Signed original piece from a mid-century artist." },
    { title: "Bronze Sculpture - Abstract Form", category: "ART", description: "Rare bronze casting, one of a limited series." },
    { title: "Antique Oak Writing Desk", category: "FURNITURE", description: "Solid oak, hand-carved details, 19th century." },
    { title: "Victorian Armchair", category: "FURNITURE", description: "Reupholstered, original wooden frame." },
    { title: "First Edition Harry Potter and the Philosopher's Stone", category: "BOOKS", description: "Rare first print, excellent condition." },
    { title: "Signed Copy of The Hobbit", category: "BOOKS", description: "Collector's edition with author signature." },
    { title: "Vintage Leica M3 Camera", category: "CAMERAS", description: "Classic rangefinder camera, fully functional." },
    { title: "Polaroid SX-70 Land Camera", category: "CAMERAS", description: "Iconic instant camera, tested and working." },
    { title: "Art Deco Diamond Ring", category: "JEWELRY", description: "1920s design, certified diamond." },
    { title: "Antique Pearl Necklace", category: "JEWELRY", description: "Natural pearls, gold clasp, early 20th century." },
    { title: "Gibson Les Paul 1959 Reissue", category: "MUSIC_INSTRUMENTS", description: "Highly sought-after reissue model." },
    { title: "Vintage Fender Stratocaster", category: "MUSIC_INSTRUMENTS", description: "Classic tone, well-maintained original parts." },
    { title: "Aston Martin DB5 (1964)", category: "VEHICLES", description: "Iconic British sports car, matching numbers." },
    { title: "Vespa 150 Scooter (1962)", category: "VEHICLES", description: "Fully restored Italian classic, runs great." },
    { title: "Patek Philippe Calatrava", category: "WATCHES", description: "Elegant dress watch, box and papers included." },
    { title: "Cartier Tank Watch", category: "WATCHES", description: "Timeless design, recently serviced." },
    { title: "Impressionist Landscape Painting", category: "ART", description: "Late 19th century oil on canvas, unsigned." },
    { title: "Marble Bust - Roman Style", category: "ART", description: "Hand-carved marble, 18th century reproduction." },
    { title: "Mid-Century Modern Sideboard", category: "FURNITURE", description: "Teak wood, original hardware, Danish design." },
    { title: "Chesterfield Leather Sofa", category: "FURNITURE", description: "Genuine leather, classic tufted design." },
    { title: "Signed First Edition of 1984 by George Orwell", category: "BOOKS", description: "Rare signed copy, protective slipcase included." },
    { title: "Complete Set of Encyclopedia Britannica (1911)", category: "BOOKS", description: "Full 29-volume set, leather bound." },
    { title: "Hasselblad 500C Medium Format Camera", category: "CAMERAS", description: "Legendary medium format body, includes lens." },
    { title: "Canon AE-1 Program Film Camera", category: "CAMERAS", description: "Fully functional, classic 35mm SLR." },
    { title: "Vintage Sapphire and Diamond Brooch", category: "JEWELRY", description: "Art Nouveau design, platinum setting." },
    { title: "Gold Pocket Watch Chain", category: "JEWELRY", description: "14k gold, Victorian era craftsmanship." },
    { title: "Vintage Steinway Upright Piano", category: "MUSIC_INSTRUMENTS", description: "Fully restored, rich warm tone." },
    { title: "1960s Ludwig Drum Kit", category: "MUSIC_INSTRUMENTS", description: "Classic rock kit, original hardware." },
];

async function main() {
    console.log("Seeding database...");

    const hashedPassword = await bcrypt.hash("test1234", 10);

    const seller = await prisma.user.upsert({
        where: { email: "seller@test.com" },
        update: {},
        create: {
            email: "seller@test.com",
            username: "seller_demo",
            password: hashedPassword,
        },
    });

    for (const item of auctions) {
        const startPrice = Math.floor(Math.random() * 8000) + 500;
        const daysFromNow = Math.floor(Math.random() * 14) + 1;

        await prisma.auction.create({
            data: {
                title: item.title,
                description: item.description,
                category: item.category,
                startPrice,
                currentPrice: startPrice,
                endsAt: new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000),
                sellerId: seller.id,
            },
        });
    }

    console.log(`Seeded ${auctions.length} auctions.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });