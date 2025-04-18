
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res
    .status(403)
    .json({ message: "Bạn không có quyền thực hiện hành động này" });
};

module.exports = { isAdmin };
