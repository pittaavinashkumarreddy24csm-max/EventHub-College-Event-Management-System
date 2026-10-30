// ==============================
// GET FORM ELEMENTS
// ==============================

const editEventForm =
    document.getElementById(
        "editEventForm"
    );


const editEventMessage =
    document.getElementById(
        "editEventMessage"
    );


// ==============================
// GET EVENT ID
// ==============================

const urlParams =
    new URLSearchParams(
        window.location.search
    );


const eventId =
    urlParams.get("id");


// ==============================
// GET LOGGED-IN ADMIN
// ==============================

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
            JSON.parse(
                storedUser
            );


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


// ==============================
// CHECK EVENT ID
// ==============================

if (!eventId) {

    showMessage(
        "No event was selected.",
        "error"
    );

} else {

    loadEvent();

}


// ==============================
// LOAD EVENT
// ==============================

async function loadEvent() {

    try {

        const response =
            await fetch(
                "/api/events"
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load events."
            );

        }


        const events =
            await response.json();


        const event =
            events.find(
                item =>
                    Number(item.id) ===
                    Number(eventId)
            );


        if (!event) {

            showMessage(
                "Event not found.",
                "error"
            );

            return;

        }


        // ==============================
        // CHECK OWNERSHIP
        // ==============================

        const loggedInAdmin =
            getLoggedInAdmin();


        if (!loggedInAdmin) {

            window.location.href =
                "login.html";

            return;

        }


        if (
            event.adminId &&
            loggedInAdmin.adminId &&
            event.adminId.toLowerCase() !==
            loggedInAdmin.adminId.toLowerCase()
        ) {

            showMessage(
                "You are not authorized to edit this event.",
                "error"
            );

            editEventForm.style.display =
                "none";

            return;

        }


        // ==============================
        // FILL FORM
        // ==============================

        document.getElementById(
            "title"
        ).value =
            event.title || "";


        document.getElementById(
            "date"
        ).value =
            event.date || "";


        document.getElementById(
            "time"
        ).value =
            event.time || "";


        document.getElementById(
            "venue"
        ).value =
            event.venue || "";


        document.getElementById(
            "department"
        ).value =
            event.department || "";


        document.getElementById(
            "coordinatorName"
        ).value =
            event.coordinatorName || "";


        document.getElementById(
            "coordinatorRole"
        ).value =
            event.coordinatorRole || "";


        document.getElementById(
            "coordinatorEmail"
        ).value =
            event.coordinatorEmail || "";


        document.getElementById(
            "description"
        ).value =
            event.description || "";


        document.getElementById(
            "registrationLink"
        ).value =
            event.registrationLink || "";


        document.getElementById(
            "maxParticipants"
        ).value =
            event.maxParticipants || "";


    } catch (error) {

        console.error(
            "Load event error:",
            error
        );


        showMessage(
            "Unable to load event information.",
            "error"
        );

    }

}


// ==============================
// UPDATE EVENT
// ==============================

editEventForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const loggedInAdmin =
            getLoggedInAdmin();


        if (!loggedInAdmin) {

            window.location.href =
                "login.html";

            return;

        }

        
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
            ).value.trim();


        const venue =
            document.getElementById(
                "venue"
            ).value.trim();


        const department =
            document.getElementById(
                "department"
            ).value;


        const coordinatorName =
            document.getElementById(
                "coordinatorName"
            ).value.trim();


        const coordinatorRole =
            document.getElementById(
                "coordinatorRole"
            ).value;


        const coordinatorEmail =
            document.getElementById(
                "coordinatorEmail"
            ).value.trim();


        const description =
            document.getElementById(
                "description"
            ).value.trim();


        const registrationLink =
            document.getElementById(
                "registrationLink"
            ).value.trim();


        const maxParticipants =
            Number(
                document.getElementById(
                    "maxParticipants"
                ).value
            );


        // ==============================
        // VALIDATION
        // ==============================

        if (
            !title ||
            !date ||
            !time ||
            !venue ||
            !department ||
            !coordinatorName ||
            !coordinatorRole ||
            !coordinatorEmail ||
            !description ||
            !maxParticipants
        ) {

            showMessage(
                "Please fill in all required fields.",
                "error"
            );

            return;

        }


        if (maxParticipants < 1) {

            showMessage(
                "Maximum participants must be at least 1.",
                "error"
            );

            return;

        }


        // ==============================
        // UPDATE DATA
        // ==============================

        const eventData = {

            title:
                title,

            date:
                date,

            time:
                time,

            venue:
                venue,

            department:
                department,

            coordinatorName:
                coordinatorName,

            coordinatorRole:
                coordinatorRole,

            coordinatorEmail:
                coordinatorEmail,

            description:
                description,

            registrationLink:
                registrationLink,

            maxParticipants:
                maxParticipants,

            adminId:
                loggedInAdmin.adminId

        };


        try {

            showMessage(
                "Updating event...",
                "success"
            );


            const response =
                await fetch(
                    `/api/events/${eventId}`,
                    {

                        method:
                            "PUT",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify(
                                eventData
                            )

                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                showMessage(
                    data.message ||
                    "Unable to update event.",
                    "error"
                );

                return;

            }


            showMessage(
                "Event updated successfully!",
                "success"
            );


            setTimeout(
                function () {

                    window.location.href =
                        "dashboard.html";

                },
                1000
            );


        } catch (error) {

            console.error(
                "Update event error:",
                error
            );


            showMessage(
                "Unable to connect to the EventHub server.",
                "error"
            );

        }

    }
);


// ==============================
// SHOW MESSAGE
// ==============================

function showMessage(
    message,
    type
) {

    editEventMessage.textContent =
        message;


    editEventMessage.className =
        "login-message " +
        type;

}