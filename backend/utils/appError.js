class AppError extends Error{
    constructor(mess,statusCode){
        super(mess);
        this.statusCode=statusCode;
        this.status=`${this.statusCode}`.startsWith('4')?'failed':'error';
        this.success= false,
        this.isOperational=true;

        Error.captureStackTrace(this,this.constructor);
    }
}

module.exports = AppError;