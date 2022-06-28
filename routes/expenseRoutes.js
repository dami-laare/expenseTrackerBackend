const express = require("express");

const router = express.Router();

const { isAuthenticated } = require("../middleware/auth");

const { addExpense } = require("../controllers/expenseControllers");

router.route("/user/expense").put(isAuthenticated, addExpense);

module.exports = router;
