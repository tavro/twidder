from flask import Flask, request, jsonify, render_template, session
from flask_sock import Sock

from Crypto.Hash import SHA256

from datetime import datetime, timedelta

import base64
import json

import database_helper
import secrets
import hashlib
import re


app = Flask(__name__)
app.secret_key = 'your_very_secret_key_here'

sock = Sock(app)
socks = {}


@sock.route("/sock")
def check_logout(sock):
    '''
    WebSocket route to handle user logout events. Listens for tokens from connected clients and
    associates them with their WebSocket connection to manage session state.
    '''
    while True:
        token = sock.receive()
        if database_helper.check_token(token):
            socks[token] = sock


def verify_signature(request, token):
    '''
    Verifies the signature of a request to ensure it was not tampered with. Uses SHA256 for hashing.
    '''
    dataObject = request.get_json()
    received_signature = request.headers.get('X-Signature')
    timestamp = request.headers.get('X-Timestamp')

    timestamp_datetime = datetime.fromisoformat(timestamp)
    if datetime.utcnow() - timedelta(minutes=2) <= timestamp_datetime <= datetime.utcnow() + timedelta(minutes=2):
        dataWithPublicInfo = {**dataObject, "timestamp": timestamp}
        serializedData = json.dumps(dataWithPublicInfo, separators=(',', ':'), sort_keys=True)
        dataToSign = serializedData + token
        
        expected_signature = SHA256.new(dataToSign.encode()).hexdigest()
        
        if expected_signature == received_signature:
            return True
        else:
            return False
    else:
        return False


def make_res(status, rescode, msg, data="-"):
    '''
    Helper function to create a JSON response with a standard format.
    '''
    return jsonify(success=status, code=rescode, message=msg, data=data)


@app.route("/")
def index():
    '''
    Route to display the index page.
    '''
    user_logged_in = 'user_logged_in' in session
    return render_template('index.html', user_logged_in=user_logged_in)


def generate_token():
    '''
    Generates a secure token using the secrets library.
    '''
    return secrets.token_urlsafe(16)


def validate_user_credentials(email, password):
    '''
    Validates user credentials by checking if the provided email and password match those stored in the database.
    '''
    if email is None:
        return False
    if password is None:
        return False
    
    user = database_helper.get_user_by_email(email)
    if user:
        hashed_password = hashlib.sha256(password.encode()).hexdigest()
        return user[1] == hashed_password
    return False


def validate_token(token):
    '''
    Validates a given token by checking if it exists in the database.
    '''
    if token is None:
        return False
    return database_helper.check_token(token)


@app.route("/sign_in", methods=["POST"])
def sign_in():
    '''
    Route to sign in a user. Validates the user's credentials and, if valid, generates and returns a new token.
    '''
    email = request.get_json().get('username')
    password = request.get_json().get('password')

    if not email or not password:
        return make_res(False, 400, "bad_request")

    if validate_user_credentials(email, password):
        prev_token = database_helper.get_token_by_email(email)
        if prev_token:
            database_helper.remove_token(prev_token)

        if socks.get(prev_token):
            socks[prev_token].send("Log Out")
            socks.pop(prev_token)
        
        token = generate_token()
        database_helper.create_token(email, token)
        return make_res(True, 200, "ok", token)
    else:
        return make_res(False, 401, "unauthorized")


@app.route('/sign_up', methods=['POST'])
def sign_up():
    '''
    Route to sign up a new user. Validates the provided user information and creates a new user in the database if valid.
    '''
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")
    firstname = data.get("firstname")
    familyname = data.get("familyname")
    gender = data.get("gender")
    city = data.get("city")
    country = data.get("country")
    
    if any(field is None or field == "" for field in [email, password, firstname, familyname, gender, city, country]):
        return make_res(False, 400, f"bad_request1")

    email_pattern = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
    if not bool(email_pattern.match(email)):
        return make_res(False, 400, "bad_request2")

    if database_helper.user_exists(email):
        return make_res(False, 409, "user_exists")

    if len(password) < 8:
        return make_res(False, 400, "bad_request3")

    hashed_password = hashlib.sha256(password.encode()).hexdigest()
    if database_helper.create_user(email, hashed_password, data['firstname'], data['familyname'], data['gender'], data['city'], data['country']):
        return make_res(True, 201, "created")
    else:
        return make_res(False, 500, "server_error")


@app.route('/sign_out', methods=['DELETE'])
def sign_out():
    '''
    Route to sign out a user. Validates the user's token and clears their session.
    '''
    token = request.headers.get('Authorization')
    if not validate_token(token):
        return make_res(False, 401, "unauthorized")

    if socks.get(token):
        socks.pop(token)

    if database_helper.remove_token(token):
        session.clear()
        return make_res(True, 200, "ok")
    else:
        return make_res(False, 401, "unauthorized")


