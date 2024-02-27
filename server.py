from flask import Flask, request, jsonify, render_template, session
import database_helper
import secrets
import hashlib
import re


app = Flask(__name__)
app.secret_key = 'your_very_secret_key_here'


def make_res(status, msg, data="-"):
    return jsonify(success=status, message=msg, data=data)


@app.route("/")
def index():
    user_logged_in = 'user_logged_in' in session
    return render_template('index.html', user_logged_in=user_logged_in)


def generate_token():
    return secrets.token_urlsafe(16)


def validate_user_credentials(email, password):
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
    if token is None:
        return False
    return database_helper.check_token(token)


@app.route("/sign_in", methods=["POST"])
def sign_in():
    email = request.get_json().get('username')
    password = request.get_json().get('password')

    if validate_user_credentials(email, password):
        token = generate_token()
        return make_res(True, "Signed in successfully", token)
    else:
        return make_res(False, "Invalid username or password")


@app.route('/sign_up', methods=['POST'])
def sign_up():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")
    firstname = data.get("firstname")
    familyname = data.get("familyname")
    gender = data.get("gender")
    city = data.get("city")
    country = data.get("country")
    
    if any(field is None or field == "" for field in [email, password, firstname, familyname, gender, city, country]):
        return make_res(False, f"Missing field")

    email_pattern = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
    if not bool(email_pattern.match(email)):
        return make_res(False, "Invalid email format")

    if database_helper.user_exists(email):
        return make_res(False, "User already exists")

    if len(password) < 8:
        return make_res(False, "Password must be at least 8 characters long")

    hashed_password = hashlib.sha256(password.encode()).hexdigest()
    if database_helper.create_user(email, hashed_password, data['firstname'], data['familyname'], data['gender'], data['city'], data['country']):
        return make_res(True, "User created successfully")
    else:
        return make_res(False, "An error occurred during sign-up")


@app.route('/sign_out', methods=['DELETE'])
def sign_out():
    token = request.headers.get('Authorization')
    if not validate_token(token):
        return make_res(False, "Invalid token")

    if database_helper.remove_token(token):
        session.clear()
        return make_res(True, "Signed out successfully")
    else:
        return make_res(False, "Invalid token")


@app.route('/change_password', methods=['PUT'])
def change_password():
    token = request.headers.get('Authorization')

    old_password = request.get_json().get('oldpassword')
    new_password = request.get_json().get('newpassword')

    if any(field is None or field == "" for field in [old_password, new_password]):
        return make_res(False, "Empty field")

    if not validate_token(token):
        return make_res(False, "Invalid token")

    email = database_helper.get_email_by_token(token)
    if email is None:
        return make_res(False, "Invalid token")

    user = database_helper.get_user_by_email(email)
    if not user:
        return make_res(False, "User not found")

    old_password_hash = hashlib.sha256(old_password.encode()).hexdigest()
    if user[1] != old_password_hash:
        return make_res(False, "Incorrect old password")
    
    if len(new_password) < 8:
        return make_res(False, "Password must be at least 8 chars")

    new_password_hash = hashlib.sha256(new_password.encode()).hexdigest()
    
    database_helper.update_password(email, new_password_hash)
    return make_res(True, "Password changed successfully")


@app.route('/get_user_data_by_token', methods=['GET'])
def get_user_data_by_token():
    token = request.headers.get('Authorization')
    
    if not validate_token(token):
        return make_res(False, "Invalid token")
    
    email = database_helper.get_email_by_token(token)
    if email is None:
        return make_res(False, "Invalid token")

    user_data = database_helper.get_user_data(email)
    if user_data:
        return make_res(True, "Success", dict(email=user_data[0], firstname=user_data[2], familyname=user_data[3], gender=user_data[4], city=user_data[5], country=user_data[6]))
    return make_res(False, "No user data found")


@app.route('/get_user_data_by_email/<email>', methods=['GET'])
def get_user_data_by_email(email):
    token = request.headers.get('Authorization')
    
    if not validate_token(token):
        return make_res(False, "Invalid token")

    user_data = database_helper.get_user_data(email)
    if user_data:
        return make_res(True, "Success", dict(email=user_data[0], firstname=user_data[2], familyname=user_data[3], gender=user_data[4], city=user_data[5], country=user_data[6]))
    return make_res(False, "Email not found")


@app.route('/get_user_messages_by_token', methods=['GET'])
def get_user_messages_by_token():
    token = request.headers.get('Authorization')

    if not validate_token(token):
        return make_res(False, "Invalid token")
    
    email = database_helper.get_email_by_token(token)
    if email is None:
        return make_res(False, "Invalid token")

    messages = database_helper.get_messages(email)
    if messages:
        return make_res(True, "Success", messages)
    
    return make_res(False, "No messages found")


@app.route('/get_user_messages_by_email/<email>', methods=['GET'])
def get_user_messages_by_email(email):
    token = request.headers.get('Authorization')
    
    if not validate_token(token):
        return make_res(False, "Invalid token")
    
    messages = database_helper.get_messages(email)
    if messages:
        return make_res(True, "Success", messages)

    return make_res(False, "No messages found")


@app.route('/post_message', methods=['POST'])
def post_message():
    token = request.headers.get('Authorization')

    message = request.get_json().get('message')
    recipient_email = request.get_json().get('email')
    
    if message is None or message == "" or recipient_email is None or recipient_email == "":
        return make_res(False, "Empty field")

    if not validate_token(token):
        return make_res(False, "Invalid token")

    sender_email = database_helper.get_email_by_token(token)
    if sender_email is None:
        return make_res(False, "Invalid token")

    if not message:
        return make_res(False, "Empty message")

    if not database_helper.user_exists(recipient_email):
        return make_res(False, "Recipient email not found")

    database_helper.store_message(sender_email, message, recipient_email)
    return make_res(True, "Message sent successfully")

