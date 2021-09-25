const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// FONCTION SIGNUP POUR S'INSCRIRE
// On utilise la fonction (asynchrone) de hachage de bcrypt et on lui demande de saler le mot de passe 10 fois.
// La fonction nous renvoie une Promise avec le hash. Puis on crée un nouvel utilisateur grâce au modèle mongoose 'User' et on l'enregistre dans la base de données.
exports.signup = (req, res, next) => {
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      const user = new User({
        email: req.body.email,
        password: hash,
      });
      user
        .save()
        .then(() => res.status(201).json({ message: "Utilisateur créé" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

// FONCTION LOGIN POUR SE CONNECTER
// On utilise la fonction findOne de mongoose pour vérifie que l'email entré correspond à un email existant dans la BDD.
// Si l'email est trouvé, on utilise la méthode compare() de bcrypt (qui renvoie un booléen) pour comparer le mot de passe entré et le hash enregistré dans le BDD.
// S'ils correspondent, on envoie une réponse 200 avec l'ID de l'utilisateur et le token.
exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: "Utilisateur non trouvé !" });
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ error: "Mot de passe incorrect !" });
          }
          res.status(200).json({
            userId: user._id,
            // la fonction sign de jsonwebtoken pour encoder un nouveau token
            token: jwt.sign({ userId: user._id }, "RANDOM_TOKEN_SECRET", {
              expiresIn: "24h",
            }),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
