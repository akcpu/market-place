const nodemailer = require("nodemailer");
const { appConfig } = require("../config");
const fs = require("node:fs");
exports.sendEmail = async function (
  userName,
  email,
  subject,
  text,
  fileName,
  link
) {
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
    if (appConfig.Node_ENV === "development") console.log(link);
    fs.readFile(
      __dirname + "/../views/" + fileName + ".html",
      { encoding: "utf-8" },
      function (err, html) {
        if (err) {
          console.log(err);
        } else {
          var mapObj = {
            "{{AppURL}}": appConfig.AppURL,
            "{{AppName}}": appConfig.AppName,
            "{{OrgAvatar}}": appConfig.OrgAvatar,
            "{{Name}}": userName,
            "{{Code}}": link,
            "{{Link}}": link,
            "{{OrgName}}": appConfig.OrgName,
          };
          html = html.replace(
            /{{AppURL}}|{{AppName}}|{{OrgAvatar}}|{{Name}}|{{Code}}|{{Link}}|{{OrgName}}/gi,
            function (matched) {
              return mapObj[matched];
            }
          );

          const mailOptions = {
            from: appConfig.emailAddress, // sender address
            to: email, // list of receivers
            subject: subject, // Subject line
            text: text, // plain text body
            html: html,
          };
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.log(error);
              return false;
            }
            console.log("Email Sending Information: " + info.response);
            return true;
          });
        }
      }
    );
  } catch (error) {
    return false;
  }
};
