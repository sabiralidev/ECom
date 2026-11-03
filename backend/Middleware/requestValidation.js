const { z } = require("zod");

const emailSchema = z.string().trim().email().max(254);

const registerSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: emailSchema,
  password: z.string().min(6).max(128),
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
});

const profileUpdateSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  email: emailSchema.optional(),
  password: z.string().min(6).max(128).optional(),
});

const subscribeSchema = z.object({
  email: emailSchema,
});

const checkoutItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().positive(),
  size: z.string().optional(),
  color: z.string().optional(),
}).passthrough();

const checkoutSchema = z.object({
  checkoutItems: z.array(checkoutItemSchema).min(1),
  shippingAddress: z.object({
    address: z.string().trim().min(1).max(500),
    city: z.string().trim().min(1).max(120),
    postalCode: z.union([
      z.string().trim().min(1).max(32),
      z.number().finite(),
    ]),
    country: z.string().trim().min(1).max(120),
  }).passthrough(),
  paymentMethod: z.string().optional(),
}).passthrough();

const validateRequest = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      message: "Request validation failed",
      errors: result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  req.body = result.data;
  return next();
};

module.exports = {
  registerSchema,
  loginSchema,
  profileUpdateSchema,
  subscribeSchema,
  checkoutSchema,
  validateRequest,
};
