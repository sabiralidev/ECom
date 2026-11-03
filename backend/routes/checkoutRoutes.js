const express = require("express");
const router = express.Router();
const { auth } = require("../Middleware/authMiddleware");
const { checkoutLimiter } = require("../Middleware/requestLimits");
const { checkoutSchema, validateRequest } = require("../Middleware/requestValidation");
const {
    checkoutPost,
    createStripeCheckoutSession,
    verifyStripeSession,
    checkoutStatus,
    checkoutWebhook,
    checkoutPay,
    checkoutFinalize,
} = require("../controllers/checkoutControllers");

router.post("/webhook", checkoutWebhook);
router.post("/create", checkoutLimiter, auth, validateRequest(checkoutSchema), checkoutPost);
router.post("/stripe/session", checkoutLimiter, auth, createStripeCheckoutSession);
router.post("/stripe/verify-session", checkoutLimiter, auth, verifyStripeSession);
router.get("/:id/status", checkoutLimiter, auth, checkoutStatus);
router.put("/:id/pay", checkoutLimiter, auth, checkoutPay)
router.post("/:id/finalize", checkoutLimiter, auth, checkoutFinalize)

module.exports = router;