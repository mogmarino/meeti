const Usuario = require("../models/Usuarios");
const enviarEmail = require("../handlers/emails");
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

    // URL de confirmación
    const url = `http://${req.headers.host}/confirmar-cuenta/${usuario.email}`;
    // enviar email de confirmación
    await enviarEmail.enviarEmail({
      usuario,
      url,
      subject: "Confirma tu cuenta de Meeti",
      archivo: "confirmar-cuenta",
    });

    req.flash("exito", "Hemos enviado un email, confirma tu cuenta");
    res.redirect("/iniciar-sesion");
  } catch (error) {
    console.log(error);
    const erroresSequelize = error?.errors.map((err) => err.message);
    console.log(erroresSequelize);
    const errExp = errors.map((err) => err.msg);

    const listaErrores = [...erroresSequelize, ...errExp];

    req.flash("error", listaErrores);
    res.redirect("/crear-cuenta");
  }
};

// confirma la suscripcion del usuario
exports.confirmarCuenta = async (req, res, next) => {
  // verificar que el usuario existe
  const usuario = await Usuario.findOne({
    where: { email: req.params.correo },
  });
  // si no existe redireccionar
  if (!usuario) {
    req.flash("error", "No existe esa cuenta");
    res.redirect("/crear-cuenta");
    return next();
  }
  // si existe confirmar y redireccionar
  usuario.activo = 1;
  await usuario.save();

  req.flash("exito", "La cuenta se ha confirmado, ya puedes iniciar sesión");
  res.redirect("/iniciar-sesion");
};

// formulario para iniciar sesion
exports.formIniciarSesion = (req, res) => {
  res.render("iniciar-sesion", {
    nombrePagina: "Iniciar Sesión",
  });
};
