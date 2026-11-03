const express = require("express");
const { subscribe } = require("../controllers/subscriberControllers");
const { newsletterLimiter } = require("../Middleware/requestLimits");
const { subscribeSchema, validateRequest } = require("../Middleware/requestValidation");
const router = express.Router();

router.post("/", newsletterLimiter, validateRequest(subscribeSchema), subscribe);

module.exports = router;
