const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
} = require("../controllers/transactionController");

router.use(auth);

router.post("/", createTransaction);
router.get("/", getTransactions);
router.patch("/:id", updateTransaction);
router.delete("/:id", deleteTransaction);

module.exports = router;
