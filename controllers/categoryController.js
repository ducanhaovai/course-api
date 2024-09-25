const Category = require("../model/Category");

exports.getAllCategories = async (req, res) => {
  try {
    const [categories] = await Category.findAll();
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories", error });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const [category] = await Category.findById(req.params.id);
    if (category.length === 0) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json({ category: category[0] });
  } catch (error) {
    res.status(500).json({ message: "Error fetching category", error });
  }
};

exports.createCategory = async (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ message: "Category name is required" });
  }
  try {
    await Category.create({ name, description });
    res.status(201).json({ message: "Category created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error creating category", error });
  }
};

exports.updateCategory = async (req, res) => {
  const { name, description } = req.body;
  try {
    await Category.update(req.params.id, { name, description });
    res.json({ message: "Category updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating category", error });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    await Category.delete(req.params.id);
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting category", error });
  }
};
