const express = require("express");
const {
    register,
    login,
    userProfile,
    updateUserProfile,
    deleteUserProfile,
} = require("../controllers/usersControllers");
const {auth} = require("../Middleware/authMiddleware");
const { authLimiter } = require("../Middleware/requestLimits");
const {
    loginSchema,
    profileUpdateSchema,
    registerSchema,
    validateRequest,
} = require("../Middleware/requestValidation");

const router = express.Router();

// @route POST /api/users/register
// @des Register a new user
// @access public

router.post("/register", authLimiter, validateRequest(registerSchema), register)
router.post("/login", authLimiter, validateRequest(loginSchema), login)
router.get("/profile",auth, userProfile)
router.put("/profile", auth, validateRequest(profileUpdateSchema), updateUserProfile)
router.delete("/profile", auth, deleteUserProfile)

module.exports = router;