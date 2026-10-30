const adminRegisterForm =
document.getElementById(
"adminRegisterForm"
);

const adminRegisterMessage =
document.getElementById(
"adminRegisterMessage"
);

adminRegisterForm.addEventListener(
"submit",
async function (event) {


    event.preventDefault();


    const name =
        document.getElementById(
            "name"
        ).value.trim();


    const adminId =
        document.getElementById(
            "adminId"
        ).value.trim();


    const role =
        document.getElementById(
            "role"
        ).value;


    const department =
        document.getElementById(
            "department"
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


    // Check required fields

    if (
        !name ||
        !adminId ||
        !role ||
        !department ||
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


    // Check password

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


    try {

        showMessage(
            "Creating your account...",
            "success"
        );


        const response =
            await fetch(
                "/api/admins/register",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        name: name,

                        adminId: adminId,

                        role: role,

                        department:
                            department,

                        email: email,

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
                "Invalid server response:",
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
                "Unable to create account.",
                "error"
            );

            return;
        }


        showMessage(
            "Account created successfully! Redirecting to Sign In...",
            "success"
        );


        adminRegisterForm.reset();


        setTimeout(
            function () {

                window.location.href =
                    "login.html";

            },
            1500
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


adminRegisterMessage.textContent =
    message;

adminRegisterMessage.className =
    "login-message " +
    type;


}
