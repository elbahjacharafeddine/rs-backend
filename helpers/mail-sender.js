const nodemailer = require("nodemailer");
const config = require("../config");

exports.sendEmail = function (user) {

  console.log(config.EMAIL_PASSWORD, config.EMAIL_ADDRESS);
  const promise = new Promise((resolve, reject) => {
    console.log(__dirname + "../public/mail-template.html");
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config.EMAIL_ADDRESS,
        pass: config.EMAIL_PASSWORD,
      },
      tls: { rejectUnauthorized: false },
    });

    let mailOptions = {
      from: config.EMAIL_ADDRESS,
      to: user.email,
      subject: "Inscription à la plateforme",
      html:
        "<p>Vous avez été invité à adhérer à la plateforme de suivi des " +
        "activités de recherche. Pour confirmer votre inscription veuillez vous connecter à l'adresse suivante: " +
        config.APPLICATION_URL +
        ". Vos identifiants sont : <p> Email : " +
        user.email +
        " <br>Mot de passe provisoire: " +
        user.generatedPassword +
        " </p>",
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        resolve(user);
      }
    });
  });

  return promise;
};
