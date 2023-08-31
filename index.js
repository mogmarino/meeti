const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const router = require("./routes");
const path = require("path");
require("dotenv").config({ path: ".env" });

const app = express();

// configuramos el template engine
app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./views"));

// archivos estaticos
app.use(express.static("public"));

// middleware (usuario logueado, flash messages, fecha actual)
app.use((req, res, next) => {
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
