const {Sequelize} = require('sequelize');

const sequelize = new Sequelize(
    // 'postgres://grimksi:4QbYXDPrdy9k@ep-wispy-heart-761564.eu-central-1.aws.neon.tech/neondb?ssl=true',
    'postgres://postgres:Zd3NNXXkI3JGoDnoXGCD@containers-us-west-3.railway.app:7251/railway',
    {
        host:'containers-us-west-3.railway.app',
        port: '7251',
        dialect: 'postgres',
        define: {
            timestamps: false
        }
    }
)

// sequelize.sync();
module.exports = sequelize


// (async () => {
//     await sequelize.sync({ force: true });
//     // Code here
// })();

// async function test(){
//     try {
//         await sequelize.authenticate();
//         console.log('Connection to database has been established successfully.');
//     } catch (error) {
//         console.error('Unable to connect to the database:', error);
//     }
// }
//
// test();


// localdb

// module.exports
// {
//     const sequelize = new Sequelize(
//         'localdb',
//         'admin',
//         'gA2fsahaf',
//         {
//             host: 'localhost',
//             dialect: 'postgres',
//             timestamps: false
//         }
//     );
// }