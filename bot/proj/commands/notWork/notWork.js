// позволяет взять больнычный, отпуск, неоплычиваемый отпуск, поход к доктору
// принимает дату(от, до), тип (больничный, отпуск..), сообщение и состояние(принято/отклонено)
// на нем формирует сообщение
// отпровляет всем админам(role) сформированное сообщение с 2 кнопками (принять/отклонить)


const {bot,webAppUrl} = require("../../index");
const {setUTC} = require("../task/getTask");
const {freeDays, users, tasks} = require("../../database/models");
const {where, Op} = require("sequelize");



const express = require('express');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());

app.post('/web-data', async (req, res) => {
    console.log(req.body);
    try {

        const {cause, message, from, to, user_id} = req.body

        const user = await users.findOne({where:{ chat_id: user_id}})
        const lead = await users.findOne({ where: {team: user.team, role: 2}})
        const sto = await users.findOne({ where: {role: 3}})


        let text = `Уведомление!\n${user.fio}\nКоманда: ${user.team}\nПричина: ${cause}\nДата: ${from} - ${to}\n${message}`

        let keyboard = {
            reply_markup:
                {
                    inline_keyboard: [
                        [
                            { text: "Подтвердить", callback_data: JSON.stringify({type: "Confirm", chat_id: user_id, }) },
                            { text: "Отказать", callback_data: JSON.stringify({type: "Refuse", chat_id: user_id}) },
                        ],
                    ],
                }
        };

        let free = await freeDays.create(
            {
                chat_id: user_id,
                status: false,
                cause: cause,
                message: message,
                from,
                to
            }
        )

        bot.sendMessage(sto.chat_id, text, keyboard);

        bot.on('callback_query', async function onCallbackQuery(callbackQuery) {

            const {type, chat_id} = JSON.parse(callbackQuery.data);
            const chat_id_sto = callbackQuery.message.chat.id;
            const message_id = callbackQuery.message.message_id;

            await bot.answerCallbackQuery(callbackQuery.id)


            switch (type) {
                case "Confirm":

                    free.update({
                        status: true
                    })

                    // проверка на промежуток времени в задаче

                    // if (new Date(from) <= new Date(task.date) && new Date(to) > new Date(task.date)) {
                    //     await users.update({ status: false }, {
                    //         where: {
                    //             chat_id: chat_id
                    //         }
                    //     });
                    // }




                    bot.sendMessage(chat_id_sto, "Вы подтвердили запрос")
                    bot.sendMessage(chat_id, "Запрос подтвержден");
                    bot.sendMessage(lead.chat_id, "СТО подтвердил запрос\n"+text)

                    break;
                case "Refuse":
                    bot.sendMessage(chat_id_sto, "Вы отклонили запрос")
                    bot.sendMessage(chat_id, "Запрос отклонен");
                    break;
            }


        })


        return res.status(200).json({});
    } catch (e) {
        return res.status(500).json({})
    }
})


app.post('/web-time', async (req, res) => {
    console.log(req.body);
    try {

        const {from, to, result, user_id, task_id} = req.body

        const task = await tasks.findOne({where:{ id: task_id}})
        task.update({hours: result});


        bot.sendMessage(user_id, `Время работы ${from} - ${to}`);


        return res.status(200).json({});
    } catch (e) {
        return res.status(500).json({})
    }
})

const PORT = 3000;

app.listen(PORT, () => console.log('server started on PORT ' + PORT));



async function notWork(msg, task){
    const chat_id = msg.chat.id;


    await task.destroy();

    const webAppKeyboard = {
        reply_markup: {
            inline_keyboard: [
                [{text:"Форма", web_app: {url: `${webAppUrl}/free.html?user=${chat_id}`}}]
            ]
        }
    }

    const messageWithKeyboard = await bot.sendMessage(chat_id, "Заполните форму", webAppKeyboard);


    const timer = setTimeout(()=>{
        const {message_id} = messageWithKeyboard;
        bot.editMessageReplyMarkup({inline_keyboard: []}, {chat_id, message_id})
        bot.sendMessage(chat_id, "Вы не ввели причину почему не работаете");
    }, 1000*60*60*10);
}

module.exports = {
    notWork
}