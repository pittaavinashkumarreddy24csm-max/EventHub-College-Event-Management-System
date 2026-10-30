const express = require("express");
const fs = require("fs");
const path = require("path");


const app = express();

const PORT = 3000;


// ==============================
// MIDDLEWARE
// ==============================

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(
    express.static(
        path.join(
            __dirname,
            "public"
        )
    )
);


// ==============================
// DATA FILES
// ==============================

const dataFolder =
    path.join(
        __dirname,
        "data"
    );


const eventsFile =
    path.join(
        dataFolder,
        "events.json"
    );


const registrationsFile =
    path.join(
        dataFolder,
        "registrations.json"
    );


const adminsFile =
    path.join(
        dataFolder,
        "admins.json"
    );


const studentsFile =
    path.join(
        dataFolder,
        "students.json"
    );


// ==============================
// HELPER FUNCTIONS
// ==============================

function ensureDataFolder() {

    if (
        !fs.existsSync(
            dataFolder
        )
    ) {

        fs.mkdirSync(
            dataFolder,
            {
                recursive: true
            }
        );

    }

}


function ensureFile(
    filePath,
    defaultData = []
) {

    ensureDataFolder();


    if (
        !fs.existsSync(
            filePath
        )
    ) {

        fs.writeFileSync(
            filePath,
            JSON.stringify(
                defaultData,
                null,
                4
            )
        );

    }

}


function readData(
    filePath
) {

    ensureFile(
        filePath
    );


    try {

        const fileContent =
            fs.readFileSync(
                filePath,
                "utf8"
            );


        if (
            !fileContent.trim()
        ) {

            return [];

        }


        return JSON.parse(
            fileContent
        );

    } catch (error) {

        console.error(
            "Error reading:",
            filePath,
            error
        );


        return [];

    }

}


function writeData(
    filePath,
    data
) {

    ensureFile(
        filePath
    );


    fs.writeFileSync(
        filePath,
        JSON.stringify(
            data,
            null,
            4
        )
    );

}


// ==============================
// MAKE SURE DATA FILES EXIST
// ==============================

ensureFile(eventsFile);

ensureFile(
    registrationsFile
);

ensureFile(adminsFile);

ensureFile(
    studentsFile
);


// ==============================
// HOME
// ==============================

app.get(
    "/",
    function (req, res) {

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "index.html"
            )
        );

    }
);


// ==================================================
// EVENTS
// ==================================================


// ==============================
// GET ALL EVENTS
// ==============================

app.get(
    "/api/events",
    function (req, res) {

        const events =
            readData(
                eventsFile
            );


        res.json(
            events
        );

    }
);


// ==============================
// CREATE EVENT
// ==============================

app.post(
    "/api/events",
    function (req, res) {

        const events =
            readData(
                eventsFile
            );


        const {

            title,
            date,
            time,
            venue,
            description,
            registrationLink,
            maxParticipants,

            coordinatorName,
            adminId,
            department,
            coordinatorRole,
            coordinatorEmail

        } = req.body;


        // ==============================
        // VALIDATION
        // ==============================

        if (
            !title ||
            !date ||
            !time ||
            !venue ||
            !description
        ) {

            return res.status(400).json({

                message:
                    "Please fill in all required event fields."

            });

        }


        if (
            !coordinatorName ||
            !adminId ||
            !department ||
            !coordinatorRole ||
            !coordinatorEmail
        ) {

            return res.status(400).json({

                message:
                    "Coordinator information is missing. Please sign in again."

            });

        }


        if (
            Number(maxParticipants) <= 0
        ) {

            return res.status(400).json({

                message:
                    "Maximum participants must be greater than 0."

            });

        }


        // ==============================
        // CREATE EVENT
        // ==============================

        const newEvent = {

            id:
                events.length > 0
                    ? Math.max(
                        ...events.map(
                            event =>
                                Number(event.id) || 0
                        )
                    ) + 1
                    : 1,

            title:
                title.trim(),

            date:
                date,

            time:
                time,

            venue:
                venue.trim(),

            description:
                description.trim(),

            registrationLink:
                registrationLink || "",

            maxParticipants:
                Number(maxParticipants) || 100,


            // ==============================
            // EVENT OWNER
            // ==============================

            coordinatorName:
                coordinatorName,

            adminId:
                adminId,

            department:
                department,

            coordinatorRole:
                coordinatorRole,

            coordinatorEmail:
                coordinatorEmail

        };


        // ==============================
        // SAVE EVENT
        // ==============================

        events.push(
            newEvent
        );


        writeData(
            eventsFile,
            events
        );


        console.log(
            "Event created:",
            newEvent.title
        );


        console.log(
            "Department:",
            newEvent.department
        );


        console.log(
            "Coordinator:",
            newEvent.coordinatorName
        );


        res.status(201).json({

            success:
                true,

            message:
                "Event created successfully.",

            event:
                newEvent

        });

    }
);


