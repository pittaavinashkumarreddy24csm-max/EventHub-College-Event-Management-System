const totalEventsElement =
    document.getElementById("totalEvents");

const totalParticipantsElement =
    document.getElementById("totalParticipants");

const eventsTableContainer =
    document.getElementById(
        "eventsTableContainer"
    );


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
// LOAD DASHBOARD
// ==============================

async function loadDashboard() {

    try {

        const loggedInAdmin =
            getLoggedInAdmin();


        // ==============================
        // CHECK LOGIN
        // ==============================

        if (!loggedInAdmin) {

            window.location.href =
                "login.html";

            return;

        }


        // ==============================
        // GET EVENTS
        // ==============================

        const eventsResponse =
            await fetch(
                "/api/events"
            );


        // ==============================
        // GET REGISTRATIONS
        // ==============================

        const registrationsResponse =
            await fetch(
                "/api/registrations"
            );


        if (
            !eventsResponse.ok ||
            !registrationsResponse.ok
        ) {

            throw new Error(
                "Unable to load dashboard data."
            );

        }


        const allEvents =
            await eventsResponse.json();


        const registrations =
            await registrationsResponse.json();


        // ==============================
        // FILTER ADMIN EVENTS
        // ==============================

        const adminEvents =
            allEvents.filter(
                event => {

                    /*
                     * New events have adminId.
                     * Only show events belonging
                     * to the logged-in admin.
                     */

                    if (
                        event.adminId &&
                        loggedInAdmin.adminId
                    ) {

                        return (
                            event.adminId
                                .toLowerCase() ===
                            loggedInAdmin.adminId
                                .toLowerCase()
                        );

                    }


                    /*
                     * Old events do not have
                     * coordinator information.
                     *
                     * Keep them visible so
                     * existing events are not lost.
                     */

                    return true;

                }
            );


        // ==============================
        // ADMIN EVENT IDS
        // ==============================

        const adminEventIds =
            adminEvents.map(
                event =>
                    Number(event.id)
            );


        // ==============================
        // FILTER REGISTRATIONS
        // ==============================

        const adminRegistrations =
            registrations.filter(
                registration =>
                    adminEventIds.includes(
                        Number(
                            registration.eventId
                        )
                    )
            );


        // ==============================
        // DISPLAY
        // ==============================

        displayStatistics(
            adminEvents,
            adminRegistrations
        );


        displayEvents(
            adminEvents,
            adminRegistrations,
            loggedInAdmin
        );


    } catch (error) {

        console.error(
            error
        );


        eventsTableContainer.innerHTML = `

            <div class="dashboard-error">

                Unable to load dashboard data.

            </div>

        `;

    }

}


// ==============================
// DISPLAY STATISTICS
// ==============================

function displayStatistics(
    events,
    registrations
) {

    totalEventsElement.textContent =
        events.length;


    totalParticipantsElement.textContent =
        registrations.length;

}


// ==============================
// DISPLAY EVENTS
// ==============================

function displayEvents(
    events,
    registrations,
    loggedInAdmin
) {

    if (
        events.length === 0
    ) {

        eventsTableContainer.innerHTML = `

            <p>
                No events available.
            </p>

        `;

        return;

    }


    let tableHTML = `

        <table class="events-table">

            <thead>

                <tr>

                    <th>
                        Event
                    </th>

                    <th>
                        Date
                    </th>

                    <th>
                        Venue
                    </th>

                    <th>
                        Maximum
                    </th>

                    <th>
                        Participants
                    </th>

                    <th>
                        Action
                    </th>

                </tr>

            </thead>

            <tbody>

    `;


    events.forEach(
        event => {


            const participantCount =
                registrations.filter(
                    registration =>
                        Number(
                            registration.eventId
                        ) ===
                        Number(
                            event.id
                        )
                ).length;


            /*
             * An event can be edited or deleted
             * only when it has coordinator ownership
             * information.
             */

            const canManage =
                event.adminId &&
                loggedInAdmin.adminId &&
                event.adminId
                    .toLowerCase() ===
                loggedInAdmin.adminId
                    .toLowerCase();


            tableHTML += `

                <tr>

                    <td>

                        <strong>
                            ${event.title}
                        </strong>

                    </td>


                    <td>
                        ${formatDate(event.date)}
                    </td>


                    <td>
                        ${event.venue}
                    </td>


                    <td>
                        ${event.maxParticipants}
                    </td>


                    <td>

                        <strong>
                            ${participantCount}
                        </strong>

                    </td>


                    <td>

                        <div class="event-actions">

                            <a
                                href="participants.html?id=${event.id}"
                                class="view-event"
                            >
                                View Participants
                            </a>

                            ${
                                canManage
                                    ? `
                                        <a
                                            href="edit-event.html?id=${event.id}"
                                            class="view-event"
                                        >
                                            Edit
                                        </a>

                                        <button
                                            type="button"
                                            class="delete-event-btn"
                                            onclick="deleteEvent(${event.id})"
                                        >
                                            Delete
                                        </button>
                                    `
                                    : `
                                        <span>
                                            Existing Event
                                        </span>
                                    `
                            }

                        </div>

                    </td>

                </tr>

            `;

        }
    );


    tableHTML += `

            </tbody>

        </table>

    `;


    eventsTableContainer.innerHTML =
        tableHTML;

}


// ==============================
// DELETE EVENT
// ==============================

async function deleteEvent(
    eventId
) {

    const loggedInAdmin =
        getLoggedInAdmin();


    if (!loggedInAdmin) {

        alert(
            "Your login session has expired. Please sign in again."
        );

        window.location.href =
            "login.html";

        return;

    }


    const confirmed =
        confirm(
            "Are you sure you want to delete this event? All registrations for this event will also be removed."
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                `/api/events/${eventId}`,
                {

                    method: "DELETE",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            adminId:
                                loggedInAdmin.adminId

                        })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Unable to delete event."
            );

            return;

        }


        alert(
            "Event deleted successfully."
        );


        // Reload dashboard

        loadDashboard();


    } catch (error) {

        console.error(
            "Delete event error:",
            error
        );


        alert(
            "Unable to connect to the server."
        );

    }

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
            month: "short",
            day: "numeric"
        }
    );

}


// ==============================
// START DASHBOARD
// ==============================

loadDashboard();