const express = require('express');

const {addEmployee,employees,employee, updateEmployee, deleteEmployee,login, protect} = require('../controllers/employeeController.js');
const { cloudinaryFileUploader } = require('../middlewares/FileUploader.js');
const router = express.Router();


router
    .route('/login')
    .post(login);
router
    .route('/')
    .post(cloudinaryFileUploader.single('image'),addEmployee)
    .get(employees)

router
    .route('/:id')
    .get(employee)
    .put(cloudinaryFileUploader.single('image'),updateEmployee)
    .delete(deleteEmployee)

module.exports = router;