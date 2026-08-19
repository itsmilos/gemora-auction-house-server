import { PrismaClient } from "../src/generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const auctions = [
    { title: "Classic Porsche 911 (1978)", category: "VEHICLES", description: "1978 Porsche 911 SC, matching-numbers 3.0L flat-six engine paired with a 5-speed manual gearbox. Approximately 68,000 original miles, Guards Red exterior over black leather interior. Recent service history includes new clutch and timing chain tensioners. Runs and drives excellently, no rust, original books and tool kit included.", imageUrl: "https://fegbmhqbqjkyqededteu.supabase.co/storage/v1/object/public/auction-images/porsche.webp" },
    { title: "Vintage Volkswagen Beetle (1965)", category: "VEHICLES", description: "1965 Volkswagen Beetle, fully restored body-off, numbers-matching 1200cc air-cooled engine and 4-speed manual transaxle. Repainted in original Pearl White, new interior upholstery and headliner. Mechanically sorted with rebuilt carburetor and fresh brakes. Drives smoothly, ideal for shows or weekend cruising.", imageUrl: "https://fegbmhqbqjkyqededteu.supabase.co/storage/v1/object/public/auction-images/wagenbeetle.webp" },
    { title: "Rolex Submariner (1985)", category: "WATCHES", description: "1985 Rolex Submariner ref. 16800, stainless steel case and Oyster bracelet, black dial and bezel with minor patina consistent with age. Automatic movement recently serviced by an independent watchmaker, keeping accurate time. Sold with original box; papers not included. A true tool watch with honest wear.", imageUrl: "https://fegbmhqbqjkyqededteu.supabase.co/storage/v1/object/public/auction-images/rolex.webp" },
    { title: "Omega Speedmaster Professional", category: "WATCHES", description: "Omega Speedmaster Professional 'Moonwatch', manual-wind caliber 1861 movement, hesalite crystal, and stainless steel case. Crisp black dial with tachymeter bezel in excellent condition. Full set including original box, warranty card, and service booklet. A NASA-flight-qualified classic.", imageUrl: "https://fegbmhqbqjkyqededteu.supabase.co/storage/v1/object/public/auction-images/omega.webp" },
    { title: "Original Oil Painting - Countryside", category: "ART", description: "Original oil on canvas depicting a rural countryside landscape, painted by a mid-century regional artist. Signed lower right, framed in a period-appropriate gilt wood frame. Canvas dimensions approximately 24 x 36 inches. Good condition with natural craquelure consistent with age, no visible restoration.", imageUrl: "https://fegbmhqbqjkyqededteu.supabase.co/storage/v1/object/public/auction-images/countrypaint.webp" },
    { title: "Bronze Sculpture - Abstract Form", category: "ART", description: "Cast bronze abstract sculpture, one of a limited edition series numbered on the base. Rich patina developed naturally over decades, mounted on a black marble plinth. Stands approximately 18 inches tall. A striking statement piece for a gallery or collector's study.", imageUrl: "https://fegbmhqbqjkyqededteu.supabase.co/storage/v1/object/public/auction-images/sculpture.webp" },
    { title: "Antique Oak Writing Desk", category: "FURNITURE", description: "19th century solid oak writing desk with hand-carved detailing along the legs and drawer fronts. Features three working drawers with original brass hardware and a leather-inset writing surface. Structurally sound with minor surface wear consistent with age and use.", imageUrl: "https://fegbmhqbqjkyqededteu.supabase.co/storage/v1/object/public/auction-images/writingtable.webp" },
    { title: "Victorian Armchair", category: "FURNITURE", description: "Victorian-era armchair with the original carved wooden frame, recently reupholstered in a period-appropriate deep burgundy fabric. Sturdy joinery throughout, springs and padding freshly restored for comfortable seating. A statement piece for a formal sitting room.", imageUrl: "https://fegbmhqbqjkyqededteu.supabase.co/storage/v1/object/public/auction-images/chair.webp" },
    { title: "First Edition Harry Potter and the Philosopher's Stone", category: "BOOKS", description: "First edition, first printing of Harry Potter and the Philosopher's Stone, Bloomsbury 1997. Original dust jacket present with light shelf wear at the spine ends. Text block clean and tight, no markings or foxing. A highly sought-after piece for any serious collection.", imageUrl: "https://fegbmhqbqjkyqededteu.supabase.co/storage/v1/object/public/auction-images/harrypotter.webp" },
    { title: "Signed Copy of The Hobbit", category: "BOOKS", description: "Collector's edition of The Hobbit featuring an authenticated author signature on the title page. Hardcover with slipcase, illustrated endpapers, and gilt-edged pages. Housed in protective archival sleeve, in excellent overall condition.", imageUrl: "https://fegbmhqbqjkyqededteu.supabase.co/storage/v1/object/public/auction-images/hobbit.webp" },
    { title: "Vintage Leica M6 Camera", category: "CAMERAS", description: "Leica M6 35mm rangefinder camera, chrome finish, fully mechanical body with accurate metering confirmed against a modern light meter. Shutter speeds all function smoothly, viewfinder is clean and bright. Sold body-only, a benchmark of manual photography craftsmanship.", imageUrl: "https://fegbmhqbqjkyqededteu.supabase.co/storage/v1/object/public/auction-images/leicam6.webp" },
    { title: "Polaroid SX-70 Land Camera", category: "CAMERAS", description: "Polaroid SX-70 folding instant camera, chrome and leatherette body in clean cosmetic condition. Motor and shutter tested and confirmed working with fresh SX-70 film. Folds flat for storage, an icon of 1970s instant photography design.", imageUrl: "https://fegbmhqbqjkyqededteu.supabase.co/storage/v1/object/public/auction-images/landcamera.webp" },
    { title: "Art Deco Diamond Ring", category: "JEWELRY", description: "Art Deco platinum ring circa 1920s, set with a certified center diamond flanked by baguette-cut accent stones in a geometric setting. Ring size 6.5, resizing available upon request. Comes with a recent independent gemological appraisal.", imageUrl: "https://fegbmhqbqjkyqededteu.supabase.co/storage/v1/object/public/auction-images/diamondring.webp" },
    { title: "Antique Pearl Necklace", category: "JEWELRY", description: "Early 20th century natural pearl necklace with a 14k gold filigree clasp. Individually hand-knotted strand, pearls showing gentle luster consistent with age. Approximately 18 inches in length, a timeless heirloom piece.", imageUrl: "https://fegbmhqbqjkyqededteu.supabase.co/storage/v1/object/public/auction-images/necklace.webp" },
    { title: "Gibson Les Paul 1959 Reissue", category: "MUSIC_INSTRUMENTS", description: "Gibson Custom Shop 1959 Les Paul Reissue, flame maple top over mahogany body, rosewood fretboard. Fitted with period-correct PAF-style humbuckers delivering rich, warm tone. Minimal play wear, includes original hardshell case.", imageUrl: "https://fegbmhqbqjkyqededteu.supabase.co/storage/v1/object/public/auction-images/gibsonlespaul.webp" },
    { title: "Vintage Fender Stratocaster", category: "MUSIC_INSTRUMENTS", description: "Vintage Fender Stratocaster with alder body and maple neck, all original electronics and hardware intact. Frets show light wear consistent with regular playing, action set up for comfortable playability. A genuine piece of rock history.", imageUrl: "https://fegbmhqbqjkyqededteu.supabase.co/storage/v1/object/public/auction-images/stratocaster.webp" },
    { title: "Aston Martin DB5 (1964)", category: "VEHICLES", description: "1964 Aston Martin DB5, matching numbers 4.0L inline-six engine paired with a 5-speed manual gearbox. Silver Birch exterior over red leather interior, restored to a high standard with documented service history. A true icon of British sports car engineering.", imageUrl: "https://fegbmhqbqjkyqededteu.supabase.co/storage/v1/object/public/auction-images/astonmartin.webp" },
    { title: "Vespa 150 Scooter (1962)", category: "VEHICLES", description: "1962 Vespa 150, fully mechanically restored two-stroke engine with fresh carburetor rebuild. Repainted in classic Italian cream, chrome trim polished and rust-free. Starts easily and rides smoothly, ready for city cruising or display.", imageUrl: "https://fegbmhqbqjkyqededteu.supabase.co/storage/v1/object/public/auction-images/vespa.webp" },
    { title: "Patek Philippe Calatrava", category: "WATCHES", description: "Patek Philippe Calatrava, 18k yellow gold case with a manual-wind movement recently serviced at an authorized workshop. Clean silver dial with baton markers, exhibiting minimal wear. Complete with original box and papers, a benchmark of understated horological elegance.", imageUrl: "https://fegbmhqbqjkyqededteu.supabase.co/storage/v1/object/public/auction-images/patek.webp" },
    { title: "Cartier Tank Watch", category: "WATCHES", description: "Cartier Tank, stainless steel rectangular case with the signature Roman numeral dial and sapphire cabochon crown. Quartz movement recently serviced, original leather strap in good condition. A timeless design worn by generations of collectors.", imageUrl: "https://fegbmhqbqjkyqededteu.supabase.co/storage/v1/object/public/auction-images/cartier.webp" },
    { title: "Impressionist Landscape Painting", category: "ART", description: "Late 19th century impressionist-style oil on canvas landscape, unsigned but attributed to a regional school of the period. Loose, expressive brushwork capturing natural light. Presented in its original wooden frame, canvas relined for stability.", imageUrl: "https://fegbmhqbqjkyqededteu.supabase.co/storage/v1/object/public/auction-images/landscapepaint.webp" },
    { title: "Marble Bust - Roman Style", category: "ART", description: "Hand-carved marble bust in the classical Roman style, 18th century reproduction after an antique original. Fine detailing throughout the facial features and drapery. Mounted on a fitted marble base, stands approximately 22 inches tall.", imageUrl: "https://fegbmhqbqjkyqededteu.supabase.co/storage/v1/object/public/auction-images/marbleburst.webp" },
    { title: "Mid-Century Modern Sideboard", category: "FURNITURE", description: "Danish-design mid-century sideboard in solid teak, featuring sliding doors and original brass hardware. Interior fitted with adjustable shelving and a dedicated drawer bank. Refinished surface highlights the natural wood grain, structurally solid.", imageUrl: "https://fegbmhqbqjkyqededteu.supabase.co/storage/v1/object/public/auction-images/modernsideboard.webp" },
    { title: "Chesterfield Leather Sofa", category: "FURNITURE", description: "Classic Chesterfield sofa upholstered in genuine tufted leather, featuring rolled arms and traditional deep-button detailing. Hardwood frame with well-maintained springs for lasting comfort. A statement piece for a study or formal living room.", imageUrl: "https://fegbmhqbqjkyqededteu.supabase.co/storage/v1/object/public/auction-images/sofa.webp" },
    { title: "Signed First Edition of 1984 by George Orwell", category: "BOOKS", description: "First edition of George Orwell's 1984, Secker & Warburg 1949, featuring an authenticated Orwell-era signature on the front free endpaper. Housed in a protective slipcase, dust jacket present with restoration to spine ends. A cornerstone piece for any literary collection.", imageUrl: "https://fegbmhqbqjkyqededteu.supabase.co/storage/v1/object/public/auction-images/orwell.webp" },
    { title: "Complete Set of Encyclopedia Britannica (1911)", category: "BOOKS", description: "Complete 29-volume set of the eleventh edition Encyclopedia Britannica, 1911, widely regarded as a landmark in reference publishing. Original leather bindings with gilt spine lettering, minor shelf wear consistent with age. A remarkable scholarly and decorative set.", imageUrl: "https://fegbmhqbqjkyqededteu.supabase.co/storage/v1/object/public/auction-images/britannica.webp" },
    { title: "Hasselblad 500C Medium Format Camera", category: "CAMERAS", description: "Hasselblad 500C medium format camera body paired with an 80mm f/2.8 Zeiss Planar lens. Mechanical shutter and film advance tested and functioning smoothly, viewfinder clean and clear. The legendary system used to photograph the first moon landing.", imageUrl: "https://fegbmhqbqjkyqededteu.supabase.co/storage/v1/object/public/auction-images/hasselblad500C.webp" },
    { title: "Canon AE-1 Program Film Camera", category: "CAMERAS", description: "Canon AE-1 Program 35mm SLR with the standard 50mm f/1.8 lens. Light meter and shutter speeds tested and accurate, film advance smooth and reliable. A beloved entry point into classic manual and program-mode film photography.", imageUrl: "https://fegbmhqbqjkyqededteu.supabase.co/storage/v1/object/public/auction-images/canon.webp" },
    { title: "Vintage Sapphire and Diamond Brooch", category: "JEWELRY", description: "Art Nouveau brooch set in platinum, featuring a central sapphire surrounded by old European-cut diamond accents. Fine handcrafted filigree detailing throughout. A rare surviving example of early 20th century jewelry design.", imageUrl: "https://fegbmhqbqjkyqededteu.supabase.co/storage/v1/object/public/auction-images/brooch.webp" },
    { title: "Gold Pocket Watch Chain", category: "JEWELRY", description: "Victorian-era 14k gold pocket watch chain featuring hand-finished links and a T-bar fastener. Substantial weight and craftsmanship typical of the period. A refined accessory piece or standalone collectible.", imageUrl: "https://fegbmhqbqjkyqededteu.supabase.co/storage/v1/object/public/auction-images/pocketwatch.webp" },
    { title: "Vintage Steinway Upright Piano", category: "MUSIC_INSTRUMENTS", description: "Steinway & Sons upright piano, fully restored including new strings, hammers, and dampers. Cabinet refinished to a rich walnut gloss, action regulated for even touch across all keys. Delivers a warm, resonant tone throughout its range.", imageUrl: "https://fegbmhqbqjkyqededteu.supabase.co/storage/v1/object/public/auction-images/piano.webp" },
    { title: "1960s Ludwig Drum Kit", category: "MUSIC_INSTRUMENTS", description: "1960s Ludwig drum kit in the classic champagne sparkle finish, including kick drum, snare, and two toms with original hardware. Heads recently replaced, shells free of cracks or warping. A genuine piece of rock and roll history.", imageUrl: "https://fegbmhqbqjkyqededteu.supabase.co/storage/v1/object/public/auction-images/drumkit.webp" },
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
             endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                sellerId: seller.id,
                imageUrl: item.imageUrl
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