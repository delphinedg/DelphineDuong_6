const multer = require("multer");

const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};

// On crée une constante storage à passer à multer comme configuration
// destination => indique à multer d'enregistrer les images dans le dossier images
// filename => indique à multer d'utiliser le nom d'origine de l'image + mettre des _ à la place des espaces + ajouter un timestamp comme nom de fichier
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "images");
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(" ").join("_");
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + "." + extension);
  },
});

// On exporte l'élément multer configuré, on lui passe la constante storage et on lui indique qu'on gère uniquement les téléchargements de fichiers image.
module.exports = multer({ storage: storage }).single("image");
