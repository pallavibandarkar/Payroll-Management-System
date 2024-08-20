if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}


const express = require("express");
const app = express();
const ejsMate = require('ejs-mate');
const mongoose = require("mongoose");
const methodOverride=require("method-override");
const Employee = require("./models/employee.js");
const Paygrade = require("./models/paygrade.js");
const Report= require("./models/salary.js");
const Leave= require("./models/leaves.js");
const LeaveType = require("./models/leavetypes.js")
const Attendance= require("./models/attendance.js");
const path = require("path");
const { link } = require("fs");
const session = require("express-session")
const passport = require("passport");
const LocalStrategy=require("passport-local");
const User = require("./models/user.js");
const Admin = require("./models/admin.js");
const flash = require('connect-flash');
const {isAdminLoggedIn,employeeValidation ,leaveValidation} = require('./middleware.js');
const {ExpressError} = require("./utils/ExpressError.js");
const wrapAsync = require("./utils/wrapAsync.js");
const getWorkingDaysOfMonth = require("./utils/getworkingdays.js");
const calculateSalaryWithLeaveDeduction = require("./utils/calsalwithdeductions.js");


const multer  = require('multer')
const {storage} = require("./cloudConfig.js")
const upload = multer({ storage })

const sessionOptions = {
    secret:process.env.SECRET,
    resave: false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    }
}


main().then(()=>{
    console.log("connected to database successfully");
}).catch((err)=>{
    console.log(err);
});
async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/payrollsystem');
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,"/public")));
app.engine('ejs',ejsMate);
app.use(flash());

app.listen(8080,()=>{
    console.log("listening on port 8080");
})

app.get("/",(req,res)=>{
    res.render("Hi! I am root route");
})

app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Local_Strategies
passport.use("user-local", new LocalStrategy( User.authenticate()));
passport.use("admin-local", new LocalStrategy( Admin.authenticate()));


app.get("/payroll",(req,res)=>{
    res.render("./webpage/home2.ejs")
})
// app.get("/demouser",async(req,res)=>{
//     const fakeUser = new User({
//         email:"demo@gmail.com",
//         username:"demo",
//     })
//    const demoU=await User.register(fakeUser,"hellodemo")
//    res.send(demoU);
//    console.log(demoU);
// })

// app.get("/empdetails",async(req,res)=>{
//     let{id}=req.user.Admin;
//     const employee = await Employee.findById(id);
//     console.log(employee);
// })



// -----------------------Employee Crud Operations -----------------------

//Show All ---->> Read/View
app.get("/employees",wrapAsync( async (req, res) => {
    const employees = await Employee.find({});
    const isAdminLoggedIn = req.isAuthenticated() && req.user.isAdmin;
    res.render("employee/show.ejs", { employees, isAdminLoggedIn });
})
);

//New Route -->> Renders the form to add employee
app.get("/newEmployees",(req,res)=>{
    res.render("employee/new.ejs");
})

//Create Route
app.post("/newEmployees", 
    upload.single('employee[photo]'),
    employeeValidation,
    wrapAsync(async(req,res)=>{
       
    const {  email, password, employee } = req.body;
    const {username} = req.body;
    console.log(req.body),

    console.log(username);
    console.log(employee);
    let url=req.file.path;
    let filename=req.file.filename;
    
    const newUser =await User.register(
        new User({ username, email}), password);
    const saveNewUser = await newUser.save();
   
    const newEmployee = new Employee({user:saveNewUser._id,...employee });
    newEmployee.photo={url,filename}
    await newEmployee.save();
    res.redirect("/employees");
})
);

//Index Route --->>
app.get("/employees/:id",
    wrapAsync(async (req,res)=>{
    let {id} = req.params;
    const employee = await Employee.findById(id);
    console.log(employee);
    console.log(id);
    res.render("employee/index.ejs",{employee});
})
);

//Edit Route
app.get("/employees/:id/edit",wrapAsync(async(req,res)=>{
    let {id} = req.params;
    let employee = await Employee.findById(id);
    let user = employee.user;
    console.log("USER:"+user)
    let actualUser = await User.findOne({_id:user})
    console.log(actualUser)

    res.render("employee/edit.ejs",{employee , actualUser});
})
);

