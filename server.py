from flask import Flask, request, jsonify
import secrets

app = Flask(__name__)


@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"


def validate_user_credentials(username, password):
    return True # TODO


def validate_token(token):
    return True # TODO


@app.route('/sign-in', methods=['POST'])
def sign_in():
    username = request.json.get('username')
    password = request.json.get('password')

    if validate_user_credentials(username, password):
        token = secrets.token_urlsafe(16)
        return jsonify(success=True, message="Signed in successfully", data={'token': token})
    else:
        return jsonify(success=False, message="Invalid username or password"), 401


@app.route('/sign-up', methods=['POST'])
def sign_up():
    data = request.json
    email = data.get('Email')
    password = data.get('Password')
    firstname = data.get('Firstname')
    familyname = data.get('Familyname')
    gender = data.get('Gender')
    city = data.get('City')
    country = data.get('Country')
    
    if not all([email, password, firstname, familyname, gender, city, country]):
        return jsonify(success=False, message="Missing fields"), 400

    # if database_helper.user_exists(email):
    #    return jsonify(success=False, message="User already exists"), 409

    # database_helper.create_user(email, password, firstname, familyname, gender, city, country)
    return jsonify(success=True, message="User created successfully")


@app.route('/sign-out', methods=['POST'])
def sign_out():
    token = request.headers.get('Authorization')

    if not validate_token(token):
        return jsonify(success=False, message="Invalid token"), 401
    
    # database_helper.remove_token(token)
    return jsonify(success=True, message="Signed out successfully")


@app.route('/change-password', methods=['POST'])
def change_password():
    token = request.headers.get('Authorization')
    data = request.json
    old_password = data.get('old_password')
    new_password = data.get('new_password')

    if not validate_token(token):
        return jsonify(success=False, message="Invalid token"), 401
    
    # TODO:
    # Handle incorrect old password and invalid new password
    
    # database_helper.update_password(token, new_password)
    return jsonify(success=True, message="Password changed successfully")


@app.route('/user-data-by-token', methods=['GET'])
def get_user_data_by_token():
    token = request.headers.get('Authorization')
    
    if not validate_token(token):
        return jsonify(success=False, message="Invalid token"), 401
    
    # TODO:
    # Return data: Email, First name, family name, gender, city, country
    
    return jsonify(success=False, message="No user data found"), 404


@app.route('/user-data-by-email', methods=['GET'])
def get_user_data_by_email():
    token = request.headers.get('Authorization')
    email = request.args.get('email')
    
    if not validate_token(token):
        return jsonify(success=False, message="Invalid token"), 401
    
    # TODO:
    # Return data: Email, First name, family name, gender, city, country
    # Handle email not found
    pass


@app.route('/user-messages-by-token', methods=['GET'])
def get_user_messages_by_token():
    token = request.headers.get('Authorization')

    if not validate_token(token):
        return jsonify(success=False, message="Invalid token"), 401
    
    # TODO:
    # Return all messages connected to user as an array
    pass


@app.route('/user-messages-by-email', methods=['GET'])
def get_user_messages_by_email():
    token = request.headers.get('Authorization')
    email = request.args.get('email')

    if not validate_token(token):
        return jsonify(success=False, message="Invalid token"), 401
    
    # TODO:
    # Return all messages connected to user as an array
    # Handle incorrect token or email not found
    pass


@app.route('/post-message', methods=['POST'])
def post_message():
    token = request.headers.get('Authorization')
    data = request.json
    message = data.get('message')
    recipient_email = data.get('email')
    
    if not validate_token(token):
        return jsonify(success=False, message="Invalid token"), 401

    if not message:
        return jsonify(success=False, message="Empty message"), 400

    # TODO: 
    # Input: Token, message, email to the recipient
    # Handle email not found
    
    # database_helper.store_message(token, message, recipient_email)
    return jsonify(success=True, message="Message sent successfully")

