const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true,'Provide name']
  },
  email: {
    type: String,
    required: [true,'Provide email'],
    unique: true
  },
  mobileNo: {
    type: String,
    required: [true, 'Provide mobile number.'],
    unique: true,
    validate: {
      validator: function(v) {
        return /\d{10}/.test(v);  // Adjust regex according to your requirements
      },
      message: props => `${props.value} is not a valid mobile number!`
    }
  },
  gender: {
    type: String,
    enum: ['M','F'],
    required: [true,'Provide gender']
  },
  designation: {
    type: String,
    enum: ['HR', 'Manager', 'sales'],
    required: [true,'Provide designation.']
  },
  course: {
    type: [String],
    required: [true,'Provide course']
  },
  image:{
    type: String,
    required: [true,'Provide image.']
  },
  createdDate:{
    type: Date,
    default: Date.now
  }
});

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
