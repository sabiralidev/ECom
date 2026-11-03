const Order = require("../../models/order");
const Product = require("../../models/products");
const User = require("../../models/user");
const { adjustInventory } = require("../../utils/inventory");
const { withMongoTransaction } = require("../../utils/withMongoTransaction");

// Get Admin Order /auth/admin/orders
const getAdminOrders = async (req, res, next) => {
    try {
        const order = await Order.find({}).populate("user", "name email").sort({ createdAt: -1 });
        res.status(200).json(order);
    } catch (error) {
        return res.status(500).json({
            message: "Server error while loading orders",
        });
    };
};

const getAdminDashboard = async (req, res) => {
    try {
        const [users, products, orders, lowStock, revenue] = await Promise.all([
            User.countDocuments(),
            Product.countDocuments(),
            Order.countDocuments(),
            Product.countDocuments({ countInStock: { $lte: 5 } }),
            Order.aggregate([
                { $match: { isPaid: true } },
                { $group: { _id: null, total: { $sum: "$totalPrice" } } },
            ]),
        ]);
        const recentOrders = await Order.find({})
            .sort({ createdAt: -1 })
            .limit(8)
            .populate("user", "name email")
            .lean();

        return res.status(200).json({
            metrics: {
                users,
                products,
                orders,
                lowStock,
                revenue: revenue[0]?.total || 0,
            },
            recentOrders,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server error while loading admin dashboard",
        });
    }
};

// Put Order Update Order Status /auth/admin/order-update/:id
const ademinOrderUpdate = async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!["Processing", "Shipped", "Delivered", "Cancelled"].includes(status)) {
            return res.status(400).json({ message: "Invalid order status" });
        }
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        if (order.status === "Cancelled" && status !== "Cancelled") {
            return res.status(409).json({ message: "Cancelled orders cannot be reopened" });
        }
        if (order.status === "Cancelled" && status === "Cancelled") {
            await order.populate("user", "name email");
            return res.status(200).json(order);
        }

        const deliveredAt = status === "Delivered" ? order.deliveredAt || new Date() : undefined;
        if (status === "Cancelled" && order.inventoryAdjusted) {
            const cancelledOrder = await withMongoTransaction(async (session) => {
                const updatedOrder = await Order.findOneAndUpdate(
                    { _id: order._id, status: order.status, inventoryAdjusted: true },
                    {
                        $set: {
                            status,
                            isDelivered: false,
                            inventoryAdjusted: false,
                        },
                        $unset: { deliveredAt: 1 },
                    },
                    { new: true, session }
                );
                if (!updatedOrder) {
                    return null;
                }

                await adjustInventory(updatedOrder.orderItem, 1, { session });
                return updatedOrder;
            });
            if (!cancelledOrder) {
                return res.status(409).json({ message: "Order changed while it was being updated" });
            }
            await cancelledOrder.populate("user", "name email");
            return res.status(200).json(cancelledOrder);
        }

        const statusUpdate = {
            $set: {
                status,
                isDelivered: status === "Delivered",
            },
        };
        if (deliveredAt) {
            statusUpdate.$set.deliveredAt = deliveredAt;
        } else {
            statusUpdate.$unset = { deliveredAt: 1 };
        }
        const updateOrder = await Order.findOneAndUpdate(
            { _id: order._id, status: { $ne: "Cancelled" } },
            statusUpdate,
            { new: true, runValidators: true }
        );
        if (!updateOrder) {
            return res.status(409).json({ message: "Order changed while it was being updated" });
        }
        await updateOrder.populate("user", "name email");
        return res.status(200).json(updateOrder);
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.statusCode && error.statusCode < 500
                ? error.message
                : "Server error while updating order",
        });
    };
};

//  Delete Order  auth/admin/order-delete/:id

const adminDeleteOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        await withMongoTransaction(async (session) => {
            if (order.inventoryAdjusted) {
                await adjustInventory(order.orderItem, 1, { session });
            }

            const result = await Order.deleteOne(
                { _id: order._id, inventoryAdjusted: order.inventoryAdjusted },
                { session }
            );
            if (result.deletedCount !== 1) {
                throw Object.assign(new Error("Order changed while it was being deleted"), { statusCode: 409 });
            }
        });
        return res.status(200).json({ message: "Order removed" });
    } catch (error) {
        return res.status(500).json({
            message: "Server error while deleting order",
        });
    }
};
module.exports = {
    getAdminOrders,
    getAdminDashboard,
    ademinOrderUpdate,
    adminDeleteOrder
};