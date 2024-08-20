const Attendance= require("../models/attendance.js");

module.exports=async (id, year, month) => {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Query attendance records for the employee within the given month
    const attendanceRecords = await Attendance.find({
        date: { $gte: startDate, $lte: endDate },
        punchOutTime: { $exists: true } // Only consider days with punch-out time
    });

    // Count total working days and days the employee was present
    let totalWorkingDays = 0;
    let daysPresent = 0;
    
    // Iterate over each day of the month
   for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
        totalWorkingDays++;
        // Check if the employee has attendance record for the current day
        const hasAttendance = attendanceRecords.some(record => {
            const recordDate = new Date(record.date);
            return recordDate.getFullYear() === year && recordDate.getMonth() === month - 1 && recordDate.getDate() === date.getDate();
        });

        if (hasAttendance) {
            daysPresent++;
        }
    }

    return totalWorkingDays;
};