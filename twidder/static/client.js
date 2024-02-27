function displayView(viewId) {
    var viewContent = document.getElementById(viewId).innerHTML;
    document.body.innerHTML = viewContent;
}

function fetchWithAuth(url, method, body) {
    const token = localStorage.getItem("token");
    return fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token || ''
        },
        body: JSON.stringify(body)
    }).then(response => response.json());
}

function signIn(email, password) {
    fetch('/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password })
    }).then(response => response.json())
    .then(data => {
        if(data.success) {
            localStorage.setItem("token", data.data.token);
            displayView('profileview');
        } else {
            document.getElementById("login-error").textContent = data.message;
        }
    });
}

function signUp(formData) {
    console.log("Posting to URL:", '/sign-up');
    fetch('/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    }).then(response => response.json())
    .then(data => {
        if(data.success) {
            signIn(formData.email, formData.password);
        } else {
            document.getElementById("signup-error").textContent = data.message;
        }
    });
}

function postMessage(message, recipientEmail) {
    fetchWithAuth('/post-message', 'POST', { message: message, email: recipientEmail })
    .then(data => {
        if(data.success) {
            // TODO: Update UI
        } else {
            // TODO: Handle error
        }
    });
}

function loadUserData() {
    fetchWithAuth('/user-data-by-token', 'GET')
    .then(data => {
        if(data.success) {
            // TODO: Update UI
        } else {
            // TODO: Handle error
        }
    });
}

function getUserDataByEmail(email) {
    const encodedEmail = encodeURIComponent(email);
    const url = `/user-data-by-email?email=${encodedEmail}`;

    fetchWithAuth(url, 'GET')
    .then(data => {
        if (data.success) {
            // TODO: Update UI
        } else {
            // TODO: Handle error
        }
    });
}

function signOut() {
    fetchWithAuth('/sign-out', 'POST')
    .then(data => {
        if(data.success) {
            localStorage.removeItem("token");
            displayView('welcomeview');
        } else {
            // TODO: Handle error
        }
    });
}

// TODO: Improve
function updateUserUI(other, data) {
    if(other) {
        document.getElementById("other-user-info-fname").textContent = data.firstname;
        document.getElementById("other-user-info-lname").textContent = data.familyname;
        document.getElementById("other-user-info-city").textContent = data.city + ", ";
        document.getElementById("other-user-info-country").textContent = data.country;
        document.getElementById("other-user-info-mail").textContent = "(" + data.email + ")";
    }
    else {
        document.getElementById("user-info-fname").textContent = data.firstname;
        document.getElementById("user-info-lname").textContent = data.familyname;
        document.getElementById("user-info-city").textContent = data.city + ", ";
        document.getElementById("user-info-country").textContent = data.country;
        document.getElementById("user-info-mail").textContent = "(" + data.email + ")";
    }
}

// TODO: Improve
function updatePostsUI(other, data) {
    if(other) {
        var postWrapper = document.querySelector('.other-posts-wrapper');
        postWrapper.innerHTML = '';
        
        data.messages.forEach(function(message) {
            var div = document.createElement('div');
            div.textContent = message.content;
            postWrapper.appendChild(div);
        });
    }
    else {
        var postWrapper = document.querySelector('.posts-wrapper');
        postWrapper.innerHTML = '';
        
        data.messages.forEach(function(message) {
            var div = document.createElement('div');
            div.textContent = message.content;
            postWrapper.appendChild(div);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        signIn(email, password);
    });

    document.getElementById('signup-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = {
            email: document.getElementById("email2").value,
            password: document.getElementById("password2").value,
            firstname: document.getElementById("first_name").value,
            familyname: document.getElementById("family_name").value,
            gender: "unkown",
            city: document.getElementById("city").value,
            country: document.getElementById("country").value,
        };
        signUp(formData);
    });

    document.getElementById('post-form')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const message = document.getElementById("post-content").value;
        const recipientEmail = ''; // TODO: get the recipients email
        postMessage(message, recipientEmail);
    });

    document.getElementById('other-post-form')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const message = document.getElementById("other-post-content").value;
        const recipientEmail = ''; // TODO: get the recipients email
        postMessage(message, recipientEmail);
    });

    document.getElementById('logout-btn')?.addEventListener('click', function(e) {
        signOut();
    });

    // TODO: Update this
    const changePasswordForm = document.getElementById('change-password-form');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const currentPassword = this.querySelector("#current-password").value;
            const newPassword = this.querySelector("#new-password").value;
            const confirmPassword = this.querySelector("#confirm-password").value;
            if (newPassword === confirmPassword) {
                changePassword(currentPassword, newPassword);
            } else {
                // TODO: Handle error
            }
        });
    }

    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const email = document.getElementById('search-field').value;
            if (email) {
                getUserDataByEmail(email);
                // TODO: Update UI
            } else {
                // TODO: Handle
            }
        });
    }

});

window.addEventListener('load', function() {
    if(localStorage.getItem("token")) {
        displayView('profileview');
        loadUserData();
    } else {
        displayView('welcomeview');
    }
});

function showPanel(panelId) {
    const panels = document.querySelectorAll('.panel');
    panels.forEach(panel => {
        panel.style.display = 'none';
    });

    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.classList.remove("active");
    });
    document.getElementById(panelId).classList.add('active')

    const selectedPanel = document.getElementById(panelId + '-wrapper');
    if (selectedPanel) {
        selectedPanel.style.display = 'block';
    }
}