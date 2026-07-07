import { z } from "zod";

export const bidSchema = z.object({
    amount: z.number().positive({ message: "Bid amount must be a positive number" }),
})