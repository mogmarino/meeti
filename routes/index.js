const express = require("express");
const homeController = require("../controllers/homeController");
const usuarioController = require("../controllers/usuariosController");

const router = express.Router();

module.exports = function () {
  router.get("/", homeController.home);

  router.get("/crear-cuenta", usuarioController.formCrearCuenta);
  router.post("/crear-cuenta", usuarioController.crearNuevaCuenta);

  router.get("/iniciar-sesion", usuarioController.formIniciarSesion);
  return router;
};
