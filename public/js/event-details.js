// Get the event details container
const eventDetails = document.getElementById("eventDetails");


// Get the event ID from the URL
const urlParams = new URLSearchParams(window.location.search);

const eventId = urlParams.get("id");


// Check whether an event ID exists
if (!eventId) {

    eventDetails.innerHTML = `
        <div class="feature-card">
            <h2>Event Not Found</h2>

            <p>
                No event was selected.
            </p>

            <br>

            <a href="events.html" class="primary-btn">
                Back to Events
            </a>
        </div>
    `;

} else {

    loadEvent(eventId);

}


// Load event from backend
function loadEvent(id) {

    fetch("/api/events")

        .then(response => {

            if (!response.ok) {
                throw new Error("Unable to load events.");
            }

            return response.json();

        })

        .then(events => {

            const event = events.find(
                event => event.id === Number(id)
            );


            // Event doesn't exist
            if (!event) {

                eventDetails.innerHTML = `
                    <div class="feature-card">

                        <h2>
                            Event Not Found
                        </h2>

                        <p>
                            The event you are looking for
                            does not exist.
                        </p>

                        <br>

                        <a
                            href="events.html"
                            class="primary-btn"
                        >
                            Back to Events
                        </a>

                    </div>
                `;

                return;
            }


            // Display event
            displayEvent(event);

        })

        .catch(error => {

            console.error(error);

            eventDetails.innerHTML = `
                <div class="feature-card">

                    <h2>
                        Error
                    </h2>

                    <p>
                        Unable to load event details.
                    </p>

                </div>
            `;

        });

}


// Display selected event
function displayEvent(event) {

    eventDetails.innerHTML = `

        <div class="event-details-card">

            <div class="event-details-header">

                <div>

                    <p class="event-date">
                        ${formatDate(event.date)}
                    </p>

                    <h1>
                        ${event.title}
                    </h1>

                </div>

            </div>


            <div class="event-details-info">

                <div class="detail-item">

                    <strong>
                        Date
                    </strong>

                    <span>
                        ${formatDate(event.date)}
                    </span>

                </div>


                <div class="detail-item">

                    <strong>
                        Time
                    </strong>

                    <span>
                        ${event.time}
                    </span>

                </div>


                <div class="detail-item">

                    <strong>
                        Venue
                    </strong>

                    <span>
                        ${event.venue}
                    </span>

                </div>


                <div class="detail-item">

                    <strong>
                        Maximum Participants
                    </strong>

                    <span>
                        ${event.maxParticipants}
                    </span>

                </div>

            </div>


            <div class="event-description">

                <h2>
                    About This Event
                </h2>

                <p>
                    ${event.description}
                </p>

            </div>


            <div class="registration-section">

                <h2>
                    Registration
                </h2>

                <p>
                    Interested in attending this event?
                    Register using the button below.
                </p>

                <a
                    href="register.html?id=${event.id}"
                    class="primary-btn"
                >
                    Register for this Event
                </a>

            </div>


            <div class="back-section">

                <a
                    href="events.html"
                    class="secondary-btn"
                >
                    ← Back to Events
                </a>

            </div>

        </div>

    `;

}


// Format date
function formatDate(dateString) {

    const date = new Date(dateString);

    return date.toLocaleDateString("en-US", {

        year: "numeric",
        month: "long",
        day: "numeric"

    });

}