//Update Route
app.put("/employees/:id",
       upload.single('employee[photo]'),
       employeeValidation,
       wrapAsync(async(req,res)=>{
    let {id} = req.params;
    let employee = await Employee.findByIdAndUpdate(id,{...req.body.employee});
    if(typeof req.file !== "undefined"){
        let url=req.file.path;
        let filename=req.file.filename;
        employee.photo={url,filename}
        await employee.save();
    }
    console.log(employee);
    res.redirect(`/employees`);
})
);

//Delelte Route
app.delete("/employees/:id",async(req,res)=>{
    let {id} = req.params;
    let employee = await Employee.findByIdAndDelete(id);
    console.log(employee);
    res.redirect("/employees"); 
})

//------------------------ Admin  -------------------------//

//admin login
app.get("/admin/login",(req,res)=>{
    res.render("./user/admin.ejs")
})

app.post('/admin/login', 
   passport.authenticate("admin-local", { failureRedirect: '/admin/login' ,failureFlash: true}),
  (req, res)=> {
    res.redirect("/employees")
    console.log("Logged in")
  });

app.get("/admin/payheads",(req,res)=>{
    res.render("./employee/payheads.ejs")
})

app.get("/admin/leaves",wrapAsync(async(req,res)=>{
    let leaves = await Leave.find({});
    

    
    console.log("All leaves",leaves);
    res.render("./employee/allleaves.ejs",{leaves});
})
);

//leaves->>> status updation
// ---->>> Accept
app.put("/admin/leavesA/:id",wrapAsync(async(req,res)=>{
    let {id} = req.params
    
    let updateLeave = await Leave.findByIdAndUpdate({_id:id},{$set:{status:"Approved"}})
    res.redirect("/admin/leaves")
})
);
// ---->>> reject
app.put("/admin/leavesR/:id",wrapAsync(async(req,res)=>{
    let {id} = req.params
    
    let updateLeave = await Leave.findByIdAndUpdate({_id:id},{$set:{status:"Rejected"}})
    res.redirect("/admin/leaves")
})
);

//----------------------------Employee Login --------------------------//

//Employee Login
app.get("/employee/login",(req,res)=>{
    res.render("./user/emplogin.ejs")
})

app.post('/employee/login', 
  passport.authenticate("user-local", {
    failureRedirect: '/employee/login', 
    failureFlash: true
  }),
  async(req, res)=> {
    let {id} = req.body;
    console.log(id);
    const employee = await Employee.findById({_id:id});
    console.log(employee)
    res.render("./employeebyid/employee.ejs",{employee});
      
  });


// ------------------------Salary---------------------------
//salarydetails--->>> display (emp details + salary details)


app.get("/employees/:id/salary",wrapAsync(async(req,res)=>{
    let {id} = req.params;
    let employee = await Employee.findById(id);
    let {grade} = employee
    console.log(grade);

    let reportid= employee.salary;

    let newReport=  await Report.findOne({_id:{$in:reportid}}).sort({ _id: -1 }).limit(1);
    console.log("Report",newReport);
    
    let paygrade = await Paygrade.find({grade:grade})
    console.log("Paygrade",paygrade);
    const {allowances ,basicsalary,deductions} = paygrade[0];
        console.log("Basic Salary", basicsalary);
        console.log("Allowances", allowances);

        const { hra, da, spcall, ta } = allowances;
        const { mediclaim,ProfTax,insPremium} = deductions;
        const totalOfAllowances = hra + da + spcall + ta;
    
    console.log("Totalall"+totalOfAllowances);
    const totalDeductions = mediclaim+ProfTax+insPremium;
    console.log("Basic salary"+newReport.totbasic);
   res.render("./employee/salarydetails.ejs",{newReport,totalDeductions,totalOfAllowances,employee})
})
);

//-->> renders the form to input the month,year and deductions 
app.get("/employees/:id/payroll",wrapAsync(async(req,res)=>{
    let {id} = req.params;
    let employee = await Employee.findById(id);
    res.render("./employee/payroll.ejs",{employee});
})
);

//newRote
//saves the enter month,year,deduction into the table
app.post("/employees/:id/payroll",wrapAsync(async(req,res)=>{
    let {id} = req.params;
    const { month,year ,deductions} = req.body.salary;
    
    const employee = await Employee.findById(id);

    const netSalary = await calculateSalaryWithLeaveDeduction(id, year, month);
    
    console.log("Net Salary"+netSalary)
    res.redirect(`/employees/${id}/salary`)

  
})
);

