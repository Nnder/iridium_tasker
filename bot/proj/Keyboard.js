const webAppUrl = require('./ProjectConfig')

module.exports = {

    morning : {
        reply_markup: {
            inline_keyboard: [
                [{
                    text: 'Ввести план на день',
                    callback_data: 'Ввести план на день'
                }, {
                    text: 'Сегодня не работаю',
                    callback_data: 'Сегодня не работаю'
                }]
            ]
        }
    },

    evening : {
        reply_markup: {
            inline_keyboard: [
                [{
                    text: 'Ввести факт',
                    callback_data: 'Ввести факт'
                }, {
                    text: 'Сегодня не работал',
                    callback_data: 'Сегодня не работал'
                }]
            ]
        }
    },

    WeekReport : {
        reply_markup: {
            inline_keyboard: [
                [{
                    text: 'Подтвердить',
                    callback_data: 'Подтвердить'
                }, {
                    text: 'Есть ошибки',
                    web_app: {url: webAppUrl + 'weekly_report.php'},
                }]
            ]
        }
    },

    times : {
        reply_markup: {
            inline_keyboard: [
                [{
                    text: 'Полный рабочий день',
                    callback_data: 'Полный рабочий день'
                }, {
                    text: 'Ввести часы работы',
                    web_app: {url: webAppUrl + 'clock.php?date:'}

                }]
            ]
        }
    },

    last_times : {
        reply_markup: {
            inline_keyboard: [
                [{
                    text: 'Полный рабочий день',
                    callback_data: 'Полный рабочий день вчера'
                }, {
                    text: 'Ввести часы работы',
                    web_app: {url: webAppUrl + 'clock.php?date:'}

                }]
            ]
        }
    },

    time_for_work_1 : {
        reply_markup: {
            inline_keyboard: [
                [{
                    text: '9:00 - 18:00',
                    callback_data: '9:00 - 18:00'
                }, {
                    text: '10:00 - 19:00',
                    callback_data: '10:00 - 19:00'

                }]
            ]
        }
    },

     time_for_work_2 : {
        reply_markup: {
            inline_keyboard: [
                [{
                    text: '8:00 - 17:00',
                    callback_data: '8:00 - 17:00'
                }, {
                    text: '10:00 - 19:00',
                    callback_data: '10:00 - 19:00'

                }]
            ]
        }
    },

    time_for_work_3 : {
        reply_markup: {
            inline_keyboard: [
                [{
                    text: '8:00 - 17:00',
                    callback_data: '8:00 - 17:00'
                }, {
                    text: '9:00 - 18:00',
                    callback_data: '9:00 - 18:00'

                }]
            ]
        }
    },

}