const { number } = require("joi");
const mongoose = require("mongoose")
const Schema = mongoose.Schema;
const passportLocalStrategy = require("passport-local-mongoose");
const LeaveType= require("./leavetypes.js");

const leavesSchema = new Schema({
    empid:{
        type:String,
        required:true,
    },
    empfname:{
        type:String,
        required:true,
    },
    emplname:{
        type:String,
        required:true,
    },
    subject:{
        type:String,
        required:true,
    },
    leavesfrom:{
        type:Date,
        required:true,
    },
    leavesto:{
        type:Date,
        required:true,
    },
    leaveDays:{
        type:Number,
        required:true,
    },
    leavetype:{
        type:String,
        enum:["Casual Leave","Sick Leave","Earned Leave","Annual Leave"],
    },
    leavemsg:{
        type:String,
        required:true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    leavetypes: {
        type: Schema.Types.ObjectId,
        ref: "LeaveType" 
    }
    
})

const Leaves = mongoose.model('Leaves',leavesSchema);

module.exports=Leaves;