import Cart from "../models/Cart";

export const getAllCartItems = async (req, res) => {
  // logic to get all cart items for a user
  const cart = await Cart.findOne({ user: req.user._id });
  res.json(cart);
};

export const addToCart = async (req, res) => {
  // logic to add an item to the cart
  const cart = await Cart.findOne({ user: req.user._id });
  const newItem = {
    product: req.body.productId,
    quantity: req.body.quantity,
  };
  cart.items.push(newItem);
  await cart.save();
  res.json(cart);
};

export const removeFromCart = async (req, res) => {
  // logic to remove an item from the cart
  const cart = await Cart.findOne({ user: req.user._id });
  cart.items = cart.items.filter(
    (item) => item.product.toString() !== req.params.id
  );
  await cart.save();
  res.json(cart);
};
