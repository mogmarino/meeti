const express = require("express");
const homeController = require("../controllers/homeController");
const usuarioController = require("../controllers/usuariosController");
const authController = require("../controllers/authController");

const router = express.Router();

module.exports = function () {
  router.get("/", homeController.home);

  // crear y confirmar cuentas
  router.get("/crear-cuenta", usuarioController.formCrearCuenta);
  router.post("/crear-cuenta", usuarioController.crearNuevaCuenta);
  router.get("/confirmar-cuenta/:correo", usuarioController.confirmarCuenta);

  // iniciar sesion
  router.get("/iniciar-sesion", usuarioController.formIniciarSesion);
  router.post("/iniciar-sesion", authController.autenticarUsuario);
  return router;
};
