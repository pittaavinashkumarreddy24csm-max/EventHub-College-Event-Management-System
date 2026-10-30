const studentLoginForm =
    document.getElementById("studentLoginForm");

const loginMessage =
    document.getElementById("loginMessage");


studentLoginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;


        // ==============================
        // VALIDATION
        // ==============================

        if (!email || !password) {

            showMessage(
                "Please enter your email and password.",
                "error"
            );

            return;
        }


        try {

            showMessage(
                "Signing in...",
                "success"
            );


            // ==============================
            // SEND REQUEST TO EXPRESS
            // ==============================

            const response = await fetch(
                "/api/students/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );


            // ==============================
            // GET SERVER RESPONSE AS TEXT
            // ==============================

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


            // ==============================
            // TRY TO CONVERT RESPONSE TO JSON
            // ==============================

            let data;

            try {

                data =
                    JSON.parse(responseText);

            } catch (jsonError) {

                console.error(
                    "Server did not return JSON:",
                    responseText
                );

                showMessage(
                    "Server returned an unexpected response. Check the terminal.",
                    "error"
                );

                return;
            }


            // ==============================
            // LOGIN FAILED
            // ==============================

            if (!response.ok) {

                showMessage(
                    data.message ||
                    "Invalid email or password.",
                    "error"
                );

                return;
            }


            // ==============================
            // SAVE STUDENT LOGIN
            // ==============================

            localStorage.setItem(
                "eventHubUser",
                JSON.stringify({
                    role: "student",
                    user: data.student
                })
            );


            // ==============================
            // SUCCESS
            // ==============================

            showMessage(
                "Login successful!",
                "success"
            );


            setTimeout(
                function () {

                    window.location.href =
                        "dashboard.html";

                },
                800
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


// =====================================================
// SHOW MESSAGE
// =====================================================

function showMessage(
    message,
    type
) {

    loginMessage.textContent =
        message;

    loginMessage.className =
        "login-message " + type;

}