import { z } from "zod";

export const createAuctionSchema = z.object({
    title: z.string().min(1, { message: "Title is required" }),
    description: z.string().min(1, { message: "Description is required" }),
    startPrice: z.number().positive({ message: "Start price must be a positive number" }),
    endsAt: z.string().datetime().refine((date) => new Date(date) > new Date(), { message: "End date must be in the future" }),
    category: z.enum(['VEHICLES', 'WATCHES', 'ART', 'FURNITURE', 'BOOKS', 'CAMERAS', 'JEWELRY', 'MUSIC_INSTRUMENTS']),
})

export const updateAuctionSchema = z.object({
    title: z.string().min(1, { message: "Title is required" }).optional(),
    description: z.string().min(1, { message: "Description is required" }).optional(),
    startPrice: z.number().positive({ message: "Start price must be a positive number" }).optional(),
    endsAt: z.string().datetime().refine((date) => new Date(date) > new Date(), { message: "End date must be in the future" }).optional(),
    category: z.enum(['VEHICLES', 'WATCHES', 'ART', 'FURNITURE', 'BOOKS', 'CAMERAS', 'JEWELRY', 'MUSIC_INSTRUMENTS']),
})  