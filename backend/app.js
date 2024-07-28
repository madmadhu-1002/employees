const express = require('express');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');

const employeeRoutes = require('./routes/employeeRoutes.js');
const AppError = require('./utils/appError.js');
const globalErrorHandler = require('./controllers/errorController.js');
const organizationRouter = require('./routes/organizationRoutes.js');

const app = express();
app.use(cors());
app.use(express.json({limit:'20kb'}));

//security middlewares
app.use('/api',rateLimit({
    max:50,
    windowMs:60*60*1000,
    message:'please use this api after one hour.'
}));
app.use(mongoSanitize());
app.use(helmet());

//Routes
app.get('/',(req,res,next) => {
    res.send('hy');
})

app.use('/api/employees',employeeRoutes);
app.use('/api/ops',organizationRouter);

app.all('*',(req,res,next) => {
    return next(new AppError(`The requested url ${req.url} does not exists.`,404));
});

app.use(globalErrorHandler);

module.exports = app;