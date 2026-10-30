const eventsContainer =
    document.getElementById("eventsContainer");


// ==============================
// LOAD EVENTS
// ==============================

async function loadEvents() {

    try {

        const response =
            await fetch("/api/events");


        if (!response.ok) {

            throw new Error(
                "Failed to fetch events."
            );

        }


        const events =
            await response.json();


        console.log(
            "Events received:",
            events
        );


        displayEvents(events);


    } catch (error) {

        console.error(
            "Error loading events:",
            error
        );


        eventsContainer.innerHTML = `

            <div class="feature-card">

                <h3>
                    Unable to load events
                </h3>

                <p>
                    There was a problem loading the events.
                    Please try again.
                </p>

            </div>

        `;

    }

}



// ==============================
// DISPLAY EVENTS
// ==============================

function displayEvents(events) {

    eventsContainer.innerHTML = "";


    if (events.length === 0) {

        eventsContainer.innerHTML = `

            <div class="feature-card">

                <h3>
                    No Events Available
                </h3>

                <p>
                    There are currently no upcoming events.
                </p>

            </div>

        `;

        return;

    }


    events.forEach(function(event) {


        const eventCard =
            document.createElement("div");


        eventCard.className =
            "event-card";


        eventCard.innerHTML = `

            <div class="event-image">
                EVENT
            </div>


            <div class="event-content">


                <div class="event-date">
                    ${formatDate(event.date)}
                </div>


                <h3>
                    ${event.title}
                </h3>


                <p>
                    ${event.description}
                </p>


                <a
                    href="event-details.html?id=${event.id}"
                    class="view-event"
                >
                    View Event →
                </a>


            </div>

        `;


        eventsContainer.appendChild(
            eventCard
        );

    });

}



// ==============================
// FORMAT DATE
// ==============================

function formatDate(dateString) {

    const date =
        new Date(dateString);


    return date.toLocaleDateString(
        "en-US",
        {
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );

}



// ==============================
// START
// ==============================

loadEvents();