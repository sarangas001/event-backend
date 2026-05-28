const app = require('./app.js');
const connect = require('./config/DBconnection.js')
const seedDefaults = require('./config/seedDefaults.js');



const host = process.env.HOST;
const port = process.env.PORT || 3001;

(async () => {
    await connect();
    await seedDefaults();

    const server = app.listen(port, host, () => {
        console.log(`Connected Succsfully !! port : ${server.address().port}`)
    })
})().catch((error) => {
    console.error('Failed to start server', error);
});
