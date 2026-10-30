const selectedEvent =
    document.getElementById("selectedEvent");

const registrationForm =
    document.getElementById("registrationForm");

const registrationMessage =
    document.getElementById("registrationMessage");


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
// GET LOGGED-IN STUDENT
// ==============================

function getLoggedInStudent() {

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
            eventHubUser.role !== "student" ||
            !eventHubUser.user
        ) {

            return null;

        }


        return eventHubUser.user;

    } catch (error) {

        console.error(
            "Unable to read student session:",
            error
        );

        return null;

    }

}


// ==============================
// CHECK STUDENT LOGIN
// ==============================

const loggedInStudent =
    getLoggedInStudent();


if (!loggedInStudent) {

    selectedEvent.innerHTML = `

        <h2>
            Student Sign In Required
        </h2>

        <p>
            Please sign in as a student before registering for an event.
        </p>

        <br>

        <a
            href="student/login.html"
            class="primary-btn"
        >
            Student Sign In
        </a>

    `;

    registrationForm.style.display =
        "none";

}


// ==============================
// GET EVENT ID
// ==============================

else if (!eventId) {

    selectedEvent.innerHTML = `

        <h2>
            No Event Selected
        </h2>

        <p>
            Please select an event before registering.
        </p>

    `;

    registrationForm.style.display =
        "none";

}


// ==============================
// LOAD EVENT
// ==============================

else {

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

            selectedEvent.innerHTML = `

                <h2>
                    Event Not Found
                </h2>

                <p>
                    The selected event does not exist.
                </p>

            `;

            registrationForm.style.display =
                "none";

            return;

        }


        // ==============================
        // DISPLAY SELECTED EVENT
        // ==============================

        selectedEvent.innerHTML = `

            <h2>
                ${event.title}
            </h2>

            <p>
                <strong>Date:</strong>
                ${formatDate(event.date)}
            </p>

            <p>
                <strong>Time:</strong>
                ${event.time}
            </p>

            <p>
                <strong>Venue:</strong>
                ${event.venue}
            </p>

            <p>
                <strong>Maximum Participants:</strong>
                ${event.maxParticipants}
            </p>

        `;


        // ==============================
        // AUTO-FILL STUDENT DETAILS
        // ==============================

        const nameInput =
            document.getElementById(
                "name"
            );


        const emailInput =
            document.getElementById(
                "email"
            );


        if (nameInput) {

            nameInput.value =
                loggedInStudent.name || "";

            nameInput.readOnly =
                true;

        }


        if (emailInput) {

            emailInput.value =
                loggedInStudent.email || "";

            emailInput.readOnly =
                true;

        }


    } catch (error) {

        console.error(
            error
        );


        selectedEvent.innerHTML = `

            <h2>
                Error
            </h2>

            <p>
                Unable to load event information.
            </p>

        `;

        registrationForm.style.display =
            "none";

    }

}


// ==============================
// SUBMIT REGISTRATION
// ==============================

registrationForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        // ==============================
        // CHECK LOGIN
        // ==============================

        const currentStudent =
            getLoggedInStudent();


        if (!currentStudent) {

            showMessage(
                "Your student login session has expired. Please sign in again.",
                "error"
            );

            return;

        }


        // ==============================
        // GET FORM VALUES
        // ==============================

        const name =
            currentStudent.name.trim();


        const email =
            currentStudent.email.trim();


        const phone =
            document
                .getElementById("phone")
                .value
                .trim();


        // ==============================
        // VALIDATION
        // ==============================

        if (
            !name ||
            !email ||
            !phone
        ) {

            showMessage(
                "Please fill in all the fields.",
                "error"
            );

            return;

        }


        // ==============================
        // PHONE VALIDATION
        // ==============================

        if (
            !/^[0-9]{10}$/.test(phone)
        ) {

            showMessage(
                "Please enter a valid 10-digit phone number.",
                "error"
            );

            return;

        }


        // ==============================
        // REGISTRATION DATA
        // ==============================

        const registrationData = {

            eventId:
                Number(eventId),

            name:
                name,

            email:
                email,

            phone:
                phone

        };


        try {

            showMessage(
                "Submitting registration...",
                "success"
            );


            // ==============================
            // SEND TO SERVER
            // ==============================

            const response =
                await fetch(
                    "/api/registrations",
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify(
                                registrationData
                            )

                    }
                );


            const data =
                await response.json();


            // ==============================
            // ERROR
            // ==============================

            if (
                !response.ok ||
                !data.success
            ) {

                showMessage(
                    data.message ||
                    "Registration failed.",
                    "error"
                );

                return;

            }


            // ==============================
            // SUCCESS
            // ==============================

            showMessage(
                "Registration successful! You have been registered for this event.",
                "success"
            );


            // Clear phone input

            const phoneInput =
                document.getElementById(
                    "phone"
                );


            if (phoneInput) {

                phoneInput.value = "";

            }


        } catch (error) {

            console.error(
                error
            );


            showMessage(
                "Unable to complete registration. Please try again.",
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

    registrationMessage.textContent =
        message;


    registrationMessage.className =
        "registration-message " +
        type;

}


// ==============================
// FORMAT DATE
// ==============================

function formatDate(
    dateString
) {

    const date =
        new Date(
            dateString
        );


    return date.toLocaleDateString(
        "en-US",
        {
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );

}