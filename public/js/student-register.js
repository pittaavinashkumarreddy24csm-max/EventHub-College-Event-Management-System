const studentRegisterForm =
    document.getElementById(
        "studentRegisterForm"
    );

const registerMessage =
    document.getElementById(
        "registerMessage"
    );


studentRegisterForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const name =
            document.getElementById(
                "name"
            ).value.trim();


        const studentId =
            document.getElementById(
                "studentId"
            ).value.trim();


        const department =
            document.getElementById(
                "department"
            ).value;


        const year =
            document.getElementById(
                "year"
            ).value;


        const email =
            document.getElementById(
                "email"
            ).value.trim();


        const password =
            document.getElementById(
                "password"
            ).value;


        const confirmPassword =
            document.getElementById(
                "confirmPassword"
            ).value;


        // ==============================
        // VALIDATION
        // ==============================

        if (
            !name ||
            !studentId ||
            !department ||
            !year ||
            !email ||
            !password ||
            !confirmPassword
        ) {

            showMessage(
                "Please fill in all fields.",
                "error"
            );

            return;
        }


        if (
            password !==
            confirmPassword
        ) {

            showMessage(
                "Passwords do not match.",
                "error"
            );

            return;
        }


        if (
            password.length < 6
        ) {

            showMessage(
                "Password must contain at least 6 characters.",
                "error"
            );

            return;
        }


        // ==============================
        // SEND DATA TO EXPRESS SERVER
        // ==============================

        try {

            showMessage(
                "Creating your account...",
                "success"
            );


            const response =
                await fetch(
                    "/api/students/register",
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({

                                name:
                                    name,

                                studentId:
                                    studentId,

                                department:
                                    department,

                                year:
                                    year,

                                email:
                                    email,

                                password:
                                    password

                            })

                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                showMessage(

                    data.message ||
                    "Unable to create account.",

                    "error"

                );

                return;
            }


            // ==============================
            // SUCCESS
            // ==============================

            showMessage(

                "Account created successfully! Redirecting to Sign In...",

                "success"

            );


            studentRegisterForm.reset();


            setTimeout(
                function () {

                    window.location.href =
                        "login.html";

                },
                1500
            );


        } catch (error) {

            console.error(
                "Connection error:",
                error
            );


            showMessage(

                "Unable to connect to the server. Please make sure the EventHub server is running.",

                "error"

            );

        }

    }
);


// =====================================================
// MESSAGE FUNCTION
// =====================================================

function showMessage(
    message,
    type
) {

    registerMessage.textContent =
        message;


    registerMessage.className =
        "login-message " + type;

}