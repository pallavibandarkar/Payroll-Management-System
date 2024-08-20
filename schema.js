const joi = require('joi');

module.exports.employeeSchema=joi.object({
    username: joi.string().required(),
    password: joi.string().required(),
    email: joi.string().required(),
    employee:joi.object({
        firstname:joi.string().required(),
        middlename:joi.string().required(),
        lastname:joi.string().required(),
        dob:joi.date().required(),
        gender:joi.string().required(),
        address:joi.string().required(),
        city:joi.string().required(),
        state:joi.string().required(),
        country:joi.string().required(),
        emailid:joi.string().required(),
        contactno:joi.string().required(),
        identification:joi.string().required(),
        idnumber:joi.number().required(),
        doj:joi.date().required(),
        grade:joi.string().required(),
        role:joi.string().required(),
        
        designation:joi.string().required(),
        department:joi.string().required(),
        bankName:joi.string().required(),
        bankacno:joi.number().required(),
        ifsccode:joi.string().required(),

    }).required(),
})

module.exports.leaveSchema=joi.object({
    leave:joi.object({
        subject:joi.string().required(),
        leavesfrom:joi.date().required(),
        leavesto:joi.date().required(),
        leaveDays:joi.number().required(),
        leavetype:joi.string().required(),
        leavemsg:joi.string().required(),
        
    }).required(),
})