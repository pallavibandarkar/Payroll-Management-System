const Employee = require("./models/employee.js");
const Leave = require("./models/leaves.js");
const Admin = require("./models/admin.js");
const {employeeSchema,leaveSchema}=require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");


module.exports.employeeValidation = (req,res,next)=>{
    let {error}= employeeSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el) => el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
};
module.exports.leaveValidation= (req,res,next)=>{
    let {error}=leaveSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el) => el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
};

module.exports.isAdminLoggedIn = (req,res,next)=>{
    if(req.isAuthenticated() && req.user.isAdmin){
        return next();
    }
    res.redirect("/admin/login");
    
}