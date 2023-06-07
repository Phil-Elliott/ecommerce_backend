import express from "express";
import {
  getAllGames,
  getGame,
  createGame,
  updateGame,
  deleteGame,
} from "../controllers/gameController.js";
import { protect, restrictTo } from "../controllers/authController.js";
// import multer from "multer";

const router = express.Router();

// const upload = multer();

router
  .route("/")
  .get(getAllGames)
  .post(protect, restrictTo("admin"), createGame);

router
  .route("/:id")
  .get(getGame)
  .patch(protect, restrictTo("admin"), updateGame)
  .delete(protect, restrictTo("admin"), deleteGame);

export default router;
