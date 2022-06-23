const nodemailer = require("nodemailer");
const { appConfig } = require("../config");
const cons = require("consolidate");
exports.sendEmail = async function (email, subject, text, fileName, link) {
  try {
    const transporter = nodemailer.createTransport({
      host: appConfig.emailCenter,
      port: appConfig.emailPort,
      //secure: true,
      auth: {
        user: appConfig.emailAddress,
        pass: appConfig.emailPassword,
      },
    });

    const mailOptions = {
      from: appConfig.emailAddress, // sender address
      to: email, // list of receivers
      subject: subject, // Subject line
      text: text, // plain text body
      html: cons.mustache.render(("email_code_verify-css", { Code: link })),
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log("Email Sending Information: " + info);
    });

    console.log("email sent sucessfully");
  } catch (error) {
    console.log(error, "email not sent");
  }
};
