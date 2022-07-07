// const theFunc = (req, res, next) => {
//   Promise.resolve(theFunc(req, res, next)).catch(next);
// };
// module.exports = theFunc;

module.exports = (func) => {
  return (req, res, next) => {
    func(req, res, next).catch(next);
  };
};
