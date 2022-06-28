const crypto = require("crypto");
const validator = require("validator");
const User = require("../models/User");
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const sendJwt = require("../utils/sendJwt");
const capitalize = require("../utils/capitalize");
const sendMail = require("../utils/sendMail");

// POST: /api/v1/user
exports.createNewUser = catchAsyncErrors(async (req, res, next) => {
  const { first_name, last_name, email, password, confirm_password } = req.body;

  if (password !== confirm_password) {
    return next(new ErrorHandler("Passwords do not match"));
  }

  if (
    !validator.isStrongPassword(password, {
      pointsPerUnique: 0,
      pointsPerRepeat: 0,
    })
  ) {
    return next(new ErrorHandler("Passwords is not strong enough", 400));
  }

  const user = await User.create({
    first_name,
    last_name,
    email,
    password,
  });

  sendJwt(user, 200, res);
});

// POST: /api/v1/user/login
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!password || !email) {
    return next(new ErrorHandler("Please enter complete details", 400));
  }

  const user = await User.findOne({
    email,
  }).select("+password");

  if (!user) {
    return next(new ErrorHandler("User does not exist", 400));
  }

  const pwdMatched = await user.comparePassword(password);

  if (!pwdMatched) {
    return next(new ErrorHandler("Incorrect password", 400));
  }

  sendJwt(user, 200, res);
});

exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;

  if (!email || !validator.isEmail(email)) {
    return next(new ErrorHandler("Please enter a valid email", 400));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(new ErrorHandler("User not found", 400));
  }

  const resetToken = await User.getResetPasswordToken();

  await user.save();

  const mailDetails = {
    from: `"Trakk" <${process.env.GMAIL_ADDRESS}>`,
    to: user.email,
    subject: "Reset Password",
    text: `Hey ${capitalize(
      user.first_name
    )}\nPlease click the link below to reset your password.(Note: This link expires in 10 minutes)\n\nhttp://localhost:3000/password/forgot?token=${resetToken}\n\nIf you did not request for this mail please ignore this mail.\nThanks!`,
  };

  try {
    await sendMail(mailDetails);

    res.status(200).json({
      success: true,
    });
  } catch (err) {
    console.log(err);
  }
});

exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  const resetPasswordToken = await crypto
    .createHash("sha256")
    .update(req.query.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler("Reset password link is invalid or has expired", 400)
    );
  }

  const { password, confirm_password } = req.body;

  if (password !== confirm_password) {
    return next(new ErrorHandler("Passwords do not match"));
  }

  if (
    !validator.isStrongPassword(password, {
      pointsPerUnique: 0,
      pointsPerRepeat: 0,
    })
  ) {
    return next(new ErrorHandler("Passwords is not strong enough", 400));
  }

  user.password = password;
  user.resetPasswordToken = null;
  user.resetPasswordExpires;
});

exports.updateUser = catchAsyncErrors(async (req, res, next) => {
  const { first_name, last_name, email, password, confirm_password } = req.body;
  const user = req.user;
  if (req.query.update_bio) {
    user.first_name = first_name ? first_name : user.first_name;
    user.last_name = last_name ? last_name : user.last_name;
    user.email = email ? email : user.email;
    await user.save();
  }

  if (req.query.update_password) {
    if (password !== confirm_password) {
      return next(new ErrorHandler("Passwords do not match", 400));
    }

    if (
      !validator.isStrongPassword(password, {
        pointsPerUnique: 0,
        pointsPerRepeat: 0,
      })
    ) {
      return next(new ErrorHandler("Passwords is not strong enough", 400));
    }

    user.password = password;
    await user.save();
  }

  res.status(200).json({
    success: true,
  });
});

exports.getUser = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;

  res.status(200).json({
    success: true,
    user,
  });
});
