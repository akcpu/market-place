const Error = (content) => {
  console.log(`errorMsg: ${content}`);
};
const ErrorViewer = (errCode, errorMsg) => {
  console.log(`errCode: ${errCode} errorMsg: ${errorMsg}`);
};
const getError = (err, req, res, next) => {
  res.status(404).send("Page does not exist");
};
module.exports = { Error, ErrorViewer, getError };
// const notFound = (req, res) => {
//   res.status(404).send("Page does not exist");
// };
// const errorLogger = (err, req, next) => {
//   console.log(err);
// };
// const errorHandler = (err, req, res, next) => {
//   errorLogger(err);
//   console.log(`error1 ${err.message} - ${req.method} url:: ${req.url}`);
//   // Define a common server error status code if none is part of the err.
//   const defaultError = {
//     statusCodes: "500", // -statusCode.INTERNAL_SERVER_ERROR
//     msg: err || "Something went wrong, try again later",
//   };
//   if (err.name === "ValidationError" || err.guesses) {
//     defaultError.statusCodes = "400"; //-statusCode.BAD_REQUEST
//     defaultError.msg = "Bad request - Validation Error";
//   }
//   if (err.name === "captcha_error") {
//     defaultError.statusCodes = "401"; //-statusCode.UNAUTHORIZED
//     defaultError.msg = "Unauthorized request - Captcha Error";
//   }
//   if (err.name === "conflict" || err.code === 11000) {
//     defaultError.statusCodes = "409"; //-statusCode.CONFLICT
//     defaultError.msg = "Conflict - User with given data already exist!";
//   }
//   if (err.shouldRedirect || err.statusCodes === "404") {
//     defaultError.statusCodes = "404"; // -statusCode.NOT_FOUND
//     defaultError.msg = err.message;
//     // Gets a customErrorPage.html.
//     res.render("customErrorPage");
//   } else {
//     res
//       .status(defaultError.statusCodes)
//       .send({ msg: defaultError.msg, statusCode: defaultError.statusCodes });
//   }
// };

// // export default errorHandler;
// module.exports = { notFound, errorLogger, errorHandler };
