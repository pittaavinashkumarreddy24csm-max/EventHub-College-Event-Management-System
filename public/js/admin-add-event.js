const addEventForm =
    document.getElementById("addEventForm");

const eventMessage =
    document.getElementById("eventMessage");


// ==========================================
// GET LOGGED-IN ADMIN / COORDINATOR
// ==========================================

function getLoggedInAdmin() {

    const storedUser =
        localStorage.getItem("eventHubUser");

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
            "Unable to read logged-in admin:",
            error
        );

        return null;
    }
}


// ==========================================
// CHECK LOGIN
// ==========================================

const loggedInAdmin =
    getLoggedInAdmin();


if (!loggedInAdmin) {

    window.location.href =
        "login.html";

}


// ==========================================
// FORM SUBMISSION
// ==========================================

addEventForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        // Get form values

        const title =
            document.getElementById(
                "title"
            ).value.trim();


        const date =
            document.getElementById(
                "date"
            ).value;


        const time =
            document.getElementById(
                "time"
            ).value;


        const venue =
            document.getElementById(
                "venue"
            ).value.trim();


        const maxParticipants =
            document.getElementById(
                "maxParticipants"
            ).value;


        const description =
            document.getElementById(
                "description"
            ).value.trim();


        // Validate fields

        if (
            !title ||
            !date ||
            !time ||
            !venue ||
            !maxParticipants ||
            !description
        ) {

            showMessage(
                "Please fill in all fields.",
                "error"
            );

            return;
        }


        if (
            Number(maxParticipants) <= 0
        ) {

            showMessage(
                "Maximum participants must be greater than 0.",
                "error"
            );

            return;
        }


        // Get the latest logged-in account

        const currentAdmin =
            getLoggedInAdmin();


        if (!currentAdmin) {

            showMessage(
                "Your login session has expired. Please sign in again.",
                "error"
            );

            setTimeout(
                function () {

                    window.location.href =
                        "login.html";

                },
                1200
            );

            return;
        }


        try {

            showMessage(
                "Creating event...",
                "success"
            );


            const response =
                await fetch(
                    "/api/events",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            title:
                                title,

                            date:
                                date,

                            time:
                                time,

                            venue:
                                venue,

                            description:
                                description,

                            maxParticipants:
                                Number(
                                    maxParticipants
                                ),


                            // ==================================
                            // CREATOR INFORMATION
                            // ==================================

                            coordinatorName:
                                currentAdmin.name,

                            adminId:
                                currentAdmin.adminId,

                            department:
                                currentAdmin.department,

                            coordinatorRole:
                                currentAdmin.role,

                            coordinatorEmail:
                                currentAdmin.email

                        })
                    }
                );


            const responseText =
                await response.text();


            console.log(
                "Server status:",
                response.status
            );


            console.log(
                "Server response:",
                responseText
            );


            let data;


            try {

                data =
                    JSON.parse(
                        responseText
                    );

            } catch (jsonError) {

                console.error(
                    "Invalid server response:",
                    responseText
                );

                showMessage(
                    "Server returned an unexpected response. Check the terminal.",
                    "error"
                );

                return;
            }


            if (!response.ok) {

                showMessage(
                    data.message ||
                    "Unable to create event.",
                    "error"
                );

                return;
            }


            showMessage(
                "Event created successfully!",
                "success"
            );


            addEventForm.reset();


            setTimeout(
                function () {

                    window.location.href =
                        "dashboard.html";

                },
                1200
            );


        } catch (error) {

            console.error(
                "FETCH ERROR:",
                error
            );


            showMessage(
                "Unable to connect to the EventHub server. Check that http://localhost:3000 is running.",
                "error"
            );

        }

    }
);


// ==========================================
// MESSAGE
// ==========================================

function showMessage(
    message,
    type
) {

    eventMessage.textContent =
        message;

    eventMessage.className =
        "login-message " +
        type;

}