const LeaveType= require("../models/leavetypes");
const getWorkingDaysOfMonth = require("./getworkingdays.js");
const Employee = require("../models/employee.js");
const Paygrade = require("../models/paygrade.js")
const Report = require("../models/salary.js")
const Leave = require("../models/leaves.js")
const calculateLeaveTakenInMonth = require("./leavetaken.js")
module.exports=async function calculateSalaryWithLeaveDeduction(employeeId, year, month) {
    
    const leaveTypes = await LeaveType.find({ employeeId: employeeId });
    console.log(leaveTypes)
    const totalUsedDays = leaveTypes.reduce((total, leaveType) => {console.log("Leave Type:", leaveType.name, "Used Days:", leaveType.usedDays);
    return total + leaveType.usedDays;
}, 0);
   
    const limit = 10; 
    const deductionRate = 300; 
    let deductionAmount = 0;

    if (totalUsedDays > limit) {
        const excessDays = totalUsedDays - limit;
        console.log(excessDays)
        deductionAmount = excessDays * deductionRate;
    }
    console.log("Total Used Days"+totalUsedDays)
    const leaveTaken = await calculateLeaveTakenInMonth(employeeId, year, month);

    const totalWorkingDays = await getWorkingDaysOfMonth(employeeId,year,month)

    
    const emp = await Employee.findById(employeeId);
    console.log(emp)
    const {grade} = emp;

    // Fetch paygrade for the employee
    const paygrade = await Paygrade.findOne({grade:grade});

    console.log(grade);
    console.log(paygrade)

    if (!paygrade) {
        throw new Error("Paygrade not found for employee.");
    }

    const {  allowances } = paygrade;
    const { basicsalary } = paygrade;
    const { deductions } = paygrade;
    console.log("Basicsalary"+basicsalary);
    console.log("Allowances"+allowances)
    const { hra, da, spcall, ta } = allowances;
    const {mediclaim, ProfTax,insPremium} = deductions;

    const totalAllowances = hra + da + spcall + ta;
    deductionAmount = mediclaim+ProfTax+insPremium;
    const grossSalary = basicsalary + totalAllowances;

    const dailyGrossSalary = (grossSalary) / totalWorkingDays;

    const netSalary = (dailyGrossSalary * totalWorkingDays)-deductionAmount;


    
   
    console.log("                ***********************                ");
    console.log(grossSalary);
    console.log(deductionAmount);
    console.log(netSalary)
    
    const newReport= new Report({
        month:month,
        year:year,
        leaves:leaveTaken,
        totalwd:totalWorkingDays,
        totbasic:grossSalary,
        totded: deductionAmount,
        netSalary:netSalary,
        paygrade:paygrade._id,

    })
    const report = await newReport.save()
    console.log(report);

    const reportid = report._id;
    console.log(reportid);

    const saveReport= await Employee.findByIdAndUpdate(employeeId, { $push: { salary: reportid } });
    console.log("SaveReport"+saveReport)
    return {netSalary,deductionAmount};
    
}
