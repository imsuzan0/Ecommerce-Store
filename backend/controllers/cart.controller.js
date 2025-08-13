import Product from "../models/product.model.js";

export const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;

    const existingItem = await user.cartItems.find(
      (item) => item.id === productId
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      user.cartItems.push(productId);
    }
    await user.save();

    res.json(user.cartItems);
  } catch (error) {
    console.log("Error in addToCart controller: ", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;

    if (!productId) {
      user.cartItems = [];
    } else {
      user.cartItems = user.cartItems.filter((item) => item.id !== productId);
    }
    await user.save();
    res.json(user.cartItems);
  } catch (error) {
    console.log("Error in removeFromCart controller: ", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};
export const updateQuantity = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { quantity } = req.body;
    const user = req.user;
    const existingItem = user.cartItems.find((item) => item.id === productId);
    if (existingItem) {
      if (quantity === 0) {
        user.cartItems = user.cartItems.filter((item) => item.id !== productId);
        await user.save();
        return res.json(user.cartItems);
      } else {
        existingItem.quantity = quantity;
      }
      await user.save();
      res.json(user.cartItems);
    } else {
      res.status(404).json({ success: false, message: "Product not found" });
    }
  } catch (error) {
    console.log("Error in updateQuantity controller: ", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export const getCartProducts = async (req, res) => {
  try {
    const products = await Product.find({ _id: { $in: req.user.cartItems } });

    //add quantity for each product
    const cartItems = products.map((product) => {
      const cartItem = req.user.cartItems.find(
        (item) => item.id === product._id
      );
      return { ...product.toJSON(), quantity: cartItem.quantity };
    });

    res.json(cartItems);
  } catch (error) {
    console.log("Error in getCartProducts controller: ", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export const removeAllFromCart = async (req, res) => {
  try {
    const user = req.user;
    user.cartItems = [];
    await user.save();
    res.json(user.cartItems);
  } catch (error) {
    console.log("Error in removeAllFromCart controller: ", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};
