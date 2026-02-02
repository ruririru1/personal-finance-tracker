const Transaction = require("../models/Transaction");

// CREATE
exports.createTransaction = async (req, res) => {
  try {
    const { categoryId, type, amount, date, note } = req.body;

    if (!categoryId || !type || !amount || !date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const tx = await Transaction.create({
      userId: req.userId,
      categoryId,
      type,
      amount,
      date,
      note,
    });

    res.status(201).json(tx);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// READ (list + filters)
exports.getTransactions = async (req, res) => {
  try {
    const { categoryId, startDate, endDate } = req.query;

    const filter = { userId: req.userId };

    if (categoryId) filter.categoryId = categoryId;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const txs = await Transaction.find(filter)
      .sort({ date: -1 })
      .populate("categoryId", "name type");

    res.json(txs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE
exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Transaction.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { $set: req.body },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE
exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Transaction.findOneAndDelete({
      _id: id,
      userId: req.userId,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json({ message: "Transaction deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
