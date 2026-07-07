import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { registerSchema, loginSchema } from "../schemas/authSchemas.js";

export const register = async (req, res) => {
    const { success, data, error } = registerSchema.safeParse(req.body);
    if (!success) {
        return res.status(400).json({ error: error.issues[0].message });
    }
    try {
        const { email, password, username } = data;

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { username }],
            },
        });

        if (existingUser) {
            return res.status(409).json({ error: "Email or username already taken" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                username,
                password: hashedPassword,
            },
        });

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(201).json({
            token,
            user: { id: user.id, email: user.email, username: user.username, role: user.role },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong" });
    }
};

export const login = async (req, res) => {
    const { success, data, error } = loginSchema.safeParse(req.body);
    if (!success) {
        return res.status(400).json({ error: error.issues[0].message });
    }
    try {
        const { email, password } = data;

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            token,
            user: { id: user.id, email: user.email, username: user.username, role: user.role },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong" });
    }
};