const Order = require("../models/order");
const { parsePagination, paginateQuery } = require("../utils/pagination");

// Get /api/order/my-orders

const getMyOrder = async (req,res,next)=>{
    const filter = { user: req.user._id };
    const pagination = parsePagination(req.query);
    if (pagination?.error) {
        return res.status(400).json({ message: pagination.error });
    }

    try {
        const orderQuery = Order.find(filter).sort({ createdAt: -1 });
        const orders = pagination
            ? await paginateQuery({ model: Order, filter, query: orderQuery, pagination, res })
            : await orderQuery;
        return res.json(orders);
    } catch (error) {
         return res.status(500).json({
            message: "Server error while updating cart",
        });
    }
};

// Get /api/order/Id Order Details

const getOrderDetails = async (req, res, next)=>{
    try {
        const order = await Order.findById(req.params.id).populate("user", "name email");
        if(!order){
            return res.status(404).json({ message: "Order not found" });
        }

        if (order.user && order.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Forbidden: You cannot access this order" });
        }

        res.json(order);
    } catch (error) {
         return res.status(500).json({
            message: "Server error while updating cart",
        });
    }
};

module.exports = {
    getMyOrder,
    getOrderDetails,
}