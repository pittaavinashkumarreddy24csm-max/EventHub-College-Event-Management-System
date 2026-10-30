// ==========================================
// EVENTHUB ADMIN / COORDINATOR AUTH CHECK
// ==========================================

const storedUser =
    localStorage.getItem("eventHubUser");


if (!storedUser) {

    window.location.href =
        "login.html";

} else {

    try {

        const eventHubUser =
            JSON.parse(storedUser);


        // Make sure an admin account is logged in

        if (
            eventHubUser.role !== "admin" ||
            !eventHubUser.user
        ) {

            localStorage.removeItem(
                "eventHubUser"
            );

            window.location.href =
                "login.html";

        }

    } catch (error) {

        console.error(
            "Invalid EventHub user session:",
            error
        );

        localStorage.removeItem(
            "eventHubUser"
        );

        window.location.href =
            "login.html";
    }

}


// ==========================================
// GET CURRENT ADMIN / COORDINATOR
// ==========================================

function getLoggedInAdmin() {

    const storedUser =
        localStorage.getItem(
            "eventHubUser"
        );


    if (!storedUser) {
        return null;
    }


    try {

        const eventHubUser =
            JSON.parse(storedUser);


        if (
            eventHubUser.role !== "admin" ||
            !eventHubUser.user
        ) {

            return null;

        }


        return eventHubUser.user;

    } catch (error) {

        console.error(
            "Unable to read admin session:",
            error
        );

        return null;
    }

}


// ==========================================
// LOGOUT
// ==========================================

function logoutAdmin() {

    localStorage.removeItem(
        "eventHubUser"
    );


    window.location.href =
        "login.html";

}