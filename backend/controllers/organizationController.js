const mongoose = require('mongoose');

const Employee = require('../models/employeeModel.js'); // Import your Mongoose model
const AppError = require('../utils/appError.js');
const catchAsync = require('../utils/catchAsync.js');



exports.findEmployeeManager = catchAsync(async (req,res,next) => {
    const employeeId = req.params.id;
    const result = await Employee.aggregate([
        
        { $match: { _id: new mongoose.Types.ObjectId(employeeId) } },
        // Lookup to find the manager recursively
        {
          $graphLookup: {
            from: 'employees', // Collection name
            startWith: '$manager', // Start with the employee's manager field
            connectFromField: 'manager', // Field to connect from in the 'employees' collection
            connectToField: '_id', // Field to connect to in the 'employees' collection
            as: 'managerHierarchy', // Output field containing the hierarchy
            maxDepth: 10 // Maximum depth to search (adjust as necessary)
          }
        },
        // Project to include only the manager at the top of the hierarchy
        {
          $project: {
            manager: { $arrayElemAt: ['$managerHierarchy', 1] } // Get the second element (index 1) which is the immediate manager
          }
        }
      ]);
  
      if (result.length === 0 || !result[0].manager) {
        console.log('Manager not found');
        return next(new AppError('manager not found.',404))
      }
      console.log(`Manager of employee ${employeeId} is: ${result[0].manager.name}`);
      const manager = result[0].manager.name;
      res.status(200).json({
        status:'success',
        data:{
            manager
        }
      });

})


