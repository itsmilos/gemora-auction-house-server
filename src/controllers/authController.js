import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { registerSchema, loginSchema } from "../schemas/authSchemas.js";

export const register = async (req, res, next) => {
    const { success, data, error: zodError } = registerSchema.safeParse(req.body);
    if (!success) {
        const error = new Error(zodError.issues[0].message);
        error.statusCode = 400;
        return next(error);
    }
    try {
        const { email, password, username } = data;

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { username }],
            },
        });

        if (existingUser) {
            const error = new Error("Email or username already taken");
            error.statusCode = 409;
            return next(error);
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
        next(error);
    }
};

export const login = async (req, res, next) => {
    const { success, data, error: zodError } = loginSchema.safeParse(req.body);
    if (!success) {
        const error = new Error(zodError.issues[0].message);
        error.statusCode = 400;
        return next(error);
    }
    try {
        const { email, password } = data;

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            const error = new Error('Invalid credentials');
            error.statusCode = 401;
            return next(error);
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            const error = new Error('Invalid credentials');
            error.statusCode = 401;
            return next(error);
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
        next(error);
    }
};