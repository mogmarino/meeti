const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const router = require("./routes");
const passport = require("./config/passport");
const path = require("path");
const flash = require("connect-flash");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const db = require("./config/db");
// Conexion y Modelos BD
db.sync()
  .then(() => console.log("DB conectada"))
  .catch((error) => console.log(error));
require("./models/Usuarios");
require("./models/Categorias");
require("./models/Grupos");
// variables de desarollo
require("dotenv").config({ path: ".env" });

// aplicacion principal
const app = express();

// habilitar bodyparser para los formularios
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// configuramos el template engine
app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./views"));

// archivos estaticos
app.use(express.static("public"));

// habilitar cooki parser
app.use(cookieParser());

// crear la sesion
app.use(
  session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
  })
);

// passport
app.use(passport.initialize());
app.use(passport.session());

// agrega flash messages
app.use(flash());

// middleware (usuario logueado, flash messages, fecha actual)
app.use((req, res, next) => {
  res.locals.mensajes = req.flash();
  const fecha = new Date();
  res.locals.year = fecha.getFullYear();

  next();
});

// routing
app.use("/", router());

// agrega el puerto
app.listen(process.env.PORT, () => {
  console.log(`Servidor corriendo en el puerto ${process.env.PORT}`);
});
