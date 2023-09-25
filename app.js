import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import hpp from "hpp";
import bodyParser from "body-parser";

import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import gameRouter from "./routes/gameRoutes.js";
import orderRouter from "./routes/orderRoutes.js";
import cartRouter from "./routes/cartRoutes.js";
import wishListRouter from "./routes/wishListRoutes.js";
import reviewRouter from "./routes/reviewRoutes.js";

dotenv.config({ path: "./config.env" });

const app = express();

// Global middleware

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Rate limiting
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

// Body parser
app.use(express.json({ limit: "10kb" }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution (whitelist specific parameters)
app.use(
  hpp({
    whitelist: [],
  })
);

// Set security HTTP headers
app.use(helmet());

app.use(cookieParser());

// Enable CORS
const corsOptions = {
  origin: "http://localhost:3001",
  credentials: true,
};

app.use(cors(corsOptions));

// ROUTES
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/games", gameRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/wishList", wishListRouter);
app.use("/api/v1/reviews", reviewRouter);

// 404 route
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    status: err.status,
    error: err.message || "Internal Server Error",
  });
});

export default app;

/*

1) Create a review component
2) Allow user to create reviews
3) Add a badge to the cart icon to display number of items
4) Maybe route the user to the cart page when they add an item to the cart and same with wishlist


4) Fix all auth stuff
5) Work on displaying reviews on frontend (might need to aggregate data in backend to show total score and number of reviews)
7) Work on order controller and test (maybe watch tutorial for this) and see what needs to be done with stripe


Start working on admings view
- maybe aggregate data for dashboard
- show orders
- show out of stock
- show items in peoples carts and wishlists


could add deals later

*/
