const Category = require("../models/Category");

// CREATE
exports.createCategory = async (req, res) => {
  try {
    const { name, type } = req.body;

    if (!name || !type) {
      return res.status(400).json({ message: "name and type are required" });
    }

    const category = await Category.create({
      userId: req.userId,
      name,
      type,
    });

    res.status(201).json(category);
  } catch (err) {
    // дубликат (unique index)
    if (err.code === 11000) {
      return res.status(400).json({ message: "Category already exists" });
    }
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// READ (list)
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ userId: req.userId }).sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type } = req.body;

    const updated = await Category.findOneAndUpdate(
      { _id: id, userId: req.userId },         // важно: только свои
      { $set: { ...(name && { name }), ...(type && { type }) } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(updated);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Category already exists" });
    }
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Category.findOneAndDelete({ _id: id, userId: req.userId });

    if (!deleted) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ message: "Category deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