// ==============================
// UPDATE EVENT
// ==============================

app.put(
    "/api/events/:id",
    function (req, res) {

        const eventId =
            Number(
                req.params.id
            );


        const {

            title,
            date,
            time,
            venue,
            description,
            registrationLink,
            maxParticipants,
            adminId

        } = req.body;


        // ==============================
        // CHECK ADMIN ID
        // ==============================

        if (!adminId) {

            return res.status(401).json({

                message:
                    "Admin information is missing. Please sign in again."

            });

        }


        // ==============================
        // READ EVENTS
        // ==============================

        const events =
            readData(
                eventsFile
            );


        const eventIndex =
            events.findIndex(
                event =>
                    Number(event.id) ===
                    eventId
            );


        if (
            eventIndex === -1
        ) {

            return res.status(404).json({

                message:
                    "Event not found."

            });

        }


        const existingEvent =
            events[eventIndex];


        // ==============================
        // CHECK EVENT OWNER
        // ==============================

        if (
            !existingEvent.adminId
        ) {

            return res.status(403).json({

                message:
                    "This older event does not have coordinator ownership information and cannot be edited."

            });

        }


        if (
            existingEvent.adminId
                .toLowerCase() !==
            String(adminId)
                .trim()
                .toLowerCase()
        ) {

            return res.status(403).json({

                message:
                    "You can only edit events created by your account."

            });

        }


        // ==============================
        // VALIDATION
        // ==============================

        if (
            !title ||
            !date ||
            !time ||
            !venue ||
            !description
        ) {

            return res.status(400).json({

                message:
                    "Please fill in all required event fields."

            });

        }


        if (
            Number(maxParticipants) <= 0
        ) {

            return res.status(400).json({

                message:
                    "Maximum participants must be greater than 0."

            });

        }


        // ==============================
        // UPDATE EVENT
        // ==============================

        events[eventIndex] = {

            ...existingEvent,

            title:
                title.trim(),

            date:
                date,

            time:
                time,

            venue:
                venue.trim(),

            description:
                description.trim(),

            registrationLink:
                registrationLink || "",

            maxParticipants:
                Number(maxParticipants)

        };


        // ==============================
        // SAVE
        // ==============================

        writeData(
            eventsFile,
            events
        );


        console.log(
            "Event updated:",
            events[eventIndex].title
        );


        res.json({

            success:
                true,

            message:
                "Event updated successfully.",

            event:
                events[eventIndex]

        });

    }
);


// ==============================
// DELETE EVENT
// ==============================

