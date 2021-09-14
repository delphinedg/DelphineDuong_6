const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    // Extraction du token du header "authorization". On utilise split pour récupérer le token qui se trouve après "Bearer"
    const token = req.headers.authorization.split(" ")[1];
    // On décode le token
    const decodedToken = jwt.verify(token, "RANDOM_TOKEN_SECRET");
    // On extrait le userId du token
    const userId = decodedToken.userId;
    // Si la demande contient un userId et qu'il ne correspond pas à celui extrait du token, on met un message d'erreur. Si non, on passe à l'exécution du middleware suivant.
    if (req.body.userId && req.body.userId !== userId) {
      throw "User ID non valide";
    } else {
      next();
    }
  } catch {
    res.status(401).json({
      error: new Error("Requête non authentifiée !"),
    });
  }
};