app.get("/employee/:id/salarySlips",wrapAsync(async(req,res)=>{
    let {id} = req.params;
    let employee = await Employee.findById(id);
    let {grade} = employee;
    const reportid = employee.salary;
    console.log(reportid);

    let newReport=  await Report.findOne({_id:{$in:reportid}}).sort({ _id: -1 }).limit(1);
    console.log("Report",newReport);
    
    
    let paygrade = await Paygrade.find({grade:grade})
    console.log("Paygrade",paygrade);
    const {allowances ,basicsalary,deductions} = paygrade[0];
        console.log("Basic Salary", basicsalary);
        console.log("Allowances", allowances);

        const { hra, da, spcall, ta } = allowances;
        const {mediclaim,ProfTax,insPremium} = deductions;
        const totalOfAllowances = hra + da + spcall + ta;
    
    console.log("Totalall"+totalOfAllowances);
    const totalDeductions = newReport.deductions;
    const basicSalary = basicsalary;

    
   
    
    
    res.render("./employeebyid/salarySlips.ejs",{newReport,paygrade,basicsalary,hra,da,spcall,ta,employee,mediclaim,ProfTax,insPremium})
})
);

//-->> renders the form to input the month,year and deductions 
app.get("/employees/:id/payroll",wrapAsync(async(req,res)=>{
    let {id} = req.params;
    let employee = await Employee.findById(id);
    res.render("./employee/payroll.ejs",{employee});
})
);

app.get("/salaries",wrapAsync(async(req,res)=>{
    let employees = await Employee.find();
    let {grade} = employees;

    let reportid = employees.salary;
    console.log(reportid)
    let newReport=  await Report.findOne({_id:{$in:reportid}}).sort({ _id: -1 }).limit(1);
    console.log("Report",newReport);

    let paygrade = await Paygrade.find({grade:grade});
    console.log(paygrade)

    const {allowances ,basicsalary} = paygrade[0];
        console.log("Basic Salary", basicsalary);
        console.log("Allowances", allowances);

        const { hra, da, spcall, ta } = allowances;
        const totalOfAllowances = hra + da + spcall + ta;
    
    console.log("Totalall"+totalOfAllowances);
    const totalDeductions = newReport.deductions;
    const basicSalary = basicsalary;

    const grossSalry = ((basicSalary/newReport.totalwd)*(newReport.actualwd))+totalOfAllowances

    const netSalaryCal = grossSalry-totalDeductions;
    console.log("Net salary"+netSalaryCal);

    res.render("./employees/salary.ejs",{newReport,paygrade,employees,grossSalry,netSalaryCal,totalDeductions})

    
})
);
//Delete----->>> salary

app.delete("/employee/:id/salary/:salaryid",isAdminLoggedIn,wrapAsync(async(req,res)=>{
    let {id,salaryid} = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { salary: salaryid} });
    let result1 = await Salary.findByIdAndUpdate(salaryid);
    console.log(result1);
})
);


//-------------------Leaves--------------------
// render the leaves form
app.get("/employee/:id/leaves",wrapAsync(async(req,res)=>{
    let {id} = req.params;
    console.log("Id of the employee",id)
    let employee = await Employee.findById(id);

    let lea2 = employee.leaves;
    let subject1 = employee.leaves.subject;
    console.log("lea2",lea2);
    let leaveid = employee.leaves;
    console.log("leaveid",leaveid) 
    let leaves = await Leave.find({ _id: { $in: leaveid } });
    console.log("Leave",leaves);
    res.render("employeebyid/leave.ejs",{employee ,leaves});
})
);

