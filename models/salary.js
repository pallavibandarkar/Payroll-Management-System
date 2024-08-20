const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Paygrade= require("./paygrade.js");
const Employee = require("./employee.js");
const { employeeSchema } = require("../schema.js");

const reportSchema = new Schema({
    employeeid:{
        type:Schema.Types.ObjectId,
        ref:"Employee"
    },
    month:{
        type:Number,
        enum:[1,2,3,4,5,6,7,8,9,10,11,12],
        required:true,
    },
    year:{
        type:Number,
        required:true,
    },
    leaves:{
        type:Number,
        required:true,
    },
    totalwd:{
        type:Number,
        required:true,
    },
    totbasic:{
        type:Number,
        require:true,
    },
    totded:{
        type:Number,
        require:true,
    },
    netSalary:{
        type:Number,
        require:true,
    },
    paygrade:{
        type:Schema.Types.ObjectId,
        ref:"Paygrade"
    },
})

const Report = mongoose.model("Report",reportSchema);
module.exports = Report;