const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const Category = require("../Models/Category");

exports.CreateCategory = AsyncErrorHandler(async (req, res) => {
  try {
    const { category, description, amount } = req.body;
    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category name are required",
      });
    }

    const existing = await Category.findOne({
      categoryName: category.trim(),
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Category already exists",
      });
    }

    const newCategory = await Category.create({
      categoryName: category.trim(),
      description,
      amount,
    });

    res.status(201).json({
      success: true,
      data: newCategory,
    });
  } catch (error) {
    console.error("CreateCategory error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create category",
      error: error.message,
    });
  }
});

exports.DisplayCategories = AsyncErrorHandler(async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;

    const currentPage = Math.max(parseInt(page), 1);
    const pageLimit = Math.max(parseInt(limit), 1);
    const skip = (currentPage - 1) * pageLimit;

    const cleanSearch = search.trim();

    const query = cleanSearch
      ? { categoryName: { $regex: cleanSearch, $options: "i" } }
      : {};

    const totalCategories = await Category.countDocuments(query);

    const categories = await Category.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageLimit);

    const totalPages = Math.ceil(totalCategories / pageLimit);

    res.status(200).json({
      success: true,
      totalCategories,
      totalPages,
      currentPage,
      limit: pageLimit,
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
});


exports.DisplayCategoryById = AsyncErrorHandler(async (req, res) => {
  const categoryId = req.params.id;

  const category = await Category.findById(categoryId);

  if (!category) {
    return res.status(404).json({
      success: false,
      message: "Category not found",
    });
  }

  res.status(200).json({
    success: true,
    data: category,
  });
});

exports.UpdateCategory = AsyncErrorHandler(async (req, res) => {
  try {
    const categoryId = req.params.id;
    console.log("categoryId:", categoryId);

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }
    const { category: categoryName, description, amount } = req.body;

    if (categoryName) {
      const existing = await Category.findOne({
        categoryName: categoryName.trim(),
        _id: { $ne: categoryId },
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: "Category name already exists",
        });
      }

      category.categoryName = categoryName.trim();
    }

    if (description !== undefined) {
      category.description = description;
    }

    if (amount !== undefined) {
      category.amount = amount;
    }

    await category.save();

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update category",
      error: error.message,
    });
  }
});

exports.DeleteCategory = AsyncErrorHandler(async (req, res) => {
  const categoryId = req.params.id;

  const category = await Category.findById(categoryId);
  if (!category) {
    return res.status(404).json({
      success: false,
      message: "Category not found",
    });
  }

  await Category.findByIdAndDelete(categoryId);

  res.status(200).json({
    success: true,
    message: "Category deleted successfully",
    data: null,
  });
});
