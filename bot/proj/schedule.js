const cron = require('node-cron')
const sequelize = require('./database/db')
const {morning, evening, WeekReport, times, last_times} = require('./Keyboard');
const {personal, reports, not_working} = require("./database/models");
const {Op} = require("sequelize");
const {format} = require("date-fns");
const {webAppUrl} = require("./ProjectConfig");


cron.schedule('15 17 * * 1-5', () =>{
    not_working.findAll({where:{status: "S", end: format(new Date(), 'yyyy-MM-dd')}, raw: true })
        .then(user=>{
            user.forEach(async item =>  {
                const mes = await bot.sendMessage(item.chat_id, 'какой статус вашего больничного?', {
                    reply_markup:{
                        inline_keyboard:[
                            [{text: 'Выбрать дату приема', web_app:{url: webAppUrl+'sick.php'}},
                                {text: 'Больничный закончился',
                                    callback_data: 'Больничный закончился'}]
                        ]
                    }
                })

                await bot.editMessageReplyMarkup({
                    inline_keyboard: [
                        [{
                            text: 'Выбрать дату приема',
                            web_app:{url: webAppUrl+'sick.php?message_id='+mes.message_id}

                        },
                            {text: 'Больничный закончился',
                                callback_data: 'Больничный закончился'}
                        ]
                    ]
                }, {chat_id: mes.chat.id, message_id: mes.message_id});
            })
        }).catch(err=>console.log(err));
})

