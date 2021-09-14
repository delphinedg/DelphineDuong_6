const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Plugin pour pré-valider les informations avant de les enregistrer (afin d'avoir un email unique dans la base de données)
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
