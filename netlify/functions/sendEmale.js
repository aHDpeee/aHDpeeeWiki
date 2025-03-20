const nodemailer = require("nodemailer");

exports.handler = async function(event, context) {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      },
      body: ""
    };
  }

  if (event.httpMethod === "POST") {
    try {
      const { name, email, message } = JSON.parse(event.body);

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,  // Твой email
          pass: process.env.GMAIL_PASSWORD,  // Твой пароль или приложение-пароль
        },
      });

      const mailOptions = {
        from: process.env.GMAIL_USER, // Отправитель (лучше оставить свой email)
        replyTo: email, // Пользовательский email (для ответа)
        to: "andreyborisov08@yandex.ru",  // Твой email, на который будет отправляться письмо
        subject: `Сообщение от ${name || "Без имени"}`,
        text: message || "Пустое сообщение",
      };

      await transporter.sendMail(mailOptions);

      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ message: "Email отправлен успешно!" })
      };
    } catch (error) {
      return {
        statusCode: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ message: "Ошибка при отправке email.", error: error.message })
      };
    }
  } else {
    return {
      statusCode: 405,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ message: "Метод не поддерживается." })
    };
  }
};