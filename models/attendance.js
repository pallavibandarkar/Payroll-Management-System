const mongoose  = require("mongoose");
const Schema = mongoose.Schema;

const attendanceSchema = new Schema({
    date: {
        type: Date,
        required: true
    },
    punchInTime: {
        type: Date
    },
    punchOutTime: {
        type: Date
    }
})

const Attendance = mongoose.model("Attendance",attendanceSchema);
module.exports = Attendance
