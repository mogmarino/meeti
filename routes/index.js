const express = require("express");
const homeController = require("../controllers/homeController");
const usuarioController = require("../controllers/usuariosController");
const authController = require("../controllers/authController");
const adminController = require("../controllers/adminController");
const gruposController = require("../controllers/gruposController");
const meetiController = require("../controllers/meetiController");

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

  // panel de administracion
  router.get(
    "/administracion",
    authController.usuarioAutenticado,
    adminController.panelAdministracion
  );

  // nuevos grupos
  router.get(
    "/nuevo-grupo",
    authController.usuarioAutenticado,
    gruposController.formNuevoGrupo
  );

  router.post(
    "/nuevo-grupo",
    authController.usuarioAutenticado,
    gruposController.subirImagen,
    gruposController.crearGrupo
  );

  // editar grupos
  router.get(
    "/editar-grupo/:grupoId",
    authController.usuarioAutenticado,
    gruposController.formEditarGrupo
  );
  router.post(
    "/editar-grupo/:grupoId",
    authController.usuarioAutenticado,
    gruposController.editarGrupo
  );

  // editar la imagen del grupo
  router.get(
    "/imagen-grupo/:grupoId",
    authController.usuarioAutenticado,
    gruposController.formEditarImagen
  );
  router.post(
    "/imagen-grupo/:grupoId",
    authController.usuarioAutenticado,
    gruposController.subirImagen,
    gruposController.editarImagen
  );

  // eliminar grupos
  router.get(
    "/eliminar-grupo/:grupoId",
    authController.usuarioAutenticado,
    gruposController.formEliminarGrupo
  );
  router.post(
    "/eliminar-grupo/:grupoId",
    authController.usuarioAutenticado,
    gruposController.eliminarImagen
  );

  // nuevos meeti's
  router.get(
    "/nuevo-meeti",
    authController.usuarioAutenticado,
    meetiController.formNuevoMeeti
  );
  return router;
};
