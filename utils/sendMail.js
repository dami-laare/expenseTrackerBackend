const nodemailer = require("nodemailer");
const ErrorHandler = require("./ErrorHandler");

module.exports = async (mailDetails) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.GMAIL_ADDRESS,
      pass: process.env.GMAIL_PWD,
    },
  });

  await transporter.sendMail(mailDetails, function (err, data) {
    if (err) {
      console.log(err);
    }
  });
};
