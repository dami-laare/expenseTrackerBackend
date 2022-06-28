const express = require("express");
const router = express.Router();
const {
  createNewUser,
  loginUser,
  forgotPassword,
  resetPassword,
  updateUser,
  getUser,
} = require("../controllers/authControllers");

const { isAuthenticated } = require("../middleware/auth");

router.route("/user").post(createNewUser);
router.route("/user/login").post(loginUser);
router.route("/user/password/forgot").post(forgotPassword);
router.route("/user/password/reset").post(resetPassword);
router.route("/user").put(isAuthenticated, updateUser);
router.route("/user").get(isAuthenticated, getUser);

module.exports = router;