cron.schedule('20 11 * * 1', async () => {
    try {
        const users = await personal.findAll({
            where: {
                active: 'Y',
                chat_id: { [Op.not]: null }
            },
            raw: true
        });

        for (const user of users) {
            try {
                const report = await reports.findAll({
                    attributes: ['fact', 'date'],
                    order: ['date'],
                    where: {
                        chat_id: user.chat_id,
                        date: {
                            [Op.and]: {
                                [Op.gte]: format(
                                    new Date(new Date().valueOf() - 1000 * 60 * 60 * 24 * 7),
                                    'yyyy-MM-dd'
                                ),
                                [Op.lt]: format(new Date(), 'yyyy-MM-dd')
                            }
                        }
                    },
                    raw: true
                });

                let abs = '';
                report.forEach((rep) => {
                    const dateWithWeekday = new Date(rep.date).toLocaleString('ru-RU', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                    abs += dateWithWeekday + '\n' + ' ' + rep.fact + '\n' + '\n';
                });

                await bot.sendMessage(user.chat_id, 'Твой отчёт за неделю:');
                const mes = await bot.sendMessage(user.chat_id, abs, WeekReport);

                await bot.editMessageReplyMarkup(
                    {
                        inline_keyboard: [
                            [
                                {
                                    text: 'Подтвердить',
                                    callback_data: 'Подтвердить'
                                },
                                {
                                    text: 'Есть ошибки',
                                    web_app: {
                                        url:
                                            webAppUrl +
                                            'weekly_report.php?message_id=' +
                                            mes.message_id
                                    }
                                }
                            ]
                        ]
                    },
                    { chat_id: mes.chat.id, message_id: mes.message_id }
                );

                await bot.sendMessage(
                    user.chat_id,
                    'Если все в порядке - нажмите "Подтвердить". Если нет - нажмите "Есть ошибки" для отправки уведомления'
                );
            } catch (err) {
                bot.sendMessage(user.chat_id, "Фактов за прошлую неделю не найдено")
                console.error(err);
                continue;
            }
        }
    } catch (err) {
        console.error(err);
    }
});


//Обновление состояния сотрудников
cron.schedule('1 1 * * 1-5', () =>{  
    personal.findAll({where:{active: "Y", chat_id: {[Op.not]: null}}, raw: true })
    .then(user=>{
    user.forEach(item =>
        sequelize.query(`UPDATE personals SET working = 'Y' WHERE chat_id = :id; DO $$ BEGIN IF EXISTS (SELECT status FROM not_working WHERE status='D' AND chat_id = :id AND start <= :date AND "end" >= :date) THEN UPDATE personals SET working = 'D' WHERE chat_id = :id; END IF; IF EXISTS (SELECT status FROM not_working WHERE status='V' AND chat_id = :id AND start <= :date AND "end" >= :date) THEN UPDATE personals SET working = 'V' WHERE chat_id = :id; END IF; IF EXISTS (SELECT status FROM not_working WHERE status='S' AND chat_id = :id AND start <= :date AND "end" >= :date) THEN UPDATE personals SET working = 'S' WHERE chat_id = :id; END IF; END $$;`, {
            replacements: {id: item.chat_id, date: format(new Date(),'yyyy-MM-dd')},
            mapToModel: true,
            type: Op.SELECT,
        })
    )
    }).catch(err=>console.log(err));
})

//Создание отчетов
cron.schedule('2 1 * * 1-5', () =>{  
    personal.findAll({where:{active: "Y", chat_id: {[Op.not]: null}}, raw: true })
    .then(user=>{
    user.forEach(item =>
        sequelize.query("INSERT INTO reports(date, chat_id, worked, time_for_work) SELECT $1, $2, (SELECT CASE WHEN working = 'Y' THEN 'N' ELSE working END FROM personals WHERE chat_id = $2),(SELECT CASE WHEN time_for_work = '-1' THEN '-1' WHEN time_for_work = '0' THEN '0' WHEN time_for_work = '+1' THEN '+1' END FROM personals WHERE chat_id = $2)  WHERE NOT EXISTS (SELECT * FROM reports WHERE date = $1 AND chat_id = $2) AND EXISTS (SELECT * FROM personals WHERE chat_id = $2)", {
            bind:[format(new Date(),'yyyy-MM-dd'),item.chat_id],
            model: reports,   
            mapToModel: true,
            type: Op.SELECT,
        })
    )
    }).catch(err=>console.log(err));
})

//План 9:00 
cron.schedule('30 9 * * 1-5', () =>{  
    reports.findAll({where:{worked: 'N', time_for_work: '0', tasks: null, date: format(new Date(),'yyyy-MM-dd')}, raw: true })
    .then(user=>{
        user.forEach(item => bot.sendMessage(item.chat_id, 'Доброе утро! Что на сегодня запланировано?', morning));

    }).catch(err=>console.log(err));
})

//Факт 18:00
cron.schedule('55 17 * * 1-5', () =>{            
    reports.findAll({where:{worked: 'N', time_for_work: '0', fact: null, date: format(new Date(),'yyyy-MM-dd')}, raw: true })
    .then(user=>{
        user.forEach(item => 
           { current_task.findOne({where:{ chat_id: item.chat_id}, raw: true })
                .then(async user=>{
                 if (!user || !user.tasks.join('\n')) { 
                  return  bot.sendMessage(item.chat_id, 'Готов отчитаться за день?',evening);  
                }    
                else{
                await bot.sendMessage(item.chat_id,` Ваши записи за сегодня:\n${user.tasks.join('\n')}` ) ; 
                await bot.sendMessage(item.chat_id, 'Готов отчитаться за день?',evening)  
                }                
                
                }).catch(err=>console.log(err));
        }
            );
    }).catch(err=>console.log(err));
})

//План 10:00 
cron.schedule('30 10 * * 1-5', () =>{  
    reports.findAll({where:{worked: 'N', time_for_work: '+1', tasks: null, date: format(new Date(),'yyyy-MM-dd')}, raw: true })
    .then(user=>{
        user.forEach(item => bot.sendMessage(item.chat_id, 'Доброе утро! Что на сегодня запланировано?', morning));
    }).catch(err=>console.log(err));
})

//Факт 19:00
cron.schedule('55 18 * * 1-5', () =>{            
    reports.findAll({where:{worked: 'N', time_for_work: '+1', fact: null, date: format(new Date(),'yyyy-MM-dd')}, raw: true })
    .then(user=>{
        user.forEach(item => 
           { current_task.findOne({where:{ chat_id: item.chat_id}, raw: true })
                .then(async user=>{
                 if (!user || !user.tasks.join('\n')) { 
                  return  bot.sendMessage(item.chat_id, 'Готов отчитаться за день?',evening);  
                }    
                else{
                await bot.sendMessage(item.chat_id,` Ваши записи за сегодня:\n${user.tasks.join('\n')}` ) ; 
                await bot.sendMessage(item.chat_id, 'Готов отчитаться за день?',evening)  
                }                
                
                }).catch(err=>console.log(err));
        }
            );
    }).catch(err=>console.log(err));
})

//План 8:00 
cron.schedule('30 8 * * 1-5', () =>{  
    reports.findAll({where:{worked: 'N', time_for_work: '-1', tasks: null, date: format(new Date(),'yyyy-MM-dd')}, raw: true })
    .then(user=>{
        user.forEach(item => bot.sendMessage(item.chat_id, 'Доброе утро! Что на сегодня запланировано?', morning));
    }).catch(err=>console.log(err));
})

//Факт 17:00
cron.schedule('55 16 * * 1-5', () =>{            
    reports.findAll({where:{worked: 'N', time_for_work: '-1', fact: null, date: format(new Date(),'yyyy-MM-dd')}, raw: true })
    .then(user=>{
        user.forEach(item => 
           { current_task.findOne({where:{ chat_id: item.chat_id}, raw: true })
                .then(async user=>{
                 if (!user || !user.tasks.join('\n')) { 
                  return  bot.sendMessage(item.chat_id, 'Готов отчитаться за день?',evening);  
                }    
                else{
                await bot.sendMessage(item.chat_id,` Ваши записи за сегодня:\n${user.tasks.join('\n')}` ) ; 
                await bot.sendMessage(item.chat_id, 'Готов отчитаться за день?',evening)  
                }                
                
                }).catch(err=>console.log(err));
        }
            );
    }).catch(err=>console.log(err));
})