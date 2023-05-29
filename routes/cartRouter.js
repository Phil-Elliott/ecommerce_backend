import express from "express";

const router = express.Router();

router.route("/").get(getAllCartItems);
router.route("/add").post(addToCart);
router.route("/remove/:id").delete(removeFromCart);

export default router;
