const { body, param, validationResult } = require("express-validator");

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array().map((e) => e.msg).join("; ") });
  }
  next();
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const bookingRules = [
  body("roomId").trim().notEmpty().withMessage("Room ID is required"),
  body("checkIn").matches(DATE_RE).withMessage("Check-in must be YYYY-MM-DD"),
  body("checkOut").matches(DATE_RE).withMessage("Check-out must be YYYY-MM-DD"),
  body("guestName").trim().notEmpty().withMessage("Guest name is required"),
  body("guestEmail").isEmail().withMessage("Valid email is required"),
  body("guestPhone").matches(/^[\d\s+\-()]{7,20}$/).withMessage("Invalid phone format"),
  body("guestType").optional().isIn(["Family", "Bachelor"]).withMessage("Guest type must be Family or Bachelor"),
  body("guests").optional().isInt({ min: 1 }).withMessage("Guests must be at least 1"),
];

const dateRangeRules = [
  body("checkIn").matches(DATE_RE).withMessage("Check-in must be YYYY-MM-DD"),
  body("checkOut").matches(DATE_RE).withMessage("Check-out must be YYYY-MM-DD"),
];

const blockRules = [
  body("roomId").trim().notEmpty().withMessage("Room ID is required"),
  body("startDate").matches(DATE_RE).withMessage("Start date must be YYYY-MM-DD"),
  body("endDate").matches(DATE_RE).withMessage("End date must be YYYY-MM-DD"),
];

const emailRule = [
  body("email").isEmail().withMessage("Valid email is required"),
];

const cancelRules = [
  param("id").trim().notEmpty().withMessage("Booking ID is required"),
];

const priceRules = [
  param("id").trim().notEmpty().withMessage("Room ID is required"),
  body("basePrice").isFloat({ gt: 0 }).withMessage("basePrice must be greater than 0"),
];

const imageRules = [
  param("id").trim().notEmpty().withMessage("Room ID is required"),
  body("images").isArray({ min: 1 }).withMessage("Images must be a non-empty array"),
  body("images.*").isString().withMessage("Each image URL must be a string"),
];

module.exports = {
  handleValidation,
  bookingRules,
  dateRangeRules,
  blockRules,
  emailRule,
  cancelRules,
  priceRules,
  imageRules,
};
