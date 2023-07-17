const { users } = require("../database/models");
const sequelize = require("../database/db");
const { Op } = require("sequelize");
const { bot } = require("../index");
const { info } = require("./user/info");
const { getTaskForToday, setUTC } = require("./task/getTask");
const { startPlan } = require("./task/plan");

// Код писал не я только немного отрефакторил
async function start(msg, match) {
  const chatId = msg.chat.id;

  const remove = {
    reply_markup: {
      remove_keyboard: true,
      keyboard: [],
    },
  };

  const reqPhone = {
    reply_markup: {
      remove_keyboard: true,
      keyboard: [
        [
          {
            text: "Отправить мой номер",
            request_contact: true,
          },
        ],
        ["Отмена"],
      ],
    },
  };
  const isIdUnique = async (chat_id) =>
    await users.findOne({ where: { chat_id }, attributes: ["chat_id"] });

  if (await isIdUnique(chatId)) {
    await bot.sendMessage(chatId, "Вы уже зарегистрированы", remove);
  } else {
    await bot.sendMessage(
      chatId,
      "Вас нет в списке, отправьте номер ",
      reqPhone,
    );

    const regexp = new RegExp(`contact|${chatId}`, "");

    await bot.on("contact", async (msg) => {
      if (chatId === msg.chat.id) {
        const telUser = msg.contact.phone_number.replace("+", "");
        const exist = await getTaskForToday(msg.chat.id, setUTC(new Date()));

        const isIdUnique = (phone) =>
          users
            .findOne({ where: { phone }, attributes: ["phone"] })
            .then((token) => token !== null);

        isIdUnique(telUser).then((isUnique) => {
          if (isUnique) {
            bot.sendMessage(
              chatId,
              "Вы можете начать работать с ботом",
              remove,
            );
            sequelize.query("UPDATE users SET chat_id = $2 WHERE phone = $1", {
              bind: [telUser, chatId],
              model: users,
              mapToModel: true,
              type: Op.SELECT,
            });

            info(msg, match).then(() => {
              if (exist !== null && exist?.plan) {
                bot.sendMessage(msg.chat.id, "Ваш план \n" + exist?.plan);
              } else {
                startPlan(msg.chat.id);
              }
            });
          } else {
            bot.sendMessage(
              chatId,
              "Вас нет в списке, обратитесь к администратору",
              remove,
            );
          }
        });
      }
    });
  }
}

module.exports = {
  start,
};
