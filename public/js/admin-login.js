const adminLoginForm =
    document.getElementById(
        "adminLoginForm"
    );

const loginMessage =
    document.getElementById(
        "loginMessage"
    );


adminLoginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const username =
            document.getElementById(
                "username"
            ).value.trim();


        const password =
            document.getElementById(
                "password"
            ).value;


        // Check fields

        if (
            !username ||
            !password
        ) {

            showMessage(
                "Please enter your Admin/Coordinator ID or email and password.",
                "error"
            );

            return;
        }


        try {

            showMessage(
                "Signing in...",
                "success"
            );


            const response =
                await fetch(
                    "/api/admin/login",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            username:
                                username,

                            password:
                                password

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
                    "Server did not return JSON:",
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
                    "Invalid ID/email or password.",
                    "error"
                );

                return;
            }


            // Save logged-in admin/coordinator

            localStorage.setItem(
                "eventHubUser",
                JSON.stringify({

                    role: "admin",

                    user: data.admin

                })
            );


            showMessage(
                "Login successful! Redirecting...",
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


function showMessage(
    message,
    type
) {

    loginMessage.textContent =
        message;

    loginMessage.className =
        "login-message " +
        type;
}