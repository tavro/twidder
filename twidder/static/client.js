function updateViews() {
    const welcomeView = document.getElementById('welcomeview');
    const profileView = document.getElementById('profileview');

    if (localStorage.getItem("token")) {
        loadUser();
        welcomeView.style.display = 'none';
        profileView.style.display = 'block';
    } else {
        welcomeView.style.display = 'block';
        profileView.style.display = 'none';
    }
}

window.onload = function () {
    updateViews();
};

function displayUserData(data) {
    document.getElementById("user-info-fname").textContent = data.firstname;
    document.getElementById("user-info-lname").textContent = data.familyname;
    document.getElementById("user-info-city").textContent = data.city + ", ";
    document.getElementById("user-info-country").textContent = data.country;
    document.getElementById("user-info-mail").textContent = "(" + data.email + ")";
}

function displayOtherUserData(data) {
    document.getElementById("other-user-info-fname").textContent = data.firstname;
    document.getElementById("other-user-info-lname").textContent = data.familyname;
    document.getElementById("other-user-info-city").textContent = data.city + ", ";
    document.getElementById("other-user-info-country").textContent = data.country;
    document.getElementById("other-user-info-mail").textContent = "(" + data.email + ")";
}

function updatePosts(data) {
    var postWrapper = document.querySelector('.posts-wrapper');
    postWrapper.innerHTML = '';
        
    data.forEach(function(obj) {
        var div = document.createElement('div');
        div.textContent = obj.message;
        postWrapper.appendChild(div);
    });
}

function updateOtherPosts(data) {
    var postWrapper = document.querySelector('.other-posts-wrapper');
    postWrapper.innerHTML = '';

    data.forEach(function(obj) {
        var div = document.createElement('div');
        div.textContent = obj.message;
        postWrapper.appendChild(div);
    });
}

function showPanel(panelId) {
    const panels = document.querySelectorAll('.panel');
    panels.forEach(panel => {
        panel.style.display = 'none';
    });

    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.classList.remove("active");
    });

    if(document.getElementById(panelId)) {
        document.getElementById(panelId).classList.add('active')
    }

    const selectedPanel = document.getElementById(panelId + '-wrapper');
    if (selectedPanel) {
        selectedPanel.style.display = 'block';
    }
}

const url = "http://127.0.0.1:5000";

function register(event) {
  event.preventDefault();

  let dataObject = {
    email: document.getElementById("email2").value,
    password: document.getElementById("password2").value,
    firstname: document.getElementById("first_name").value,
    familyname: document.getElementById("family_name").value,
    gender: "unknown",
    city: document.getElementById("city").value,
    country: document.getElementById("country").value,
  };

  let xhr = new XMLHttpRequest();
  xhr.open("POST", url + "/sign_up", true);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      let res = JSON.parse(xhr.responseText);
      let token = xhr.getResponseHeader("Authorization");
      if (res.success) {
        if(token) {
            localStorage.setItem("token", token);
            updateViews();
        }
        document.getElementById("signup-error").textContent = res.message;
      } else {
        document.getElementById("signup-error").textContent = res.message;
      }
    }
  };

  let req = JSON.stringify(dataObject);
  xhr.send(req);
}

function login(event) {
  event.preventDefault();

  let dataObject = {
    username: document.getElementById("email").value,
    password: document.getElementById("password").value,
  };

  let xhr = new XMLHttpRequest();
  xhr.open("POST", url + "/sign_in", true);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      let res = JSON.parse(xhr.responseText);
      let token = res.data;
      if (res.success) {
        if(token) {
            localStorage.setItem("token", token);
            localStorage.setItem("email", document.getElementById("email").value);
            updateViews();
        }
        document.getElementById("login-error").textContent = res.message;
      } else {
        document.getElementById("login-error").textContent = res.message;
      }
    }
  };

  let req = JSON.stringify(dataObject);
  xhr.send(req);
}

