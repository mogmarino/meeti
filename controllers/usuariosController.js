const Usuario = require("../models/Usuarios");
const { check, validationResult } = require("express-validator");

exports.formCrearCuenta = (req, res) => {
  res.render("crear-cuenta", {
    nombrePagina: "Crea tu cuenta",
  });
};

exports.crearNuevaCuenta = async (req, res) => {
  const usuario = req.body;

  await check("repetir")
    .notEmpty()
    .withMessage("Repetir password es obligatorio")
    .run(req);
  await check("repetir")
    .equals(req.body.password)
    .withMessage("Los passwords no coinciden")
    .run(req);

  const { errors } = validationResult(req);

  try {
    const usuarioSaved = await Usuario.create(usuario);

    req.flash("exito", "Hemos enviado un email, confirma tu cuenta");
    res.redirect("/iniciar-sesion");
  } catch (error) {
    const erroresSequelize = error.errors.map((err) => err.message);
    console.log(erroresSequelize);
    const errExp = errors.map((err) => err.msg);

    const listaErrores = [...erroresSequelize, ...errExp];

    req.flash("error", listaErrores);
    res.redirect("/crear-cuenta");
  }
};

exports.formIniciarSesion = (req, res) => {
  res.render("iniciar-sesion", {
    nombrePagina: "Iniciar Sesión",
  });
};
