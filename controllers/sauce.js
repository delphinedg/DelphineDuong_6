const Sauce = require("../models/Sauce");
// fs nous donne accès aux fonctions permettant de modifier le système de fichiers
const fs = require("fs");

// VOIR TOUTES LES SAUCES
// On utilise la méthode find() pour renvoyer un tableau contenant toutes les sauces qui se trouvent dans la base de données.
exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => {
      res.status(200).json(sauces);
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

// AJOUTER UNE NOUVELLE SAUCE
// On convertit les données de la requête qui sont sous la forme form-data en objet Js.
// On supprime le faux _id envoyé par le front, puis on crée une nouvelle instance du modèle Sauce. On copie tous les éléments du req.body dedans et on définit son imageUrl. On initialise les likes et dislikes à 0, et des usersLiked et usersDislikes avec des tableaux vides.
// On utilise ensuite la méthode save() pour enregistrer la sauce dans la base de données.
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersdisLiked: [],
  });
  sauce
    .save()
    .then(() => res.status(201).json({ message: "Sauce enregistrée" }))
    .catch((error) => res.status(400).json({ error }));
};

// VOIR UNE SAUCE
// On utilise la méthode findOne() du modèle sauce pour trouver la sauce ayant le même _id que le paramètre de la requête.
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id,
  })
    .then((sauce) => {
      res.status(200).json(sauce);
    })
    .catch((error) => {
      res.status(404).json({
        error: error,
      });
    });
};

// MODIFIER UNE SAUCE
// On crée un objet sauceObject qui regarde si req.file existe ou pas. S'il existe, on récupère toutes les informations de la requête et on génère l'imageUrl. Si non, on prend le corps de l'objet.
// On utilise la méthode updateOne() avec en premier argument, l'objet qu'on modifie et en deuxième argument, la nouvelle version de l'objet.
exports.updateSauce = (req, res, next) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  Sauce.updateOne(
    { _id: req.params.id },
    { ...sauceObject, _id: req.params.id }
  )
    .then(res.status(200).json({ message: "Sauce modifiée" }))
    .catch((error) => res.status(400).json({ error }));
};

// SUPPRIMER UNE SAUCE
// On accède à la sauce correspondante en utilisant l'ID comme paramètre.
// On utilise la méthode deleteOne() et on lui passe l'objet à supprimer.
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Sauce supprimée" }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

// AIMER OU NE PAS AIMER UNE SAUCE
// Si like = 1, on cherche la sauce par son id et on regarde si l'userId est dans le tableau usersLiked. S'il n'existe pas dans le tableau, on incrémente de 1 les likes de la sauce et on ajoute l'userId dans le tableau usersLiked.
// Si like = 0, on regarde si l'userId est dans le tableau des usersLiked ou des usersDisliked. Lorsqu'on le trouve dans un des tableaux, on enlève de 1 les likes/dislikes et on enlève l'userId du tableau correspondant.
// Si like = -1, on regarde si l'userId est dans le tableau usersDisliked. S'il n'existe pas dans le tableau, on incrémente de 1 les dislikes de la sauce et on ajoute l'userId dans le tableau usersDisliked.
// Si aucun des cas ne correspond, on envoie une erreur.
exports.likeSauce = (req, res, next) => {
  let userId = req.body.userId;
  let like = req.body.like;
  let sauceId = req.params.id;

  switch (like) {
    case 1:
      Sauce.findOne({ _id: sauceId })
        .then((sauce) => {
          if (sauce.usersLiked.includes(userId)) {
            res.status(400).json({ message: "Demande non autorisée" });
          } else {
            Sauce.updateOne(
              { _id: sauceId },
              { $inc: { likes: +1 }, $push: { usersLiked: userId } }
            )
              .then(() => res.status(200).json({ message: "Je like" }))
              .catch((error) => res.status(400).json({ error }));
          }
        })
        .catch((error) => res.status(400).json({ error }));
      break;
    case 0:
      Sauce.findOne({ _id: sauceId })
        .then((sauce) => {
          if (sauce.usersLiked.includes(userId)) {
            Sauce.updateOne(
              { _id: sauce },
              { $inc: { likes: -1 }, $pull: { usersLiked: userId } }
            )
              .then(() =>
                res.status(200).json({ message: "J'annule mon like" })
              )
              .catch((error) => res.status(400).json({ error }));
          } else if (sauce.usersDisliked.includes(userId)) {
            Sauce.updateOne(
              { _id: sauce },
              { $inc: { dislikes: -1 }, $pull: { usersDisliked: userId } }
            )
              .then(() =>
                res.status(200).json({ message: "J'annule mon dislike" })
              )
              .catch((error) => res.status(400).json({ error }));
          } else {
            console.log("Erreur");
          }
        })
        .catch();
      break;
    case -1:
      Sauce.findOne({ _id: sauceId })
        .then((sauce) => {
          if (sauce.usersDisliked.includes(userId)) {
            res.status(400).json({ message: "Demande non autorisée" });
          } else {
            Sauce.updateOne(
              { _id: sauceId },
              { $inc: { dislikes: +1 }, $push: { usersDisliked: userId } }
            )
              .then(() => res.status(200).json({ message: "Je dislike" }))
              .catch((error) => res.status(400).json({ error }));
          }
        })
        .catch((error) => res.status(400).json({ error }));
      break;
    default:
      res.status(400).json({ message: "Erreur" });
  }
};
