const dotenv = require('dotenv');
const mongoose = require('mongoose');

process.on('uncaughtException',(err)=>{
    console.log("uncaught exception exiting ...",err);
    process.exit(1);
});

dotenv.config({path:'./config.env'});
const app = require('./app.js');

mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log('database connected successfully.');
    })

const server = app.listen(process.env.PORT,() => {
    console.log("server started succesfully");
});

process.on('unhandledRejection',(err)=>{
    console.log(err);
    server.close();
    process.exit(1);
});