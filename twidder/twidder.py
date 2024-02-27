from flask import Flask, request, jsonify, render_template, session
import database_helper
import secrets
import hashlib


app = Flask(__name__)
app.secret_key = 'your_very_secret_key_here'


@app.route("/")
def index():
    user_logged_in = 'user_logged_in' in session
    return render_template('index.html', user_logged_in=user_logged_in)


def generate_token():
    return secrets.token_urlsafe(16)


def validate_user_credentials(email, password):
    user = database_helper.get_user_by_email(email)
    if user:
        hashed_password = hashlib.sha256(password.encode()).hexdigest()
        return user[1] == hashed_password
    return False


def validate_token(token):
    return database_helper.check_token(token)


@app.route('/sign-in', methods=['POST'])
def sign_in():
    email = request.json.get('email')
    password = request.json.get('password')

    if validate_user_credentials(email, password):
        token = generate_token()
        database_helper.create_token(email, token)
        session['user_logged_in'] = True
        return jsonify(success=True, message="Signed in successfully", data={'token': token})
    else:
        return jsonify(success=False, message="Invalid username or password"), 401


@app.route('/sign-up', methods=['POST'])
def sign_up():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    firstname = data.get('first_name')
    familyname = data.get('family_name')
    gender = "unknown"
    city = data.get('city')
    country = data.get('country')
    
    if not all([email, password, firstname, familyname, gender, city, country]):
        return jsonify(success=False, message="Missing fields"), 400

    if database_helper.user_exists(email):
        return jsonify(success=False, message="User already exists"), 409

    if len(password) < 8:
        return jsonify(success=False, message="Password must be at least 8 characters long"), 400

    hashed_password = hashlib.sha256(password.encode()).hexdigest()
    database_helper.create_user(email, hashed_password, firstname, familyname, gender, city, country)
    return jsonify(success=True, message="User created successfully")


@app.route('/sign-out', methods=['POST'])
def sign_out():
    token = request.headers.get('Authorization')

    if database_helper.remove_token(token):
        session.clear()
        return jsonify(success=True, message="Signed out successfully")
    else:
        return jsonify(success=False, message="Invalid token"), 401


@app.route('/change-password', methods=['POST'])
def change_password():
    token = request.headers.get('Authorization')
    data = request.json
    old_password = data.get('old_password')
    new_password = data.get('new_password')

    if not validate_token(token):
        return jsonify(success=False, message="Invalid token"), 401

    email = database_helper.get_email_by_token(token)
    if email is None:
        return jsonify(success=False, message="Invalid token"), 401

    user = database_helper.get_user_by_email(email)
    if not user:
        return jsonify(success=False, message="User not found"), 404

    old_password_hash = hashlib.sha256(old_password.encode()).hexdigest()
    if user[1] != old_password_hash:
        return jsonify(success=False, message="Incorrect old password"), 400
    
    new_password_hash = hashlib.sha256(new_password.encode()).hexdigest()
    
    database_helper.update_password(email, new_password_hash)
    return jsonify(success=True, message="Password changed successfully")


@app.route('/user-data-by-token', methods=['GET'])
def get_user_data_by_token():
    token = request.headers.get('Authorization')
    
    if not validate_token(token):
        return jsonify(success=False, message="Invalid token"), 401
    
    email = database_helper.get_email_by_token(token)
    if email is None:
        return jsonify(success=False, message="Invalid token"), 401

    user_data = database_helper.get_user_data(email)
    if user_data:
        return jsonify(success=True, data=dict(email=user_data[0], firstname=user_data[2], familyname=user_data[3], gender=user_data[4], city=user_data[5], country=user_data[6]))
    return jsonify(success=False, message="No user data found"), 404


@app.route('/user-data-by-email', methods=['GET'])
def get_user_data_by_email():
    token = request.headers.get('Authorization')
    email = request.args.get('email')
    
    if not validate_token(token):
        return jsonify(success=False, message="Invalid token"), 401

    user_data = database_helper.get_user_data(email)
    if user_data:
        return jsonify(success=True, data=dict(email=user_data[0], firstname=user_data[2], familyname=user_data[3], gender=user_data[4], city=user_data[5], country=user_data[6]))
    return jsonify(success=False, message="Email not found"), 404


@app.route('/user-messages-by-token', methods=['GET'])
def get_user_messages_by_token():
    token = request.headers.get('Authorization')

    if not validate_token(token):
        return jsonify(success=False, message="Invalid token"), 401
    
    email = database_helper.get_email_by_token(token)
    if email is None:
        return jsonify(success=False, message="Invalid token"), 401

    messages = database_helper.get_messages(email)
    if messages:
        return jsonify(success=True, data=[message[0] for message in messages])
    return jsonify(success=False, message="No messages found"), 404


@app.route('/user-messages-by-email', methods=['GET'])
def get_user_messages_by_email():
    token = request.headers.get('Authorization')
    email = request.args.get('email')

    if not validate_token(token):
        return jsonify(success=False, message="Invalid token"), 401
    
    messages = database_helper.get_messages(email)
    if messages:
        return jsonify(success=True, data=[message[0] for message in messages])
    return jsonify(success=False, message="No messages found"), 404


@app.route('/post-message', methods=['POST'])
def post_message():
    token = request.headers.get('Authorization')
    data = request.json
    message = data.get('message')
    recipient_email = data.get('email')
    
    if not validate_token(token):
        return jsonify(success=False, message="Invalid token"), 401

    sender_email = database_helper.get_email_by_token(token)
    if sender_email is None:
        return jsonify(success=False, message="Invalid token"), 401

    if not message:
        return jsonify(success=False, message="Empty message"), 400

    if not database_helper.user_exists(recipient_email):
        return jsonify(success=False, message="Recipient email not found"), 404

    database_helper.store_message(sender_email, message, recipient_email)
    return jsonify(success=True, message="Message sent successfully")

