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
                    "email": document.getElementById("email2").textContent,
                    "password": document.getElementById("password2").textContent,
                    "firstname": document.getElementById("first_name").textContent,
                    "familyname": document.getElementById("family_name").textContent,
                    "gender": "unknown",
                    "city": document.getElementById("city").textContent,
                    "country": document.getElementById("country").textContent,
                }
                var res = serverstub.signUp(dataObject);
                if(res.success) {
                    // TODO: Logged in, redirect
                }
                else {
                    document.getElementById("signup-error").textContent = res.message;
                }
            }
            else {
                var res = serverstub.signIn(document.getElementById("email").textContent, document.getElementById("password").textContent);
                if(res.success) {
                    // TODO: Logged in, redirect
                }
                else {
                    document.getElementById("login-error").textContent = res.message;
                }
            }
        }
    }
});

window.addEventListener('load', function () {
    displayView('welcomeview');
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