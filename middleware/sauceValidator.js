const { check, validationResult } = require("express-validator");

module.exports = [
  check("name").isLength({ min: 2 }),
  check("manufacturer").isLength({ min: 2 }),
  check("description").isLength({ min: 2 }),
  check("mainPepper").isLength({ min: 2 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    next();
  },
];
