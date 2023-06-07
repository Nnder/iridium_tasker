// запускается 1 раз больше не работает
// вызывает команды
// setFIO (не нужна)
// график работы (не нужна)
// setPhone (нужна)
// changeTeam (нужна)
// profession (не нужна)

// checkPhone (нужна)
// info (нужна)
// changeTeam (нужна)

function checkUser(){
    const reqPhone = {
        reply_markup: {
            remove_keyboard: true,
            keyboard: [
                [{
                    text: "Отправить мой номер",
                    request_contact: true,
                }],
                ["Отмена"]
            ]
        }
    }
}

function start(msg, match){
    const chatId = msg.chat.id;
    const resp = match[1]; // the captured "whatever"

    // send back the matched "whatever" to the chat
    bot.sendMessage(chatId, resp);
}