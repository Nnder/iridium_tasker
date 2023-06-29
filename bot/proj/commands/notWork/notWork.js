// позволяет взять больнычный, отпуск, неоплычиваемый отпуск, поход к доктору
// принимает дату(от, до), тип (больничный, отпуск..), сообщение и состояние(принято/отклонено)
// на нем формирует сообщение
// отпровляет всем админам(role) сформированное сообщение с 2 кнопками (принять/отклонить)


const {bot,webAppUrl} = require("../../index");
const {setUTC} = require("../task/getTask");
const {freeDays, users} = require("../../database/models");
const {where, Op} = require("sequelize");

async function notify(chat_id, message, cause) {
    let user = await users.findOne({where:{ chat_id: chat_id}})
    let TeamLead = await users.findOne({ where: {team: user.team, role: 2}})
    let STO = await users.findOne({ where: {role: 3}})

    let text = `Уведомление!\n${user.fio}\nПричина: ${cause}\n${message}`

    if (TeamLead){
        bot.sendMessage(TeamLead.chat_id, text)
    }
    if (STO){
        bot.sendMessage(STO.chat_id, text)
    }
}

async function takeOneDay(task, cause, chat_id, msg){
    let taskDate = task.date

    await freeDays.create(
        {
            chat_id: chat_id,
            status: true,
            cause: cause,
            message: msg.text,
            from: taskDate,
            to: taskDate
        }
    )

    await task.destroy();
    await users.update({ status: false }, {
        where: {
            chat_id: chat_id
        }
    });

    notify(chat_id, msg.text, cause);
}

async function notWork(msg, task){
    const chat_id = msg.chat.id;
    const keyboardNotWork = {
        reply_markup:
            {
                inline_keyboard: [
                    [
                        { text: "Взять день", callback_data: JSON.stringify({type: "Take a day", chat_id: msg.chat.id}) },
                        { text: "К врачу", callback_data: JSON.stringify({type: "Go to doctor", chat_id: msg.chat.id}) },
                        { text: "На больничный", callback_data: JSON.stringify({type: "Take a sick", chat_id: msg.chat.id}) },
                        { text: "Другое", callback_data: JSON.stringify({type: "Other", chat_id: msg.chat.id}) },
                    ],
                ],
            }
    };
    const messageWithKeyboard = await bot.sendMessage(chat_id, "Выберите причину", keyboardNotWork);


    const timer = setTimeout(()=>{
        const {message_id} = messageWithKeyboard;
        bot.editMessageReplyMarkup({inline_keyboard: []}, {chat_id, message_id})
        bot.sendMessage(chat_id, "Вы не ввели причину почему не работаете");
    }, 1000*60*60*10);

    let countClick = 0;

    bot.on('callback_query', async function onCallbackQuery(callbackQuery) {

        const {type,} = JSON.parse(callbackQuery.data);
        const chat_id = callbackQuery.message.chat.id;
        const message_id = callbackQuery.message.message_id;

        await bot.answerCallbackQuery(callbackQuery.id)

        ++countClick

        if (countClick === 1) {
            clearTimeout(timer)
            await bot.editMessageReplyMarkup({inline_keyboard: []}, {chat_id, message_id})

            const webAppKeyboard = {
                reply_markup: {
                    inline_keyboard: [
                        [{text:"Выбрать дату", web_app: {url: webAppUrl}}]
                    ]
                }
            }

            try {
                switch (type) {
                    case "Take a day":
                        bot.sendMessage(chat_id, "Введите сообщение для СТО и TeamLead", webAppKeyboard);

                        bot.onText(/\.*/gmi , async (msg)=>{
                            takeOneDay(task, "Взять день", chat_id, msg);
                            bot.sendMessage(chat_id, "Ваш запрос принят");
                            bot.removeTextListener(/\.*/gmi);
                        })
                        break;
                    case "Go to doctor":
                        bot.sendMessage(chat_id, "Введите сообщение для СТО и TeamLead");

                        bot.onText(/\.*/gmi , async (msg)=>{
                            takeOneDay(task,  "К врачу", chat_id, msg);;
                            bot.sendMessage(chat_id, "Ваш запрос принят");
                            bot.removeTextListener(/\.*/gmi);
                        })
                        break;
                    case "Take a sick":

                        bot.sendMessage(chat_id, "Введите сообщение для СТО и TeamLead");

                        bot.onText(/\.*/gmi , async (msg)=>{
                            // await plan(msg, match)

                            bot.sendMessage(chat_id, msg.text)
                            bot.removeTextListener(/\.*/gmi);
                            // await debt(msg, match);
                        })
                        break;
                    case "Other":

                        bot.sendMessage(chat_id, "Введите сообщение для СТО и TeamLead");

                        bot.onText(/\.*/gmi , async (msg)=>{
                            // await plan(msg, match)

                            bot.sendMessage(chat_id, msg.text)
                            bot.removeTextListener(/\.*/gmi);
                            // await debt(msg, match);
                        })
                        break;
                }
            } catch (e){
                bot.sendMessage(chat_id, "Ошибка! Что-то пошло не так");
            }
        }

    });
}

module.exports = {
    notWork
}