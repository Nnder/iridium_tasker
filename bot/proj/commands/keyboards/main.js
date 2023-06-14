const mainKeyboard = {
    reply_markup: {
        remove_keyboard: true,
        keyboard: [
            [{
                text: "/addTask", callback_data:"/addTask",
            },
            {
                text: "/taskList", callback_data:"/taskList",
            }
            ],
            ["Отмена"]
        ]
    }
}


module.exports = {
    mainKeyboard
}
