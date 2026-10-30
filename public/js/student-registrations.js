// ==========================================
// GET LOGGED-IN STUDENT
// ==========================================

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


// ==========================================
// LOAD MY REGISTRATIONS
// ==========================================

async function loadMyRegistrations() {

    const container =
        document.getElementById(
            "registrationsContainer"
        );


    const student =
        getLoggedInStudent();


    // Student must be logged in

    if (!student) {

        window.location.href =
            "login.html";

        return;

    }


    try {

        // Get all registrations

        const registrationsResponse =
            await fetch(
                "/api/registrations"
            );


        // Get all events

        const eventsResponse =
            await fetch(
                "/api/events"
            );


        if (
            !registrationsResponse.ok ||
            !eventsResponse.ok
        ) {

            throw new Error(
                "Unable to load registration data."
            );

        }


        const registrations =
            await registrationsResponse.json();


        const events =
            await eventsResponse.json();


        // ==========================================
        // FILTER STUDENT REGISTRATIONS
        // ==========================================

        const studentRegistrations =
            registrations.filter(
                registration => {

                    return (
                        registration.email &&
                        student.email &&
                        registration.email
                            .toLowerCase() ===
                        student.email
                            .toLowerCase()
                    );

                }
            );


        // ==========================================
        // NO REGISTRATIONS
        // ==========================================

        if (
            studentRegistrations.length === 0
        ) {

            container.innerHTML = `

                <div class="empty-state">

                    <h3>
                        No registrations yet
                    </h3>

                    <p>
                        You have not registered for any events yet.
                    </p>

                    <br>

                    <a
                        href="../events.html"
                        class="primary-btn"
                    >
                        Browse Events
                    </a>

                </div>

            `;

            return;

        }


        // ==========================================
        // DISPLAY REGISTRATIONS
        // ==========================================

        let registrationsHTML = `

            <div class="registration-list">

        `;


        studentRegistrations.forEach(
            registration => {

                const event =
                    events.find(
                        event =>
                            Number(event.id) ===
                            Number(
                                registration.eventId
                            )
                    );


                if (!event) {

                    return;

                }


                registrationsHTML += `

                    <div class="registration-item">

                        <div class="registration-info">

                            <h3>
                                ${event.title}
                            </h3>

                            <p>
                                <strong>
                                    Date:
                                </strong>
                                ${formatDate(event.date)}
                            </p>

                            <p>
                                <strong>
                                    Time:
                                </strong>
                                ${event.time}
                            </p>

                            <p>
                                <strong>
                                    Venue:
                                </strong>
                                ${event.venue}
                            </p>

                        </div>


                        <div class="registration-status">

                            <span class="status-badge">
                                Registered
                            </span>

                        </div>

                    </div>

                `;

            }
        );


        registrationsHTML += `

            </div>

        `;


        container.innerHTML =
            registrationsHTML;


    } catch (error) {

        console.error(
            "Unable to load registrations:",
            error
        );


        container.innerHTML = `

            <div class="dashboard-error">

                Unable to load your registrations.

                <br><br>

                Please make sure the EventHub server is running.

            </div>

        `;

    }

}


// ==========================================
// FORMAT DATE
// ==========================================

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
            month: "short",
            day: "numeric"
        }
    );

}


// ==========================================
// START
// ==========================================

loadMyRegistrations();