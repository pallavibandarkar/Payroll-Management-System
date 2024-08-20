const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const paygradeSchema = new Schema({
    grade: {
        type: String,
        required: true,
        
    },
    basicsalary: {
        type: Number,
        default: 0 // Default value can be adjusted as needed
    },
    allowances: {
        hra: {
            type: Number,
            default: 0
        },
        da: {
            type: Number,
            default: 0
        },
        spcall: {
            type: Number,
            default: 0
        },
        ta: {
            type: Number,
            default: 0
        }
    },
    deductions:{
        mediclaim:{
            type:Number,
            default:0,
        },
        ProfTax:{
            type:Number,
            default:0,
        },
        insPremium:{
            type:Number,
            default:0,
        }
    }
});

const Paygrade = mongoose.model('Paygrade',paygradeSchema);
module.exports=Paygrade;