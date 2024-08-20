const { required } = require("joi");
const mongoose =  require("mongoose");
const Schema = mongoose.Schema;
const Employee = require("./employee.js");
const leaveTypeSchema = new Schema({
    employeeId: {
        type: Schema.Types.ObjectId,
        ref: "Employee",
        required: true
    },
    name: {
        type: String,
        required: true,
        unique: true,
    },
    totalDays: {
        type: Number,
        required: true,
        default: 7
    },
    usedDays: {
        type: Number,
        required: true,
        default: 0
    },
    
});

const LeaveType = mongoose.model("LeaveTypes",leaveTypeSchema);
module.exports=LeaveType;