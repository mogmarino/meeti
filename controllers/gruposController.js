const Categorias = require("../models/Categorias");
const Grupos = require("../models/Grupos");
const { body } = require("express-validator");

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

  console.log(grupo);
  try {
    // almacenar en la base de datos
    await Grupos.create(grupo);
    req.flash("exito", "Se ha creado el Grupo Correctamente");
    res.redirect("/administracion");
  } catch (error) {
    console.log(error);
    req.flash("error", error);
    res.redirect("/nuevo-grupo");
  }
};
