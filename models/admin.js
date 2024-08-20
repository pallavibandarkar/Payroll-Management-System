const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");
const Leave = require("./leaves.js");
const Employee = require("./employee.js");

const adminSchema = new Schema({
    email:{
        type:String,
        required:true,
    },
    employees:[
        {
        type:Schema.Types.ObjectId,
        ref:"Employee",
        }
   ],
    leaves:[
        {
        type:Schema.Types.ObjectId,
        ref:"Leave",
       }
    ]

})
adminSchema.plugin(passportLocalMongoose);
module.exports=mongoose.model('Admin',adminSchema);