@app.route('/change_password', methods=['PUT'])
def change_password():
    '''
    Route to change a user's password. Validates the user's token and old password before updating to the new password.
    '''
    token = request.headers.get('Authorization')

    if not verify_signature(request, token):
        return make_res(False, 403, "Invalid HMAC signature")
    
    old_password = request.get_json().get('oldpassword')
    new_password = request.get_json().get('newpassword')

    if any(field is None or field == "" for field in [old_password, new_password]):
        return make_res(False, 400, "bad_request1")

    if not validate_token(token):
        return make_res(False, 401, "unauthorized1")

    email = database_helper.get_email_by_token(token)
    if email is None:
        return make_res(False, 401, "unauthorized1")

    user = database_helper.get_user_by_email(email)
    if not user:
        return make_res(False, 400, "bad_request2")

    old_password_hash = hashlib.sha256(old_password.encode()).hexdigest()
    if user[1] != old_password_hash:
        return make_res(False, 401, "unauthorized2")
    
    if len(new_password) < 8:
        return make_res(False, 400, "bad_request3")

    new_password_hash = hashlib.sha256(new_password.encode()).hexdigest()
    
    database_helper.update_password(email, new_password_hash)
    return make_res(True, 200, "ok")


@app.route('/get_user_data_by_token', methods=['GET'])
def get_user_data_by_token():
    '''
    Route to get user data based on the provided token.
    '''
    token = request.headers.get('Authorization')
    
    if not validate_token(token):
        return make_res(False, 401, "unauthorized1")
    
    email = database_helper.get_email_by_token(token)
    if email is None:
        return make_res(False, 401, "unauthorized1")

    user_data = database_helper.get_user_data(email)
    if user_data:
        return make_res(True, 200, "ok", dict(email=user_data[0], firstname=user_data[2], familyname=user_data[3], gender=user_data[4], city=user_data[5], country=user_data[6]))
    return make_res(False, 401, "unauthorized2")


@app.route('/get_user_data_by_email/<email>', methods=['GET'])
def get_user_data_by_email(email):
    '''
    Route to get user data based on the provided email.
    '''
    token = request.headers.get('Authorization')
    
    if not validate_token(token):
        return make_res(False, 401, "unauthorized")

    user_data = database_helper.get_user_data(email)
    if user_data:
        return make_res(True, 200, "ok", dict(email=user_data[0], firstname=user_data[2], familyname=user_data[3], gender=user_data[4], city=user_data[5], country=user_data[6]))
    return make_res(False, 404, "not_found")


@app.route('/get_user_messages_by_token', methods=['GET'])
def get_user_messages_by_token():
    '''
    Route to get messages for the user identified by the provided token.
    '''
    token = request.headers.get('Authorization')

    if not validate_token(token):
        return make_res(False, 401, "unauthorized")
    
    email = database_helper.get_email_by_token(token)
    if email is None:
        return make_res(False, 401, "unauthorized")

    messages = database_helper.get_messages(email)
    if messages:
        return make_res(True, 200, "ok1", messages)
    
    return make_res(False, 200, "ok2", [])


@app.route('/get_user_messages_by_email/<email>', methods=['GET'])
def get_user_messages_by_email(email):
    '''
    Route to get messages for the user identified by the provided email.
    '''
    token = request.headers.get('Authorization')
    
    if not validate_token(token):
        return make_res(False, 401, "unauthorized")
    
    messages = database_helper.get_messages(email)
    if messages:
        return make_res(True, 200, "ok1", messages)

    return make_res(False, 200, "ok2", [])


@app.route('/post_message', methods=['POST'])
def post_message():
    '''
    Route to post a message. Validates the user's token and stores the message if valid.
    '''
    token = request.headers.get('Authorization')

    if not verify_signature(request, token):
        return make_res(False, 403, "Invalid HMAC signature")
    
    message = request.get_json().get('message')
    recipient_email = request.get_json().get('email')
    
    if message is None or message == "" or recipient_email is None or recipient_email == "":
        return make_res(False, 400, "bad_request1")

    if not validate_token(token):
        return make_res(False, 401, "unauthorized")

    sender_email = database_helper.get_email_by_token(token)
    if sender_email is None:
        return make_res(False, 401, "unauthorized")

    if not message:
        return make_res(False, 400, "bad_request2")

    if not database_helper.user_exists(recipient_email):
        return make_res(False, 400, "bad_request3")

    message_id = database_helper.store_message(sender_email, message, recipient_email)

    # LAB4 stuff
    data = request.get_json()
    media_base64 = data.get('media')
    media_type = data.get('media_type')

    if media_base64 and media_type:
        base64_data = media_base64.split(",")[-1]
        
        try:
            media_data = base64.b64decode(base64_data)
            success = database_helper.add_media_to_message(message_id, media_type, media_data)
            if not success:
                return make_res(False, 500, "server_error")
        except base64.binascii.Error as error:
            return make_res(False, 400, "bad_request4")

    return make_res(True, 201, "ok")

