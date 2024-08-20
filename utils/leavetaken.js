const Leave = require("../models/leaves.js")
module.exports=async function calculateLeaveTakenInMonth(employeeId, year, month) {
    // Get the start and end dates of the specified month
    const startDate = new Date(year, month - 1, 1); // Month is 0-based, so subtract 1
    const endDate = new Date(year, month, 0); // Set the date to 0 to get the last day of the previous month

    // Query the database to find leaves taken by the employee in the specified month
    const leaves = await Leave.find({
        empid: employeeId,
        leavesfrom: { $gte: startDate, $lte: endDate }
    });

    // Calculate the total leave days taken in the specified month
    let totalLeaveTaken = 0;
    for (const leave of leaves) {
        totalLeaveTaken += leave.leaveDays;

        console.log("Total Leaves Taken"+totalLeaveTaken)
    }

    return totalLeaveTaken;
}