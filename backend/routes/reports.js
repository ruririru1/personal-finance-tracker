const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const {
  monthlySummary,
  topCategories,
} = require("../controllers/reportController");

router.use(auth);

router.get("/monthly-summary", monthlySummary);
router.get("/top-categories", topCategories);

module.exports = router;
