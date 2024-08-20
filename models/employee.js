const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Report = require("./salary.js");
const User= require("./user.js");
const Leave = require("./leaves.js")
const Attendance = require("./attendance.js")

const employeeShcema = new Schema({
    
    firstname:{
        type:String,
    },
    middlename:{
        type:String,
    },
    lastname:{
        type:String,
    },
    dob:{
        type:Date,
        required:true,
    },
    gender:{
        type:String,
        enum:["Male","Female"],
        required:true,
    },
    
    address:{
        type:String,
        required:true,
    },
    city:{
        type:String,
        required:true,
    },
    state:{
        type:String,
        required:true,
    },
    country:{
        type:String,
        required:true,
    },
    emailid:{
        type:String,
        required:true,
    },
    contactno:{
        type:String,
        required:true,
    },
    identification:{
        type:String,
        enum:["Aadhar card","Voter id","Passport","Driving License"],
        // max:20,
        required:true,
    },
    idnumber:{
        type:Number,
        required:true,
    },
    
    doj:{
        type:Date,
        required:true,
    },
    grade:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        enum:["Admin","Employee"],
    },
    // bloodGroup:{
    //     type:String,
    //     enum:["A+","O+","B+","AB+","A-","O-","B-","AB-"],
    //     required:true,
    // },
    photo:{
        url:String,
        filename:String,
    },
    
    designation:{
        type:String,
        required:true,

    },
    department:{
        type:String,
        required:true,
    },
    bankName:{
        type:String,
        // max:30,
        required:true,
        
    },
    bankacno:{
        type:Number,
        // max:17,
        required:true,
    },
    ifsccode:{
        type:String,
        // max:11,
        required:true,
    },
    salary:[
        {
        type:Schema.Types.ObjectId,
        ref:"Report",
        }
    ],
    user:{
        type:Schema.Types.ObjectId,
        ref:"User",
    },
    leaves:[
        {
        type:Schema.Types.ObjectId,
        ref:"Leave",
       }
    ],
    attendance:[{
        type:Schema.Types.ObjectId,
        ref:"Attendance",
    }]
    
    

})

const Emplyoee = mongoose.model('Emplyoee',employeeShcema);

module.exports=Emplyoee;