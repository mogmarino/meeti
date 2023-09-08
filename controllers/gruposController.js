const Categorias = require("../models/Categorias");
const Grupos = require("../models/Grupos");
const { body } = require("express-validator");
const multer = require("multer");
const shortid = require("shortid");

const configMulter = {
  limits: { filesize: 100000 },
  storage: (fileStorage = multer.diskStorage({
    destination: (req, file, next) => {
      next(null, __dirname + "/../public/uploads/grupos");
    },
    filename: (req, file, next) => {
      const ext = file.mimetype.split("/")[1];
      next(null, `${shortid.generate()}.${ext}`);
    },
  })),
  fileFilter(req, file, next) {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      // formato valido
      next(null, true);
    } else {
      // el formato no es valido
      next(new Error("El formato no es valido"), false);
    }
  },
};

const upload = multer(configMulter).single("imagen");

exports.formNuevoGrupo = async (req, res) => {
  const categorias = await Categorias.findAll();
  res.render("nuevo-grupo", {
    nombrePagina: "Crea un nuevo grupo",
    categorias,
  });
};

exports.crearGrupo = async (req, res) => {
  // sanitizar los campos
  body("nombre").trim();
  body("url").trim();
  const grupo = req.body;
  // almacena el usuario autenticado como el creador del grupo
  grupo.usuarioId = req.user.id;

  // leer la imagen
  if (req.file) {
    grupo.imagen = req.file.filename;
  }
  try {
    // almacenar en la base de datos
    await Grupos.create(grupo);
    req.flash("exito", "Se ha creado el Grupo Correctamente");
    res.redirect("/administracion");
  } catch (error) {
    // console.log(error);
    req.flash("error", error.message);
    res.redirect("/nuevo-grupo");
  }
};

// sube imagenes al servidor
exports.subirImagen = (req, res, next) => {
  upload(req, res, function (error) {
    if (error) {
      if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          req.flash("error", "El archivo es muy grande");
        } else {
          req.flash("error", error.message);
        }
      } else if (error.hasOwnProperty("message")) {
        req.flash("error", error.message);
      }
      res.redirect("back");
      return;
    } else {
      next();
    }
  });
};
