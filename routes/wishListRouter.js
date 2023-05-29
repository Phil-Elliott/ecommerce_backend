import express from "express";

const router = express.Router();

router.route("/").get(getAllWishListItems);
router.route("/add").post(addToWishList);
router.route("/remove/:id").delete(removeFromWishList);

export default router;