function changePassword(event) {
  event.preventDefault();

  let token = localStorage.getItem("token");

  let dataObject = {
    oldpassword: document.getElementById("current-password").value,
    newpassword: document.getElementById("new-password").value
  }

  let xhr = new XMLHttpRequest();
  xhr.open("PUT", url + "/change_password", true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("Authorization", token);

  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      let res = JSON.parse(xhr.responseText);
      if (res.success) {
        document.getElementById("change-password-error").textContent = res.message;
      } else {
        document.getElementById("change-password-error").textContent = res.message;
      }
    }
  };

  let req = JSON.stringify(dataObject);
  xhr.send(req);
}

function logout() {
  let xhr = new XMLHttpRequest();
  xhr.open("DELETE", url + "/sign_out", true);
  let token = localStorage.getItem("token");
  xhr.setRequestHeader("Authorization", token);

  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      let res = JSON.parse(xhr.responseText);
      if (res.success) {
        localStorage.removeItem("token");
        updateViews();
      } else {
        document.getElementById("signout-error").textContent = res.message;
      }
    }
  };

  xhr.send();
}

function loadUser() {
  let token = localStorage.getItem("token");

  let xhr = new XMLHttpRequest();
  xhr.open("GET", url + "/get_user_data_by_token", true);
  xhr.setRequestHeader("Authorization", token);

  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      let res = JSON.parse(xhr.responseText);
      if (res.success) {
        displayUserData(res.data);
      } else {
            document.getElementById("post-error").textContent = res.message;
      }
    }
  };

  xhr.send();
}

function loadMessages() {
  let token = localStorage.getItem("token");

  let xhr = new XMLHttpRequest();
  xhr.open("GET", url + "/get_user_messages_by_token", true);
  xhr.setRequestHeader("Authorization", token);

  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      let res = JSON.parse(xhr.responseText);
      if (res.success) {
        updatePosts(res.data);
      } else {
            document.getElementById("post-error").textContent = res.message;
      }
    }
  };

  xhr.send();
}

function loadOtherMessages() {
  let token = localStorage.getItem("token");
  let email = document.getElementById('search-field').value;

  let xhr = new XMLHttpRequest();
  xhr.open("GET", url + "/get_user_messages_by_email/" + email, true);
  xhr.setRequestHeader("Authorization", token);

  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      let res = JSON.parse(xhr.responseText);
      if (res.success) {
        updateOtherPosts(res.data);
      } else {
            document.getElementById("search-error").textContent = res.message;
      }
    }
  };
  xhr.send();
}

function search() {
  let token = localStorage.getItem("token");
  let email = document.getElementById('search-field').value;

  let xhr = new XMLHttpRequest();
  xhr.open("GET", url + "/get_user_data_by_email/" + email, true);
  xhr.setRequestHeader("Authorization", token);

  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      let res = JSON.parse(xhr.responseText);
      if (res.success) {
        displayOtherUserData(res.data);
      } else {
        document.getElementById("search-error").textContent = res.message;
      }
    }
  };

  xhr.send();
}

function postMessage() {
  let content = document.getElementById('post-content').value;
  if (content) {
    let email = localStorage.getItem("email");
    let dataObject = {
        email: email,
        message, content
    }

    let token = localStorage.getItem("token");
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url + "/post_message", true);
    xhr.setRequestHeader("Authorization", token);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        let res = JSON.parse(xhr.responseText);
        if (res.success) {
            loadMessages();
        } else {
            document.getElementById("post-error").textContent = res.message;
        }
      }
    };
    let req = JSON.stringify(dataObject);
    xhr.send(req);
  }
}

function postOthersMessage() {
  let token = localStorage.getItem("token");
  let content = document.getElementById('other-post-content').value;

  if (content) {
    let email = document.getElementById('search-field').value;
    let dataObject = {
      email: email,
      message: content
    }

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url + "/post_message", true);
    xhr.setRequestHeader("Authorization", token);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        let res = JSON.parse(xhr.responseText);
        if (res.success) {
            loadOtherMessages();
        } else {
            document.getElementById("search-error").textContent = res.message;
        }
      }
    };
    let req = JSON.stringify(dataObject);
    xhr.send(req);
  }
}