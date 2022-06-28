const catchAsyncErrors = require("../utils/catchAsyncErrors");

exports.addExpense = catchAsyncErrors(async (req, res) => {
  const user = req.user;

  user.expenses.push(req.body.expense);

  await user.save();

  res.status(200).json({
    success: true,
  });
});
