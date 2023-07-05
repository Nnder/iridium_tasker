const sequelize = require('./db')
const {DataTypes} = require('sequelize')

const users = sequelize.define('users',
    {
        phone:{
            type: DataTypes.CHAR(11),
            primaryKey: true,
            autoIncrement: false,
            allowNull: false
        },
        chat_id:{
            type: DataTypes.BIGINT,
        },
        fio:{
            type:DataTypes.CHAR(100),
        },
        team:{
            type:DataTypes.CHAR(100),
        },
// Должность (стажер, программист, дизайнер) здесь могут совмещать несколько должностей (Программист и Стажер)
        profession:{
            type:DataTypes.CHAR(100),
        },
// Права доступа 1-4
        role:{
            type: DataTypes.SMALLINT,
        },
 // время работы (будет выглядеть так) 10-16 (в качестве примера наш график работы) (пускай пока будет так может потом изменим)
        work_time:{
            type:DataTypes.CHAR(20),
        },
// работает ли user true/false (не будет работать если взят отпуск, больничный и тд)
        status:{
            type: DataTypes.BOOLEAN,
        },
    },
)
module.exports.users = users;


// tasks{
//   id
//   chat_id
//   plan
//   fact
//   date
// }

const tasks = sequelize.define('tasks',
    {
        id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        chat_id: {
            type: DataTypes.BIGINT,
        },
        plan:{
            type:DataTypes.TEXT,
        },
        fact:{
            type:DataTypes.TEXT,
        },
// дата создания задача
        date: {
            type: DataTypes.DATE
        },
        hours: {
            type: DataTypes.TIME
        }
    },
)
module.exports.tasks = tasks;

// таблица для записи user на больничный, отпуск и тд
const freeDays = sequelize.define('freedays',
    {
        id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        chat_id:{
            type: DataTypes.BIGINT,
        },
// Подтвердили ли больничный true/false
        status:{
            type: DataTypes.BOOLEAN,
        },
// причина (Больничный, Отпуск...)
        cause:{
            type:DataTypes.CHAR(100),
        },
// Сообщение от user чтоб он мог объяснить причину или чето еще
        message:{
            type:DataTypes.TEXT,
        },
// дата начала
        from: {
            type: DataTypes.DATE
        },
// дата окончания
        to:{
            type: DataTypes.DATE
        },
    },
)
module.exports.freeDays = freeDays;




// дальше для старой бд но их оставил чтоб потом понять как делались отчеты в exel
// const reports = sequelize.define('reports',
//     {
//         ID:{
//             type: DataTypes.INTEGER,
//             primaryKey: true,
//             autoIncrement: true,
//             allowNull: false
//         },
//         tasks:{
//             type: DataTypes.CHAR()
//         },
//         fact:{
//             type: DataTypes.CHAR()
//         },
//         hours:{
//             type: DataTypes.INTEGER
//         },
//         date:{
//             type: DataTypes.DATEONLY
//         },
//         worked:{
//             type: DataTypes.CHAR()
//         },
//         chat_id:{
//             type: DataTypes.BIGINT,
//         },
//         time_for_work:{
//             type: DataTypes.CHAR
//         }
//
//     },
//     {freezeTableName: true},
// )
// module.exports.reports = reports;
//
// const report_aprove = sequelize.define('report_aprove',
//     {
//         id:{
//             type: DataTypes.INTEGER,
//             primaryKey: true,
//             autoIncrement: true,
//             allowNull: false
//         },
//         chat_id:{
//             type: DataTypes.BIGINT
//         },
//         fact1:{
//             type: DataTypes.CHAR()
//         },
//         hours1:{
//             type: DataTypes.INTEGER
//         },
//         date1:{
//             type: DataTypes.DATEONLY
//         },
//         worked1:{
//             type: DataTypes.CHAR()
//         },
//         time_work1:{
//             type: DataTypes.CHAR()
//         },
//         fact2:{
//             type: DataTypes.CHAR()
//         },
//         hours2:{
//             type: DataTypes.INTEGER
//         },
//         date2:{
//             type: DataTypes.DATEONLY
//         },
//         worked2:{
//             type: DataTypes.CHAR()
//         },
//         time_work2:{
//             type: DataTypes.CHAR()
//         },
//         fact3:{
//             type: DataTypes.CHAR()
//         },
//         hours3:{
//             type: DataTypes.INTEGER
//         },
//         date3:{
//             type: DataTypes.DATEONLY
//         },
//         worked3:{
//             type: DataTypes.CHAR()
//         },
//         time_work3:{
//             type: DataTypes.CHAR()
//         },
//         fact4:{
//             type: DataTypes.CHAR()
//         },
//         hours4:{
//             type: DataTypes.INTEGER
//         },
//         date4:{
//             type: DataTypes.DATEONLY
//         },
//         worked4:{
//             type: DataTypes.CHAR()
//         },
//         time_work4:{
//             type: DataTypes.CHAR()
//         },
//         fact5:{
//             type: DataTypes.CHAR()
//         },
//         hours5:{
//             type: DataTypes.INTEGER
//         },
//         date5:{
//             type: DataTypes.DATEONLY
//         },
//         worked5:{
//             type: DataTypes.CHAR()
//         },
//         time_work5:{
//             type: DataTypes.CHAR()
//         }
//     },
//     {freezeTableName: true}
// )
// module.exports.report_aprove = report_aprove;
//
// const vacation_aprove = sequelize.define('vacation_aprove',
//     {
//         id:{
//             type: DataTypes.INTEGER,
//             primaryKey: true,
//             autoIncrement: true,
//             allowNull: false
//         },
//         chat_id:{
//             type: DataTypes.BIGINT
//         },
//         start:{
//             type: DataTypes.DATEONLY
//         },
//         end:{
//             type: DataTypes.DATEONLY
//         },
//         status:{
//             type: DataTypes.CHAR
//         }
//     },
//     {freezeTableName: true}
// )
// module.exports.vacation_aprove = vacation_aprove;
//
// const not_working = sequelize.define('not_working',
//     {
//         id:{
//             type: DataTypes.INTEGER,
//             primaryKey: true,
//             autoIncrement: true,
//             allowNull: false
//         },
//         chat_id:{
//             type: DataTypes.BIGINT
//         },
//         start:{
//             type: DataTypes.DATEONLY
//         },
//         end:{
//             type: DataTypes.DATEONLY
//         },
//         status:{
//             type: DataTypes.CHAR
//         }
//     },
//     {freezeTableName: true}
// )
// module.exports.not_working = not_working;
//
// const current_task = sequelize.define('current_task',
//     {
//         chat_id:{
//             type: DataTypes.BIGINT,
//             primaryKey: true,
//         },
//         tasks:{
//             type: DataTypes.ARRAY(DataTypes.STRING)
//         },
//
//     },
//     {freezeTableName: true}
// )
// module.exports.current_task = current_task;