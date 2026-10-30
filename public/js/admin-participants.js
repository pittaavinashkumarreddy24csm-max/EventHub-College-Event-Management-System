// ==============================
// GET HTML ELEMENTS
// ==============================

const eventTitle =
    document.getElementById(
        "eventTitle"
    );


const participantCount =
    document.getElementById(
        "participantCount"
    );


const participantsContainer =
    document.getElementById(
        "participantsContainer"
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
// CHECK EVENT ID
// ==============================

if (!eventId) {

    eventTitle.textContent =
        "No event selected.";


    participantsContainer.innerHTML = `

        <div class="dashboard-error">

            No event was selected.

        </div>

    `;

} else {

    loadParticipants();

}


// ==============================
// LOAD PARTICIPANTS
// ==============================

async function loadParticipants() {

    try {

        // ==============================
        // LOAD ALL EVENTS
        // ==============================

        const eventsResponse =
            await fetch(
                "/api/events"
            );


        if (!eventsResponse.ok) {

            throw new Error(
                "Unable to load events."
            );

        }


        const events =
            await eventsResponse.json();


        // ==============================
        // FIND SELECTED EVENT
        // ==============================

        const event =
            events.find(
                item =>
                    Number(item.id) ===
                    Number(eventId)
            );


        if (!event) {

            eventTitle.textContent =
                "Event not found.";


            participantsContainer.innerHTML = `

                <div class="dashboard-error">

                    The selected event could not be found.

                </div>

            `;

            participantCount.textContent =
                "0";

            return;

        }


        // ==============================
        // DISPLAY EVENT TITLE
        // ==============================

        eventTitle.textContent =
            event.title;


        // ==============================
        // LOAD REGISTRATIONS
        // ==============================

        const registrationsResponse =
            await fetch(
                `/api/events/${eventId}/registrations`
            );


        if (!registrationsResponse.ok) {

            throw new Error(
                "Unable to load participants."
            );

        }


        const registrations =
            await registrationsResponse.json();


        // ==============================
        // CHECK RESPONSE
        // ==============================

        if (!Array.isArray(registrations)) {

            throw new Error(
                "Invalid participant data received from server."
            );

        }


        // ==============================
        // DISPLAY COUNT
        // ==============================

        participantCount.textContent =
            registrations.length;


        // ==============================
        // DISPLAY PARTICIPANTS
        // ==============================

        displayParticipants(
            registrations
        );


    } catch (error) {

        console.error(
            "Unable to load participants:",
            error
        );


        participantCount.textContent =
            "0";


        participantsContainer.innerHTML = `

            <div class="dashboard-error">

                Unable to load participant information.

                <br><br>

                Please make sure the EventHub server is running.

            </div>

        `;

    }

}


// ==============================
// DISPLAY PARTICIPANTS
// ==============================

function displayParticipants(
    registrations
) {

    // ==============================
    // NO PARTICIPANTS
    // ==============================

    if (
        registrations.length === 0
    ) {

        participantsContainer.innerHTML = `

            <div class="feature-card">

                <h3>
                    No Participants Yet
                </h3>

                <p>
                    No one has registered for this event yet.
                </p>

            </div>

        `;

        return;

    }


    // ==============================
    // CREATE TABLE
    // ==============================

    let tableHTML = `

        <table class="events-table">

            <thead>

                <tr>

                    <th>
                        #
                    </th>

                    <th>
                        Name
                    </th>

                    <th>
                        Email
                    </th>

                    <th>
                        Phone
                    </th>

                    <th>
                        Registered On
                    </th>

                </tr>

            </thead>

            <tbody>

    `;


    // ==============================
    // ADD PARTICIPANTS
    // ==============================

    registrations.forEach(
        function (
            registration,
            index
        ) {

            tableHTML += `

                <tr>

                    <td>
                        ${index + 1}
                    </td>

                    <td>

                        <strong>
                            ${escapeHTML(
                                registration.name ||
                                "-"
                            )}
                        </strong>

                    </td>

                    <td>
                        ${escapeHTML(
                            registration.email ||
                            "-"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            registration.phone ||
                            "-"
                        )}
                    </td>

                    <td>
                        ${formatDateTime(
                            registration.registeredAt
                        )}
                    </td>

                </tr>

            `;

        }
    );


    // ==============================
    // CLOSE TABLE
    // ==============================

    tableHTML += `

            </tbody>

        </table>

    `;


    participantsContainer.innerHTML =
        tableHTML;

}


// ==============================
// FORMAT DATE AND TIME
// ==============================

function formatDateTime(
    dateString
) {

    if (!dateString) {

        return "-";

    }


    const date =
        new Date(
            dateString
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "-";

    }


    return date.toLocaleString(
        "en-IN",
        {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


// ==============================
// ESCAPE HTML
// ==============================

function escapeHTML(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(value);


    return div.innerHTML;

}