const storedUser =
localStorage.getItem("eventHubUser");

// Check whether a student is logged in

if (!storedUser) {

window.location.href =
    "login.html";


} else {


try {

    const eventHubUser =
        JSON.parse(storedUser);

    // Make sure the logged-in account is a student

    if (
        eventHubUser.role !== "student" ||
        !eventHubUser.user
    ) {

        localStorage.removeItem(
            "eventHubUser"
        );

        window.location.href =
            "login.html";

    } else {

        const student =
            eventHubUser.user;


        // Welcome message

        document.getElementById(
            "welcomeMessage"
        ).textContent =
            "Welcome, " + student.name + "!";


        // Student profile

        document.getElementById(
            "studentName"
        ).textContent =
            student.name || "-";


        document.getElementById(
            "studentId"
        ).textContent =
            student.studentId || "-";


        document.getElementById(
            "studentDepartment"
        ).textContent =
            student.department || "-";


        document.getElementById(
            "studentYear"
        ).textContent =
            student.year || "-";


        document.getElementById(
            "studentEmail"
        ).textContent =
            student.email || "-";

    }

} catch (error) {

    console.error(
        "Unable to read logged-in student:",
        error
    );

    localStorage.removeItem(
        "eventHubUser"
    );

    window.location.href =
        "login.html";
}


}

// Logout

document.getElementById(
"logoutBtn"
).addEventListener(
"click",
function () {

    localStorage.removeItem(
        "eventHubUser"
    );

    window.location.href =
        "../index.html";
}

);