app.delete(
    "/api/events/:id",
    function (req, res) {

        const eventId =
            Number(
                req.params.id
            );


        const adminId =
            req.body.adminId ||
            req.query.adminId;


        // ==============================
        // CHECK ADMIN ID
        // ==============================

        if (!adminId) {

            return res.status(401).json({

                message:
                    "Admin information is missing. Please sign in again."

            });

        }


        // ==============================
        // READ EVENTS
        // ==============================

        const events =
            readData(
                eventsFile
            );


        const eventIndex =
            events.findIndex(
                event =>
                    Number(event.id) ===
                    eventId
            );


        if (
            eventIndex === -1
        ) {

            return res.status(404).json({

                message:
                    "Event not found."

            });

        }


        const event =
            events[eventIndex];


        // ==============================
        // CHECK OWNERSHIP
        // ==============================

        if (
            !event.adminId
        ) {

            return res.status(403).json({

                message:
                    "This older event does not have coordinator ownership information and cannot be deleted."

            });

        }


        if (
            event.adminId
                .toLowerCase() !==
            String(adminId)
                .trim()
                .toLowerCase()
        ) {

            return res.status(403).json({

                message:
                    "You can only delete events created by your account."

            });

        }


        // ==============================
        // DELETE EVENT
        // ==============================

        events.splice(
            eventIndex,
            1
        );


        writeData(
            eventsFile,
            events
        );


        // ==============================
        // DELETE RELATED
        // REGISTRATIONS
        // ==============================

        const registrations =
            readData(
                registrationsFile
            );


        const remainingRegistrations =
            registrations.filter(
                registration =>
                    Number(
                        registration.eventId
                    ) !== eventId
            );


        writeData(
            registrationsFile,
            remainingRegistrations
        );


        console.log(
            "Event deleted:",
            event.title
        );


        res.json({

            success:
                true,

            message:
                "Event deleted successfully."

        });

    }
);


// ==================================================
// EVENT REGISTRATIONS
// ==================================================


// ==============================
// GET REGISTRATIONS FOR EVENT
// ==============================

app.get(
    "/api/events/:id/registrations",
    function (req, res) {

        const eventId =
            Number(
                req.params.id
            );


        const registrations =
            readData(
                registrationsFile
            );


        const eventRegistrations =
            registrations.filter(
                registration =>
                    Number(
                        registration.eventId
                    ) === eventId
            );


        res.json(
            eventRegistrations
        );

    }
);


// ==============================
// GET ALL REGISTRATIONS
// ==============================

app.get(
    "/api/registrations",
    function (req, res) {

        const registrations =
            readData(
                registrationsFile
            );


        res.json(
            registrations
        );

    }
);


// ==============================
// CREATE REGISTRATION
// ==============================

app.post(
    "/api/registrations",
    function (req, res) {

        const {

            eventId,
            name,
            email,
            phone

        } = req.body;


        if (
            !eventId ||
            !name ||
            !email ||
            !phone
        ) {

            return res.status(400).json({

                message:
                    "Please fill in all registration fields."

            });

        }


        const events =
            readData(
                eventsFile
            );


        const registrations =
            readData(
                registrationsFile
            );


        const event =
            events.find(
                item =>
                    Number(item.id) ===
                    Number(eventId)
            );


        if (!event) {

            return res.status(404).json({

                message:
                    "Event not found."

            });

        }


        // ==============================
        // DUPLICATE REGISTRATION
        // ==============================

        const alreadyRegistered =
            registrations.some(
                registration =>
                    Number(
                        registration.eventId
                    ) === Number(eventId) &&

                    registration.email
                        .toLowerCase() ===
                    email.toLowerCase()
            );


        if (
            alreadyRegistered
        ) {

            return res.status(400).json({

                message:
                    "This email is already registered for this event."

            });

        }


        // ==============================
        // PARTICIPANT LIMIT
        // ==============================

        const currentCount =
            registrations.filter(
                registration =>
                    Number(
                        registration.eventId
                    ) === Number(eventId)
            ).length;


        if (
            currentCount >=
            Number(
                event.maxParticipants
            )
        ) {

            return res.status(400).json({

                message:
                    "Registration limit reached for this event."

            });

        }


        // ==============================
        // CREATE REGISTRATION
        // ==============================

        const newRegistration = {

            id:
                registrations.length > 0
                    ? Math.max(
                        ...registrations.map(
                            registration =>
                                Number(
                                    registration.id
                                ) || 0
                        )
                    ) + 1
                    : 1,

            eventId:
                Number(eventId),

            name:
                name,

            email:
                email,

            phone:
                phone,

            registeredAt:
                new Date().toISOString()

        };


        registrations.push(
            newRegistration
        );


        writeData(
            registrationsFile,
            registrations
        );


        res.status(201).json({

            success:
                true,

            message:
                "Registration successful.",

            registration:
                newRegistration

        });

    }
);


