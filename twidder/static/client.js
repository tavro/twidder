function updateViews() {
    const welcomeView = document.getElementById('welcomeview');
    const profileView = document.getElementById('profileview');

    if (localStorage.getItem("token")) {
        loadUser();
        welcomeView.style.display = 'none';
        profileView.style.display = 'block';
        initSocket();
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
    document.getElementById("search-content-wrapper").style.display = 'block';
}

function updatePosts(data) {
    var postWrapper = document.querySelector('.posts-wrapper');
    postWrapper.innerHTML = '';
        
    data.forEach(function(obj) {
        var div = document.createElement('div');

        div.setAttribute('draggable', true); // LAB4
        div.setAttribute('ondragstart', 'drag(event)');

        div.textContent = obj;
        postWrapper.appendChild(div);
    });
}

function updateOtherPosts(data) {
    var postWrapper = document.querySelector('.other-posts-wrapper');
    postWrapper.innerHTML = '';

    data.forEach(function(obj) {
        var div = document.createElement('div');

        div.setAttribute('draggable', true); // LAB4
        div.setAttribute('ondragstart', 'drag(event)');

        div.textContent = obj;
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

const base = "127.0.0.1:5000"
const url = "http://" + base;
const sock_url = "ws://" + base + "/sock";

let socket;
function socketLogout() {
  localStorage.removeItem("token");
  
  const welcomeView = document.getElementById('welcomeview');
  const profileView = document.getElementById('profileview');
  welcomeView.style.display = 'block';
  profileView.style.display = 'none';
  
  if (socket.readyState == 1) {
    socket.close();
  }
}

function initSocket() {
  if (!localStorage.getItem("token")) {
    return;
  }

  socket = new WebSocket(sock_url);
  socket.addEventListener("message", (ev) => {
    if (ev.data === "Log Out") {
      socketLogout();
    }
  });

  socket.onopen = (event) => {
    if (socket.readyState == 1) {
      socket.send(localStorage.getItem("token"));
    }
  };
}

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

  const hmacSignature = generateHMAC(dataObject);
  xhr.setRequestHeader("X-HMAC-Signature", hmacSignature);

  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      let res = JSON.parse(xhr.responseText);
      let token = xhr.getResponseHeader("Authorization");
      if (res.success) {
        if(token) {
            localStorage.setItem("token", token);
            updateViews();
        }
        initSocket(); // TODO: Check if working
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

  const hmacSignature = generateHMAC(dataObject);
  xhr.setRequestHeader("X-HMAC-Signature", hmacSignature);

  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      let res = JSON.parse(xhr.responseText);
      let token = res.data;
      if (res.success) {
        if(token) {
            localStorage.setItem("token", token);
            localStorage.setItem("email", document.getElementById("email").value);
            showPanel('home');
            updateViews();
        }
        initSocket(); // TODO: Check if working
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

  const hmacSignature = generateHMAC(dataObject);
  xhr.setRequestHeader("X-HMAC-Signature", hmacSignature);

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
        if(socket.readyState == 1) {
          socket.close();
        }
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

function searchUser(event) {
  event.preventDefault();

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

function postMessage(event) {
  event.preventDefault();

  let content = document.getElementById('post-content').value;
  if (content) {
    let email = localStorage.getItem("email");
    let dataObject = {
        email: email,
        message: content
    }

    let token = localStorage.getItem("token");
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url + "/post_message", true);
    xhr.setRequestHeader("Authorization", token);
    xhr.setRequestHeader("Content-Type", "application/json");

    const hmacSignature = generateHMAC(dataObject);
    xhr.setRequestHeader("X-HMAC-Signature", hmacSignature);

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

function postOthersMessage(event) {
  event.preventDefault();

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

    const hmacSignature = generateHMAC(dataObject);
    xhr.setRequestHeader("X-HMAC-Signature", hmacSignature);

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

/*

LAB4 below

*/

function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.textContent);
}

function drop(ev) {
  ev.preventDefault();
  var data = ev.dataTransfer.getData("text");
  ev.target.value += data;
}

const secretKey = "very_secret_key"
function generateHMAC(dataObject) {
  const message = JSON.stringify(dataObject);
  const signature = CryptoJS.HmacSHA256(message, secretKey);
  return signature.toString(CryptoJS.enc.Hex);
}