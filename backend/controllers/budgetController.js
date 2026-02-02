const mongoose = require("mongoose");
const Budget = require("../models/Budget");

/**
 * PUT /api/budgets/:month
 * body: { items: [{ categoryId, limit }, ...] }
 * create or replace items for that month
 */
exports.upsertBudget = async (req, res) => {
  try {
    const { month } = req.params;
    const { items } = req.body;

    if (!/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ message: "month must be YYYY-MM" });
    }
    if (!Array.isArray(items)) {
      return res.status(400).json({ message: "items must be an array" });
    }

    // базовая чистка
    const cleaned = items.map((it) => ({
      categoryId: new mongoose.Types.ObjectId(it.categoryId),
      limit: Number(it.limit),
    }));

    const doc = await Budget.findOneAndUpdate(
      { userId: req.userId, month },
      { $set: { items: cleaned } },
      { upsert: true, new: true }
    );

    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/budgets/:month
 */
exports.getBudgetByMonth = async (req, res) => {
  try {
    const { month } = req.params;

    const doc = await Budget.findOne({ userId: req.userId, month })
      .populate("items.categoryId", "name type");

    if (!doc) {
      return res.status(404).json({ message: "Budget not found" });
    }

    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * PATCH /api/budgets/:month/item/:categoryId
 * body: { limit: 5000 }
 *
 * advanced update:
 * - если item уже есть → обновить limit через positional operator
 * - если нет → добавить item через $push
 */
exports.setBudgetItemLimit = async (req, res) => {
  try {
    const { month, categoryId } = req.params;
    const { limit } = req.body;

    if (!/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ message: "month must be YYYY-MM" });
    }
    if (limit === undefined) {
      return res.status(400).json({ message: "limit is required" });
    }

    const catObjId = new mongoose.Types.ObjectId(categoryId);

    // 1) пробуем обновить существующий item (positional $)
    const updated = await Budget.findOneAndUpdate(
      { userId: req.userId, month, "items.categoryId": catObjId },
      { $set: { "items.$.limit": Number(limit) } },
      { new: true }
    );

    if (updated) return res.json(updated);

    // 2) если item не найден — добавляем (push). Создаём doc если его нет.
    const upserted = await Budget.findOneAndUpdate(
      { userId: req.userId, month },
      { $push: { items: { categoryId: catObjId, limit: Number(limit) } } },
      { upsert: true, new: true }
    );

    res.json(upserted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

