import Product from "../models/product.model.js";
import { redis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";

const updateFeaturedProductsCache = async () => {
  try {
    const featuredProducts = await Product.find({ isFeatured: true }).lean();
    await redis.set("featured_products", JSON.stringify(featuredProducts));
  } catch (error) {
    console.log("Error in updateFeaturedProductsCache controller: ", error);
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      products,
    });
  } catch (error) {
    console.log("Error in getAllProducts controller: ", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    let featuredProducts = await redis.get("featured_products");
    if (featuredProducts) {
      return res.status(200).json(JSON.parse(featuredProducts));
    }

    //if it is not in the redis, fetch from the database
    //.lean() is used to convert the mongoose object to a plain javascript object
    featuredProducts = await Product.find({ isFeatured: true }).lean();

    if (!featuredProducts) {
      return res
        .status(404)
        .json({ success: false, message: "No featured products found" });
    }

    //store in redis for future quick access
    await redis.set("featured_products", JSON.stringify(featuredProducts));
    res.status(200).json({
      success: true,
      message: "Featured products fetched",
      featuredProducts,
    });
  } catch (error) {
    console.log("Error in getFeaturedProducts controller: ", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export const createProduct = async (req, res) => {
  const { name, description, price, image, category } = req.body;
  try {
    let cloudinaryResponse = null;
    if (image) {
      cloudinaryResponse = await cloudinary.uploader.upload(
        image,
        (err) => {
          console.log(err);
        },
        {
          folder: "products",
        }
      );
    }

    const product = await Product.create({
      name,
      description,
      price,
      image: cloudinaryResponse.secure_url ? cloudinaryResponse.secure_url : "",
      category,
    });
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.log("Error in createProduct controller: ", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    if (product.image) {
      const publicId = product.image.split("/").pop().split(".")[0];
      try {
        await cloudinary.uploader.destroy(`products/${publicId}`);
        console.log("Image deleted from cloudinary");
      } catch (error) {
        console.log("Error in deleting image from cloudinary: ", error);
      }
    }
    await Product.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.log("Error in deleteProduct controller: ", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export const getRecommendedProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      {
        $sample: { size: 3 },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          image: 1,
          price: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Recommended products fetched successfully",
      products,
    });
  } catch (error) {
    console.log("Error in getRecommendedProducts controller: ", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export default getProductsByCategory = async (req, res) => {
  const { category } = req.params;
  try {
    const products = await Product.find({ category });
    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      products,
    });
  } catch (error) {
    console.log("Error in getProductsByCategory controller: ", error);
  }
};

export const toggleFeaturedProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      product.isFeatured = !product.isFeatured;
      const updatedProduct = await product.save();
      //update the cache
      await updateFeaturedProductsCache();
      res.status(200).json({
        success: true,
        message: "Product updated successfully",
        updatedProduct,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
  } catch (error) {
    console.log("Error in toggleFeaturedProduct controller: ", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};
