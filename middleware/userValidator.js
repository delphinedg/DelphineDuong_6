const { check, validationResult } = require("express-validator");

module.exports = [
  check("email").isEmail(),
  check("password").isLength({ min: 6 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    next();
  },
];
