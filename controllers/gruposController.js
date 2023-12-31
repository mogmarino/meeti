const Categorias = require("../models/Categorias");
const Grupos = require("../models/Grupos");
const { body } = require("express-validator");
const multer = require("multer");
const shortid = require("shortid");
const fs = require("fs");

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

exports.formEditarGrupo = async (req, res) => {
  // const grupo = await Grupos.findByPk(req.params.grupoId);
  const [grupo, categorias] = await Promise.all([
    Grupos.findByPk(req.params.grupoId),
    Categorias.findAll(),
  ]);
  res.render("editar-grupo", {
    nombrePagina: `Editar Grupo: ${grupo.nombre}`,
    grupo,
    categorias,
  });
};

// guarda los cambios en la DB
exports.editarGrupo = async (req, res, next) => {
  const grupo = await Grupos.findOne({
    where: { id: req.params.grupoId, usuarioId: req.user.id },
  });

  // si no existe ese grupo o no es el dueño
  if (!grupo) {
    req.flash("error", "Operación inválida");
    res.redirect("/administracion");
    return next();
  }

  const { nombre, descripcion, categoriaId, url } = req.body;

  // asignar los valores
  grupo.nombre = nombre;
  grupo.descripcion = descripcion;
  grupo.categoriaId = categoriaId;
  grupo.url = url;

  await grupo.save();

  req.flash("exito", "Cambios almacenados correctamente");
  res.redirect("/administracion");
};

// muestra el formulario para editar la imagen del grupo
exports.formEditarImagen = async (req, res) => {
  const grupo = await Grupos.findOne({
    where: { id: req.params.grupoId, usuarioId: req.user.id },
  });
  res.render("imagen-grupo", {
    nombrePagina: `Editar imagen Grupo: ${grupo.nombre}`,
    grupo,
  });
};

// modifica la imagen en DB y elimina la anterior
exports.editarImagen = async (req, res, next) => {
  const grupo = await Grupos.findOne({
    where: { id: req.params.grupoId, usuarioId: req.user.id },
  });

  if (!grupo) {
    res.flash("error", "Operación no válida");
    res.redirect("/iniciar-sesion");
    return next();
  }

  // si hay imagen anterior y nueva, hay que borrar la anterior
  if (req.file && grupo.imagen) {
    const imagenAnteriorPath =
      __dirname + `/../public/uploads/grupos/${grupo.imagen}`;

    // eliminar archivo con filesystem
    fs.unlink(imagenAnteriorPath, (error) => {
      if (error) {
        console.log(error);
      }
      return;
    });
  }

  // si hay una imagen nueva la guardamos
  if (req.file) {
    grupo.imagen = req.file.filename;
  }

  // guardar en la DB
  await grupo.save();
  req.flash("exito", "Cambios almacenados correctamente");
  res.redirect("/administracion");
};

exports.formEliminarGrupo = async (req, res, next) => {
  const grupo = await Grupos.findOne({
    where: { id: req.params.grupoId, usuarioId: req.user.id },
  });

  if (!grupo) {
    req.flash("error", "Operación no válida");
    res.redirect("/administracion");
    return next();
  }

  res.render("eliminar-grupo", {
    nombrePagina: `Eliminar Grupo: ${grupo.nombre}`,
  });
};

exports.eliminarImagen = async (req, res) => {
  const grupo = await Grupos.findOne({
    where: { id: req.params.grupoId, usuarioId: req.user.id },
  });

  if (!grupo) {
    req.flash("error", "Operación no válida");
    res.redirect("/administracion");
    return next();
  }

  if (grupo.imagen) {
    const imagenAnteriorPath =
      __dirname + `/../public/uploads/grupos/${grupo.imagen}`;

    // eliminar archivo con filesystem
    fs.unlink(imagenAnteriorPath, (error) => {
      if (error) {
        console.log(error);
      }
      return;
    });
  }

  // eliminar el grupo
  await Grupos.destroy({ where: { id: req.params.grupoId } });

  // redireccionar al usuario
  req.flash("exito", "Grupo eliminado correctamente");
  res.redirect("/administracion");
};
