import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import "./src/jobs/closeExpiredAuctions.js";
import { createServer } from "http";
import { Server } from "socket.io";
import authRoutes from "./src/routes/authRoutes.js";
import auctionRoutes from "./src/routes/auctionRoutes.js";
import bidRoutes from "./src/routes/bidRoutes.js";
import userRoutes from "./src/routes/usersRoutes.js";
import uploadRoutes from "./src/routes/uploadRoutes.js";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { errorHandler } from "./src/middleware/errorHandler.js";

dotenv.config();

const app = express();

app.use(helmet());

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    message: "Too many requests, please try again later.",
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    message: "Too many login attempts, please try again later.",
});

app.use(generalLimiter);

const allowedOrigins = [
    "http://localhost:5173",
    "https://gemora-auction-house-client-3iod.vercel.app/", 
];

app.use(
    cors({
        origin(origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
    })
);

app.use(express.json());

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        credentials: true,
    },
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/auctions", auctionRoutes);
app.use("/api/auctions/:id/bids", bidRoutes);
app.use("/api/users", userRoutes);
app.use("/api", uploadRoutes);

app.get("/", (req, res) => {
    res.json({ message: "Auction House API is running" });
});

app.use(errorHandler);

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-auction", (auctionId) => {
        socket.join(auctionId);
        console.log(`${socket.id} joined auction ${auctionId}`);
    });

    socket.on("leave-auction", (auctionId) => {
        socket.leave(auctionId);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export { io };