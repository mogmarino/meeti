const nodemailer = require("nodemailer");
const fs = require("fs");
const util = require("util");
const ejs = require("ejs");
const emailCredentials = require("../config/emails");

let transport = nodemailer.createTransport({
  host: emailCredentials.host,
  port: emailCredentials.port,
  auth: {
    user: emailCredentials.user,
    pass: emailCredentials.pass,
  },
});

exports.enviarEmail = async (opciones) => {
  // console.log(opciones);

  //leer el archivo para el mail
  const archivo = __dirname + `/../views/emails/${opciones.archivo}.ejs`;

  //compilarlo
  const compilado = ejs.compile(fs.readFileSync(archivo, "utf8"));

  //crear el HTML
  const html = compilado({ url: opciones.url });

  //configurar las opciones del email
  const opcionesEmail = {
    from: "Meeti <noreplay@meeti.com>",
    to: opciones.usuario.email,
    subject: opciones.subject,
    html,
  };

  //enviar el email
  const sendEmail = util.promisify(transport.sendMail, transport);
  return sendEmail.call(transport, opcionesEmail);
};
