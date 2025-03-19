const nodemailer = require("nodemailer");

exports.handler = async function(event, context) {
  if (event.httpMethod === "POST") {
    const { name, email, message } = JSON.parse(event.body);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,  // Твой email
        pass: process.env.GMAIL_PASSWORD,  // Твой пароль или приложение-пароль
      },
    });

    const mailOptions = {
      from: email,
      to: "andreyborisov08@yandex.ru",  // Твой email, на который будет отправляться письмо
      subject: `Сообщение от ${name}`,
      text: message,
    };

    try {
      await transporter.sendMail(mailOptions);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Email отправлен успешно!" }),
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Ошибка при отправке email.", error }),
      };
    }
  } else {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Метод не поддерживается." }),
    };
  }
};
