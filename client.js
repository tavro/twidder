function displayView(viewId) {
    var viewContent = document.getElementById(viewId).innerHTML;
    document.body.innerHTML = viewContent;
}

document.addEventListener('submit', function (e) {
    e.preventDefault();
    if (e.target && e.target.id === 'login-form' || e.target && e.target.id === 'signup-form') {
        if(validateForm(e.target.id)) {
            if (e.target.id === 'signup-form') {
                var dataObject = {
                    "email": document.getElementById("email2").value,
                    "password": document.getElementById("password2").value,
                    "firstname": document.getElementById("first_name").value,
                    "familyname": document.getElementById("family_name").value,
                    "gender": "unknown",
                    "city": document.getElementById("city").value,
                    "country": document.getElementById("country").value,
                }
                var res = serverstub.signUp(dataObject);
                if(res.success) {
                    serverstub.signIn(document.getElementById("email2").value, document.getElementById("password2").value)
                    displayView('profileview');
                }
                else {
                    document.getElementById("signup-error").textContent = res.message;
                }
            }
            else {
                var res = serverstub.signIn(document.getElementById("email").value, document.getElementById("password").value);
                if(res.success) {
                    displayView('profileview');
                }
                else {
                    document.getElementById("login-error").textContent = res.message;
                }
            }
        }
    }
});

window.addEventListener('load', function () {
    if (localStorage.getItem('loggedinusers')) {
        var storedData = JSON.parse(localStorage.getItem('loggedinusers'));
    
        if (typeof storedData === 'object' && Object.keys(storedData).length > 0) {
            displayView('profileview');
        } else {
            displayView('welcomeview');
        }
    } else {
        displayView('welcomeview');
    }
    showPanel('home'); // TODO: keep track of open tab
});

function validateForm(formId) {
    var form = document.forms[formId];
    var isValid = true;

    var passwordField = form.querySelector('input[type="password"]');
    if(formId === "signup-form") {
        var repeatPasswordField = form.querySelector('input[name="repeat_password"]');
        if (passwordField.value !== repeatPasswordField.value) {
            //document.getElementById("signup-error").textContent = "Passwords do not match.";
            isValid = false;
        }
    }
    
    var minLength = 8;
    if (passwordField.value.length < minLength) {
        //var id = formId === "signup-form" ? "signup-error" : "login-error";
        //document.getElementById(id).textContent = "Password must be at least " + minLength + " characters long.";
        isValid = false;
    }

    return isValid;
}

function showPanel(panelId) {
    const panels = document.querySelectorAll('.panel');
    panels.forEach(panel => {
        panel.style.display = 'none';
    });

    const selectedPanel = document.getElementById(panelId + '-wrapper');
    if (selectedPanel) {
        selectedPanel.style.display = 'block';
    }
}

function changePasswordForm(event) {
    event.preventDefault();

    var currentPassword = document.getElementById("current-password").value;
    var newPassword = document.getElementById("new-password").value;
    var confirmPassword = document.getElementById("confirm-password").value;

    if (newPassword !== confirmPassword) {
        document.getElementById("change-password-error").textContent = "New password and confirm password do not match.";
        return;
    }

    var token = Object.keys(JSON.parse(localStorage.getItem("loggedinusers")))[0];
    var result = serverstub.changePassword(token, currentPassword, newPassword);

    if (!result.success) {
        document.getElementById("change-password-error").textContent = result.message;
    }
}

function logout() {
    var token = Object.keys(JSON.parse(localStorage.getItem("loggedinusers")))[0];
    const result = serverstub.signOut(token);

    if (!result.success) {
        document.getElementById("signout-error").textContent = result.message;
    } else {
        displayView('welcomeview');
    }
}