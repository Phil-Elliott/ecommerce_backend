import WishList from "../models/WishList";

export const getAllWishListItems = async (req, res) => {
  // logic to get all wishlist items for a user
  const wishList = await WishList.findOne({ user: req.user._id });
  res.json(wishList);
};

export const addToWishList = async (req, res) => {
  // logic to add an item to the wishList
  const wishList = await Wishlist.findOne({ user: req.user._id });
  const newItem = {
    product: req.body.productId,
  };
  wishList.items.push(newItem);
  await wishList.save();
  res.json(wishList);
};

export const removeFromWishList = async (req, res) => {
  // logic to remove an item from the wishList
  const wishList = await Wishlist.findOne({ user: req.user._id });
  wishList.items = wishList.items.filter(
    (item) => item.product.toString() !== req.params.id
  );
  await wishList.save();
  res.json(wishList);
};