// saves the details of the leaves into the database
app.post("/employee/:id/leaves",leaveValidation,wrapAsync(async(req,res)=>{
    let {id} = req.params;
    let {leave} = req.body;
    
    let employee = await Employee.findById(id);
    console.log(leave);
    const newLeave = new Leave({...leave,empid:id,empfname:employee.firstname,emplname:employee.lastname});
    
   
    let leaveType = await LeaveType.findOne({ employeeId: id, name: leave.leavetype });
    console.log(leaveType)
    if (!leaveType) {
        // If leave type doesn't exist, create a new one
        leaveType = new LeaveType({
            employeeId: id,
            name: leave.leavetype,
            totalDays: 10,
            usedDays: 0,
        });
        await leaveType.save();
    }

    console.log("usedDays:", leaveType.usedDays);
console.log("leaveDays:", leave.leaveDays);
console.log("totalDays:", leaveType.totalDays);


    // if (leaveType.usedDays + leave.leaveDays > leaveType.totalDays) {
    //     res.status(400).send("Exceeds total allowed days for this leave type."+`${leaveType.usedDays }+ ${leave.leaveDays }`);
    // }

    // Update usedDays for the leave type
    let a = leaveType.usedDays;
    let b = Number(leave.leaveDays);

    console.log(a);
    console.log(b);
    console.log(a+b)
    a +=b;
    console.log("a"+a); 
    
    console.log(leaveType.usedDays+"saved")
    const leavetypes= await LeaveType.findByIdAndUpdate(leaveType._id,{usedDays :a},{new:true})
    const leavetype_id= leavetypes._id;

    newLeave.leavetypes= leavetype_id;
    


    const result = await newLeave.save();
    const leaveId = result._id;
    await Employee.findByIdAndUpdate(id, { $push: { leaves: leaveId } });
    console.log(result);

    res.redirect(`/employee/${id}/leaves`);
})
);


app.get("/employee/salary-search",wrapAsync(async(req,res)=>{

    const employees = await Employee.find({});

    console.log(employees)
        
    res.render("./employee/SalarySearch.ejs",{employees});
}))

app.post("/employee/salary-search", wrapAsync(async(req,res)=>{
    const {id,month,year} = req.body;
    console.log(id);
    console.log(month)
    console.log(year)

    let employee = await Employee.findById(id);
    let {grade} = employee;
    const reportid = employee.salary;
    console.log(reportid);

    let newReport= await Report.findOne({month:month,year:year})
    console.log("Report",newReport);
    
    
    
    let paygrade = await Paygrade.find({grade:grade})
    console.log("Paygrade",paygrade);
    const {allowances ,basicsalary,deductions} = paygrade[0];
        console.log("Basic Salary", basicsalary);
        console.log("Allowances", allowances);

        const { hra, da, spcall, ta } = allowances;
        const {mediclaim,ProfTax,insPremium} = deductions;
        const totalOfAllowances = hra + da + spcall + ta;
    
    console.log("Totalall"+totalOfAllowances);
    const totalDeductions = newReport.deductions;
    const basicSalary = basicsalary;

    
   
    
    
    res.render("./employeebyid/salarySlips.ejs",{newReport,paygrade,basicsalary,hra,da,spcall,ta,employee,mediclaim,ProfTax,insPremium})

    
}))





// -------------------- attendance ------------------------------//
//punch_in
app.post("/employee/:id/puch-in",wrapAsync(async(req,res)=>{
    const {id} = req.params;
    let employee = await Employee.findById(id);

    const attendanceRecord = new Attendance({
        date: new Date(),
        punchInTime: new Date()
    });

    const saveAttendance = await attendanceRecord.save();
    console.log(saveAttendance);
    const updatedEmployee= await Employee.findByIdAndUpdate(id, { $push: {attendance: saveAttendance} });
    res.send(updatedEmployee);
})
);

//puch out
app.post("/employee/:id/puch-out",wrapAsync(async(req,res)=>{
    const {id} = req.params;
    let employee = await Employee.findById(id);
    const attendanceid = employee.attendance;
    console.log("attendance",attendanceid);
    let latestAttendanceId=attendanceid[0]
    const punchOutTime = new Date();
    const latestpunchout = await Attendance.findByIdAndUpdate({_id:latestAttendanceId},{$set:{punchOutTime:punchOutTime}})
    res.send(latestpunchout);
})
);


app.use((err,req,res,next)=>{
    let {statusCode=400,message="Something Went Wrong"} = err;
    res.status(statusCode).render("./employee/error.ejs",{message});
})






// const LeaveTypes = new LeaveType({
//     name:"Annual Leave",
//     totalDays:10,
// })
// const leavet =LeaveTypes.save();
// console.log(leavet);







