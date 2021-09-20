const express = require("express");
const router = express.Router();
const sauceCrtl = require("../controllers/sauce");
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

router.get("/", auth, sauceCrtl.getAllSauces);
router.post("/", auth, multer, sauceCrtl.createSauce);
router.get("/:id", auth, sauceCrtl.getOneSauce);
router.put("/:id", auth, multer, sauceCrtl.updateSauce);
router.delete("/:id", auth, sauceCrtl.deleteSauce);
router.post("/:id/like", auth, sauceCrtl.likeSauce);

module.exports = router;
