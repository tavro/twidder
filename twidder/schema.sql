CREATE TABLE users (
    email TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    firstname TEXT,
    familyname TEXT,
    gender TEXT,
    city TEXT,
    country TEXT
);

CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_email TEXT NOT NULL,
    recipient_email TEXT NOT NULL,
    message TEXT,
    FOREIGN KEY (sender_email) REFERENCES users(email),
    FOREIGN KEY (recipient_email) REFERENCES users(email)
);

CREATE TABLE tokens (
    token TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (email) REFERENCES users(email)
);

CREATE TABLE media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message_id INTEGER NOT NULL,
    media_type TEXT NOT NULL,
    media_data BLOB NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES messages(id)
);