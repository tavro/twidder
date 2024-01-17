# Lab 1

## Requirements

### Functional

- [x] The user shall be able to sign up, sign in and sign out.
- [x] The user shall be able to view his/her own personal information provided during sign-up, everything excluding the password, once signed in.
- [x] The user shall own a message wall which other users and himself/herself can post messages on it
- [x] The user shall be able to refresh his/her own wall to check for any newly posted messages, without refreshing the rest of content. In other words, the browser's refresh button shall not be used.
- [x] The user shall be able to view another user's personal information, everything excluding their password, and message wall by providing his/her email address.
- [x] The user shall be able to post a message on another user's message wall.
- [x] The user shall be able to refresh another user's message wall to see the newly posted messages, without refreshing the rest of the content.
- [x] The user shall be able to change his/her password while being signed-in.

### Non-Functional

- [x] Once the application is opened for the first time, it will not require to refresh itself during its lifetime. Such applications are called Single Page Applications or SPAs. For more information please check out section: Application Structure.
- [x] Using “window.alert()” or similar types of window based inputs/outputs is NOT allowed
- [ ] The HTML code shall validate in https://validator.w3.org/ . The HTML code in the script elements which represent different views shall be validated separately by copying and pasting the code inside the validator.
- [ ] The CSS code shall validate in https://jigsaw.w3.org/css-validator/
- [x] It is not allowed to use JQuery.

# Lab 2

## Requirements

### Functional

- [ ] All server functions specified in the lab instructions shall work exactly as specified

### Non-Functional

- [ ] The server shall use an SQLite database to store all user data.
- [ ] The server shall use appropriate HTTP methods for all routes.
- [ ] All the server-side functions shall return their responses in JSON.

### JSON format

Object has to contain following fields:

- success: true/false
- message: descriptive message about success status
- data: the actual data


### Sending data

Rules:

- Use URL for GET request
- Use JSON for POST, PUT and DELETE requests
- Always use HTTP headers for sending token
