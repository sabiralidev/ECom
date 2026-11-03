const Product = require("../../models/products");
const mongoose = require("mongoose");
const { parsePagination, paginateQuery } = require("../../utils/pagination");

// admin dashborad show all product
// Get /auth/admin/products
const getAdminProducts = async (req, res, next) => {
    const pagination = parsePagination(req.query);
    if (pagination?.error) {
        return res.status(400).json({ message: pagination.error });
    }

    try {
        const filter = {};
        const productQuery = Product.find(filter).sort({ createdAt: -1 });
        const products = pagination
            ? await paginateQuery({ model: Product, filter, query: productQuery, pagination, res })
            : await productQuery;
        return res.status(200).json(products);
    } catch (error) {
        return res.status(500).json({
            message: "Server error while loading products",
        });
    }
};

const getAdminProduct = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid product id" });
        }
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        return res.status(200).json(product);
    } catch (error) {
        return res.status(500).json({
            message: "Server error while loading product",
        });
    }
};

module.exports = {
    getAdminProducts,
    getAdminProduct,
}