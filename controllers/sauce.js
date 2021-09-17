const Sauce = require("../models/Sauce");

// VOIR TOUTES LES SAUCES
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
// On crée un objet sauceObject qui regarde si req.file existe ou pas. S'il existe, on traite la nouvelle image, si non, on traite l'objet entrant.
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
exports.deleteSauce = (req, res, next) => {
  Sauce.deleteOne({ _id: req.params.id })
    .then(() => {
      res.status(200).json({
        message: "Sauce supprimée",
      });
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

// AIMER UNE SAUCE
exports.likeSauce = (req, res, next) => {
  let userId = req.body.userId;
  let like = req.body.like;
  let sauceId = req.params.id;

  switch (like) {
    case 1:
      Sauce.findOne({ _id: sauceId })
        .then((sauce) => {
          if (sauce.usersLiked.includes(userId)) {
            console.log("Demande non autorisée");
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
            console.log("Demande non autorisée");
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
      console.log(error);
  }
};
