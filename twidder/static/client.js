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
      var mediaContent = document.createElement('div');

      div.setAttribute('draggable', true); // LAB4
      div.setAttribute('ondragstart', 'drag(event)');

      div.textContent = obj.message;

      obj.media.forEach(function(media) {
          if (media.media_type.startsWith('image/')) {
              var img = document.createElement('img');
              img.src = 'data:' + media.media_type + ';base64,' + media.media_data;
              img.style.maxWidth = '200px';
              mediaContent.appendChild(img);
          } else if (media.media_type.startsWith('audio/')) {
              var audio = document.createElement('audio');
              audio.src = 'data:' + media.media_type + ';base64,' + media.media_data;
              audio.controls = true;
              mediaContent.appendChild(audio);
          } else if (media.media_type.startsWith('video/')) {
              var video = document.createElement('video');
              video.src = 'data:' + media.media_type + ';base64,' + media.media_data;
              video.controls = true;
              video.style.maxWidth = '300px';
              mediaContent.appendChild(video);
          }
      });

      div.appendChild(mediaContent);
      postWrapper.appendChild(div);
  });
}

function updateOtherPosts(data) {
  var postWrapper = document.querySelector('.other-posts-wrapper');
  postWrapper.innerHTML = '';
      
  data.forEach(function(obj) {
      var div = document.createElement('div');
      var mediaContent = document.createElement('div');

      div.setAttribute('draggable', true); // LAB4
      div.setAttribute('ondragstart', 'drag(event)');

      div.textContent = obj.message;

      obj.media.forEach(function(media) {
          if (media.media_type.startsWith('image/')) {
              var img = document.createElement('img');
              img.src = 'data:' + media.media_type + ';base64,' + media.media_data;
              img.style.maxWidth = '200px';
              mediaContent.appendChild(img);
          } else if (media.media_type.startsWith('audio/')) {
              var audio = document.createElement('audio');
              audio.src = 'data:' + media.media_type + ';base64,' + media.media_data;
              audio.controls = true;
              mediaContent.appendChild(audio);
          } else if (media.media_type.startsWith('video/')) {
              var video = document.createElement('video');
              video.src = 'data:' + media.media_type + ';base64,' + media.media_data;
              video.controls = true;
              video.style.maxWidth = '300px';
              mediaContent.appendChild(video);
          }
      });

      div.appendChild(mediaContent);
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

  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      let res = JSON.parse(xhr.responseText);
      let token = xhr.getResponseHeader("Authorization");
      
      const rescodelookup = {
        201: {
          'created': 'The user was successfully created'
        },
        400: {
          'bad_request1': 'Field is missing',
          'bad_request2': 'Invalid email adress',
          'bad_request3': 'Password must be at least 8 characters'
        },
        409: {
          'user_exists': 'The user already exists'
        },
        405: {
          'not_allowed': 'You are not allowed to use this method for this request'
        },
        500: {
          'server_error': 'An error occurred during sign-up'
        }
      }
      
      if (res.success) {
        if(token) {
            localStorage.setItem("token", token);
            updateViews();
        }
        initSocket();
        document.getElementById("signup-error").textContent = rescodelookup[res.code][res.message];
      } else {
        document.getElementById("signup-error").textContent = rescodelookup[res.code][res.message];
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

      const rescodelookup = {
        200: {
          'ok': 'Signed in successfully'
        },
        400: {
          'bad_request': 'Missing username or password'
        },
        401: {
          'unauthorized': 'Invalid username or password'
        },
        405: {
          'not_allowed': 'You are not allowed to use this method for this request'
        },
        500: {
          'server_error': 'Internal server error'
        }
      }

      if (res.success) {
        if(token) {
            localStorage.setItem("token", token);
            localStorage.setItem("email", document.getElementById("email").value);
            showPanel('home');
            updateViews();
        }
        initSocket();
        document.getElementById("login-error").textContent = rescodelookup[res.code][res.message];
      } else {
        document.getElementById("login-error").textContent = rescodelookup[res.code][res.message];
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

  const { signature, timestamp } = generateSignature(dataObject, token);
  xhr.setRequestHeader("X-Signature", signature);
  xhr.setRequestHeader("X-Timestamp", timestamp);

  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      let res = JSON.parse(xhr.responseText);

      const rescodelookup = {
        200: {
          'ok': 'Password changed successfully'
        },
        400: {
          'bad_request1': 'Empty field',
          'bad_request2': 'User not found',
          'bad_request3': 'Password must be at least 8 characters'
        },
        401: {
          'unauthorized1': 'Invalid token',
          'unauthorized2': 'Incorrect old password'
        },
        405: {
          'not_allowed': 'You are not allowed to use this method for this request'
        },
        500: {
          'server_error': 'Internal server error'
        }
      }

      if (res.success) {
        document.getElementById("change-password-error").textContent = rescodelookup[res.code][res.message];
      } else {
        document.getElementById("change-password-error").textContent = rescodelookup[res.code][res.message];
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

      const rescodelookup = {
        200: {
          'ok': 'Signed out successfully'
        },
        400: {
          'bad_request': 'Field is missing'
        },
        401: {
          'unauthorized': 'Invalid token'
        },
        405: {
          'not_allowed': 'You are not allowed to use this method for this request'
        },
        500: {
          'server_error': 'Internal server error'
        }
      }

      if (res.success) {
        localStorage.removeItem("token");
        updateViews();
        if(socket.readyState == 1) {
          socket.close();
        }
      } else {
        document.getElementById("signout-error").textContent = rescodelookup[res.code][res.message];
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

      const rescodelookup = {
        200: {
          'ok': 'Loaded profile successfully'
        },
        401: {
          'unauthorized1': 'Invalid token',
          'unauthorized2': 'No user data found'
        },
        405: {
          'not_allowed': 'You are not allowed to use this method for this request'
        },
        500: {
          'server_error': 'Internal server error'
        }
      }

      if (res.success) {
        displayUserData(res.data);
      } else {
            document.getElementById("post-error").textContent = rescodelookup[res.code][res.message];
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

      const rescodelookup = {
        200: {
          'ok1': 'Loaded messages successfully',
          'ok2': 'No messages yet'
        },
        401: {
          'unauthorized': 'Invalid token'
        },
        405: {
          'not_allowed': 'You are not allowed to use this method for this request'
        },
        500: {
          'server_error': 'Internal server error'
        }
      }

      if (res.success) {
        updatePosts(res.data);
      } else {
        document.getElementById("post-error").textContent = rescodelookup[res.code][res.message];
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

      const rescodelookup = {
        200: {
          'ok1': 'Loaded messages successfully',
          'ok2': 'No messages yet'
        },
        401: {
          'unauthorized': 'Invalid token'
        },
        405: {
          'not_allowed': 'You are not allowed to use this method for this request'
        },
        500: {
          'server_error': 'Internal server error'
        }
      }

      if (res.success) {
        updateOtherPosts(res.data);
      } else {
        document.getElementById("search-error").textContent = rescodelookup[res.code][res.message];
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

      const rescodelookup = {
        200: {
          'ok': 'User was found'
        },
        401: {
          'unauthorized': 'Invalid token'
        },
        404: {
          'not_found': 'Email not found'
        },
        405: {
          'not_allowed': 'You are not allowed to use this method for this request'
        },
        500: {
          'server_error': 'Internal server error'
        }
      }

      if (res.success) {
        displayOtherUserData(res.data);
      } else {
        document.getElementById("search-error").textContent = rescodelookup[res.code][res.message];
      }
    }
  };

  xhr.send();
}

function postMessage(event) {
  event.preventDefault();

  const rescodelookup = {
    201: {
      'ok': 'Message sent successfully'
    },
    401: {
      'unauthorized': 'Invalid token'
    },
    400: {
      'bad_request1': 'Empty field',
      'bad_request2': 'Empty message',
      'bad_request3': 'Recipient email not found',
      'bad_request4': 'Invalid media format'
    },
    405: {
      'not_allowed': 'You are not allowed to use this method for this request'
    },
    500: {
      'server_error': 'Failed to store media'
    }
  }

  let content = document.getElementById('post-content').value;
  
  let mediaInput = document.getElementById('media-input');
  let file = mediaInput.files[0];
  let reader = new FileReader();

  reader.onload = function(e) {
    if (content) {
      let email = localStorage.getItem("email");
      let mediaType = file.type;

      let dataObject = {
          email: email,
          message: content,
          media: e.target.result,
          media_type: mediaType
      }

      let token = localStorage.getItem("token");
      let xhr = new XMLHttpRequest();
      xhr.open("POST", url + "/post_message", true);
      xhr.setRequestHeader("Authorization", token);
      xhr.setRequestHeader("Content-Type", "application/json");

      const { signature, timestamp } = generateSignature(dataObject, token);
      xhr.setRequestHeader("X-Signature", signature);
      xhr.setRequestHeader("X-Timestamp", timestamp);

      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
          let res = JSON.parse(xhr.responseText);
          if (res.success) {
              loadMessages();
          } else {
              document.getElementById("post-error").textContent = rescodelookup[res.code][res.message];
          }
        }
      };
      let req = JSON.stringify(dataObject);
      xhr.send(req);
    }
  }

  if (file) {
    reader.readAsDataURL(file);
  }
  else {
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

      const { signature, timestamp } = generateSignature(dataObject, token);
      xhr.setRequestHeader("X-Signature", signature);
      xhr.setRequestHeader("X-Timestamp", timestamp);

      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
          let res = JSON.parse(xhr.responseText);
          if (res.success) {
              loadMessages();
          } else {
              document.getElementById("post-error").textContent = rescodelookup[res.code][res.message];
          }
        }
      };
      let req = JSON.stringify(dataObject);
      xhr.send(req);
    }
  }
}

function postOthersMessage(event) {
  event.preventDefault();

  const rescodelookup = {
    201: {
      'ok': 'Message sent successfully'
    },
    401: {
      'unauthorized': 'Invalid token'
    },
    400: {
      'bad_request1': 'Empty field',
      'bad_request2': 'Empty message',
      'bad_request3': 'Recipient email not found',
      'bad_request4': 'Invalid media format'
    },
    405: {
      'not_allowed': 'You are not allowed to use this method for this request'
    },
    500: {
      'server_error': 'Failed to store media'
    }
  }

  let token = localStorage.getItem("token");
  let content = document.getElementById('other-post-content').value;

  let mediaInput = document.getElementById('other-media-input');
  let file = mediaInput.files[0];
  let reader = new FileReader();

  reader.onload = function(e) {
    if (content) {
      let email = document.getElementById('search-field').value;
      let mediaType = file.type;
      let dataObject = {
        email: email,
        message: content,
        media: e.target.result,
        media_type: mediaType
      }

      let xhr = new XMLHttpRequest();
      xhr.open("POST", url + "/post_message", true);
      xhr.setRequestHeader("Authorization", token);
      xhr.setRequestHeader("Content-Type", "application/json");

      const { signature, timestamp } = generateSignature(dataObject, token);
      xhr.setRequestHeader("X-Signature", signature);
      xhr.setRequestHeader("X-Timestamp", timestamp);

      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
          let res = JSON.parse(xhr.responseText);
          if (res.success) {
              loadOtherMessages();
          } else {
              document.getElementById("search-error").textContent = rescodelookup[res.code][res.message];
          }
        }
      };
      let req = JSON.stringify(dataObject);
      xhr.send(req);
    }
  }

  if (file) {
    reader.readAsDataURL(file);
  }
  else {
    if (content) {
      let email = document.getElementById('search-field').value;
      let dataObject = {
        email: email,
        message: content,
      }
  
      let xhr = new XMLHttpRequest();
      xhr.open("POST", url + "/post_message", true);
      xhr.setRequestHeader("Authorization", token);
      xhr.setRequestHeader("Content-Type", "application/json");
  
      const { signature, timestamp } = generateSignature(dataObject, token);
      xhr.setRequestHeader("X-Signature", signature);
      xhr.setRequestHeader("X-Timestamp", timestamp);
  
      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
          let res = JSON.parse(xhr.responseText);
          if (res.success) {
              loadOtherMessages();
          } else {
              document.getElementById("search-error").textContent = rescodelookup[res.code][res.message];
          }
        }
      };
      let req = JSON.stringify(dataObject);
      xhr.send(req);
    }
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

function generateSignature(dataObject, token) {
  const timestamp = new Date().toISOString();
  const dataWithPublicInfo = {...dataObject, timestamp};
  const serializedData = JSON.stringify(dataWithPublicInfo);
  
  const dataToSign = serializedData + token;
  const signature = CryptoJS.SHA256(dataToSign).toString(CryptoJS.enc.Hex);

  return { signature, timestamp };
}