const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const {
  upsertBudget,
  getBudgetByMonth,
  setBudgetItemLimit,
} = require("../controllers/budgetController");

router.use(auth);

router.put("/:month", upsertBudget);
router.get("/:month", getBudgetByMonth);
router.patch("/:month/item/:categoryId", setBudgetItemLimit);

module.exports = router;

