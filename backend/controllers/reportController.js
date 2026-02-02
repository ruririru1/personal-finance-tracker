const Transaction = require("../models/Transaction");
const mongoose = require("mongoose");

/**
 * GET /api/reports/monthly-summary?month=YYYY-MM
 * month пример: 2026-02
 */
exports.monthlySummary = async (req, res) => {
  try {
    const { month } = req.query;
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ message: "month is required in YYYY-MM format" });
    }

    const [yearStr, monthStr] = month.split("-");
    const year = Number(yearStr);
    const m = Number(monthStr);

    const start = new Date(Date.UTC(year, m - 1, 1));
    const end = new Date(Date.UTC(year, m, 1)); // next month

    const result = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.userId),
          date: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const incomeObj = result.find((x) => x._id === "income");
    const expenseObj = result.find((x) => x._id === "expense");

    const income = incomeObj ? incomeObj.total : 0;
    const expense = expenseObj ? expenseObj.total : 0;

    res.json({
      month,
      income,
      expense,
      balance: income - expense,
      counts: {
        income: incomeObj ? incomeObj.count : 0,
        expense: expenseObj ? expenseObj.count : 0,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/reports/top-categories?month=YYYY-MM&limit=5
 * топ категорий по расходам
 */
exports.topCategories = async (req, res) => {
  try {
    const { month, limit } = req.query;
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ message: "month is required in YYYY-MM format" });
    }

    const topN = Math.max(1, Math.min(Number(limit) || 5, 20));

    const [yearStr, monthStr] = month.split("-");
    const year = Number(yearStr);
    const m = Number(monthStr);

    const start = new Date(Date.UTC(year, m - 1, 1));
    const end = new Date(Date.UTC(year, m, 1));

    const data = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.userId),
          type: "expense",
          date: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: "$categoryId",
          totalSpent: { $sum: "$amount" },
          txCount: { $sum: 1 },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: topN },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          categoryId: "$_id",
          categoryName: "$category.name",
          totalSpent: 1,
          txCount: 1,
        },
      },
    ]);

    res.json({ month, limit: topN, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