// ==================================================
// STUDENT REGISTRATION
// ==================================================

app.post(
    "/api/students/register",
    function (req, res) {

        const {

            name,
            studentId,
            department,
            year,
            email,
            password

        } = req.body;


        if (
            !name ||
            !studentId ||
            !department ||
            !year ||
            !email ||
            !password
        ) {

            return res.status(400).json({

                message:
                    "Please fill in all fields."

            });

        }


        const students =
            readData(
                studentsFile
            );


        // ==============================
        // CHECK STUDENT ID
        // ==============================

        const existingStudentId =
            students.find(
                student =>
                    student.studentId
                        .toLowerCase() ===
                    studentId.toLowerCase()
            );


        if (
            existingStudentId
        ) {

            return res.status(400).json({

                message:
                    "Student ID is already registered."

            });

        }


        // ==============================
        // CHECK EMAIL
        // ==============================

        const existingEmail =
            students.find(
                student =>
                    student.email
                        .toLowerCase() ===
                    email.toLowerCase()
            );


        if (
            existingEmail
        ) {

            return res.status(400).json({

                message:
                    "Email is already registered."

            });

        }


        // ==============================
        // CREATE STUDENT
        // ==============================

        const newStudent = {

            id:
                students.length > 0
                    ? Math.max(
                        ...students.map(
                            student =>
                                Number(
                                    student.id
                                ) || 0
                        )
                    ) + 1
                    : 1,

            name:
                name,

            studentId:
                studentId,

            department:
                department,

            year:
                year,

            email:
                email,

            password:
                password

        };


        students.push(
            newStudent
        );


        writeData(
            studentsFile,
            students
        );


        // ==============================
        // RESPONSE WITHOUT PASSWORD
        // ==============================

        const studentResponse = {

            id:
                newStudent.id,

            name:
                newStudent.name,

            studentId:
                newStudent.studentId,

            department:
                newStudent.department,

            year:
                newStudent.year,

            email:
                newStudent.email

        };


        res.status(201).json({

            success:
                true,

            message:
                "Student account created successfully.",

            student:
                studentResponse

        });

    }
);


// ==================================================
// STUDENT LOGIN
// ==================================================

app.post(
    "/api/students/login",
    function (req, res) {

        console.log(
            "Student login request received:",
            req.body.email
        );


        const {

            email,
            password

        } = req.body;


        if (
            !email ||
            !password
        ) {

            return res.status(400).json({

                message:
                    "Please enter email and password."

            });

        }


        const students =
            readData(
                studentsFile
            );


        const student =
            students.find(
                item =>
                    item.email
                        .toLowerCase() ===
                    email.toLowerCase() &&

                    item.password ===
                    password
            );


        if (!student) {

            return res.status(401).json({

                message:
                    "Invalid email or password."

            });

        }


        console.log(
            "Student login successful:",
            email
        );


        res.json({

            success:
                true,

            message:
                "Login successful.",

            student: {

                id:
                    student.id,

                name:
                    student.name,

                studentId:
                    student.studentId,

                department:
                    student.department,

                year:
                    student.year,

                email:
                    student.email

            }

        });

    }
);


// ==================================================
// ADMIN / COORDINATOR REGISTRATION
// ==================================================

