const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const catchAsync = require('../utils/catchAsync.js');
const Employee = require('../models/employeeModel.js');
const AppError = require('../utils/appError.js');

exports.addEmployee = catchAsync(async (req, res, next) => {
  const body = req.body;
  const profileImage = req.file ? req.file.path : null;
  body.image = profileImage;

  const employee = await Employee.create(body);

  res.status(200).json({
    status: 'success',
    success:true,
    message:'employee created',
    data: {
      employee,
    },
  });
});

exports.employees = catchAsync(async (req, res, next) => {
  let { page, limit, search } = req.query;

  // Set default values if they are not provided
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;

  // Calculate the number of documents to skip
  const skip = (page - 1) * limit;

  // Build the search criteria
  let searchCriteria = {};
  if (search) {
    searchCriteria = {
      name: {
        $regex: search,
        $options: 'i', // case insensitive
      },
    };
  }

  const totalEmployees = await Employee.countDocuments(searchCriteria);
  const employees = await Employee.find(searchCriteria)
    .skip(skip)
    .limit(limit)
    .sort({ updatedAt: -1 });
  const totalPages = Math.ceil(totalEmployees / limit);
  res.status(200).json({
    message: 'All Employees',
    success: true,
    data: {
        employees,
        pagination: {
            totalEmployees,
            currentPage: page,
            totalPages,
            pageSize: limit
        }
    }
});
});

exports.employee = catchAsync(async (req, res, next) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) {
    return next(new AppError('Employee not found.', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      employee,
    },
  });
});

exports.updateEmployee = catchAsync(async (req, res, next) => {
  const updatedEmployee = await Employee.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedEmployee) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    success:true,
    message:'employee updated',
    data: {
      updatedEmployee,
    },
  });
});

exports.deleteEmployee = catchAsync(async (req, res, next) => {
  const employee = await Employee.findByIdAndDelete(req.params.id);

  if (!employee) {
    return next(new AppError('No Employee found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    success:true,
    message:'employee deleted',
    data: null,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const employee = await Employee.findOne({ email });
  if (!employee) {
    return next(new AppError('user does not exists.', 404));
  }

  if (employee.position !== 'manager') {
    return next(new AppError('you are not accessed.', 400));
  }
  const token = jwt.sign({ id: employee.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    secure: true,
    httpOnly: true,
  };

  res.cookie('jwt', token, cookieOptions);

  res.status(200).json({
    status: 'success',
    token,
    data: {
      employee,
    },
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentEmployee = await Employee.findById(decoded.id);
  if (!currentEmployee) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }
  next();
});
