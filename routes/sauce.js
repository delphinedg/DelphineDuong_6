const express = require("express");
const router = express.Router();
const sauceCrtl = require("../controllers/sauce");
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");
const validateSauce = require("../middleware/sauceValidator");

router.get("/", auth, sauceCrtl.getAllSauces);
router.post("/", auth, multer, validateSauce, sauceCrtl.createSauce);
router.get("/:id", auth, sauceCrtl.getOneSauce);
router.put("/:id", auth, multer, validateSauce, sauceCrtl.updateSauce);
router.delete("/:id", auth, sauceCrtl.deleteSauce);
router.post("/:id/like", auth, sauceCrtl.likeSauce);

module.exports = router;