app.post(
    "/api/admins/register",
    function (req, res) {

        console.log(
            "Admin registration request received:",
            req.body.email
        );


        const {

            name,
            adminId,
            role,
            department,
            email,
            password

        } = req.body;


        // ==============================
        // VALIDATE FIELDS
        // ==============================

        if (
            !name ||
            !adminId ||
            !role ||
            !department ||
            !email ||
            !password
        ) {

            return res.status(400).json({

                message:
                    "Please fill in all fields."

            });

        }


        // ==============================
        // VALIDATE ROLE
        // ==============================

        if (
            role !== "admin" &&
            role !== "coordinator"
        ) {

            return res.status(400).json({

                message:
                    "Invalid account type."

            });

        }


        const admins =
            readData(
                adminsFile
            );


        // ==============================
        // CHECK ADMIN ID
        // ==============================

        const existingAdminId =
            admins.find(
                admin =>
                    admin.adminId &&
                    admin.adminId
                        .toLowerCase() ===
                    adminId.toLowerCase()
            );


        if (
            existingAdminId
        ) {

            return res.status(400).json({

                message:
                    "Admin / Coordinator ID is already registered."

            });

        }


        // ==============================
        // CHECK EMAIL
        // ==============================

        const existingEmail =
            admins.find(
                admin =>
                    admin.email &&
                    admin.email
                        .toLowerCase() ===
                    email.toLowerCase()
            );


        if (
            existingEmail
        ) {

            return res.status(400).json({

                message:
                    "Email is already registered."

            });

        }


        // ==============================
        // CREATE ACCOUNT
        // ==============================

        const newAdmin = {

            id:
                admins.length > 0
                    ? Math.max(
                        ...admins.map(
                            admin =>
                                Number(
                                    admin.id
                                ) || 0
                        )
                    ) + 1
                    : 1,

            name:
                name,

            adminId:
                adminId,

            role:
                role,

            department:
                department,

            email:
                email,

            password:
                password

        };


        admins.push(
            newAdmin
        );


        writeData(
            adminsFile,
            admins
        );


        // ==============================
        // RESPONSE WITHOUT PASSWORD
        // ==============================

        const adminResponse = {

            id:
                newAdmin.id,

            name:
                newAdmin.name,

            adminId:
                newAdmin.adminId,

            role:
                newAdmin.role,

            department:
                newAdmin.department,

            email:
                newAdmin.email

        };


        console.log(
            "Admin / Coordinator account created:",
            email
        );


        res.status(201).json({

            success:
                true,

            message:
                "Admin / Coordinator account created successfully.",

            admin:
                adminResponse

        });

    }
);


// ==================================================
// ADMIN / COORDINATOR LOGIN
// ==================================================

app.post(
    "/api/admin/login",
    function (req, res) {

        console.log(
            "Admin / Coordinator login request received:",
            req.body.username
        );


        const {

            username,
            password

        } = req.body;


        if (
            !username ||
            !password
        ) {

            return res.status(400).json({

                message:
                    "Please enter Admin/Coordinator ID or email and password."

            });

        }


        const admins =
            readData(
                adminsFile
            );


        const loginValue =
            username
                .trim()
                .toLowerCase();


        const admin =
            admins.find(
                item => {

                    const adminId =
                        item.adminId
                            ? item.adminId
                                .toLowerCase()
                            : "";


                    const email =
                        item.email
                            ? item.email
                                .toLowerCase()
                            : "";


                    const oldUsername =
                        item.username
                            ? item.username
                                .toLowerCase()
                            : "";


                    return (

                        (
                            adminId ===
                            loginValue
                        )

                        ||

                        (
                            email ===
                            loginValue
                        )

                        ||

                        (
                            oldUsername ===
                            loginValue
                        )

                    )
                    &&

                    item.password ===
                    password;

                }
            );


        if (!admin) {

            console.log(
                "Admin / Coordinator login failed:",
                username
            );


            return res.status(401).json({

                message:
                    "Invalid Admin/Coordinator ID or email, or incorrect password."

            });

        }


        console.log(
            "Admin / Coordinator login successful:",
            username
        );


        res.json({

            success:
                true,

            message:
                "Login successful.",

            admin: {

                id:
                    admin.id,

                name:
                    admin.name ||
                    admin.username,

                adminId:
                    admin.adminId ||
                    "",

                role:
                    admin.role ||
                    "admin",

                department:
                    admin.department ||
                    "",

                email:
                    admin.email ||
                    admin.username

            }

        });

    }
);


// ==================================================
// START SERVER
// ==================================================

app.listen(
    PORT,
    function () {

        console.log("");

        console.log(
            "===================================="
        );

        console.log(
            "EventHub Server Started Successfully"
        );

        console.log(
            "http://localhost:" + PORT
        );

        console.log(
            "===================================="
        );

        console.log("");

    }
);