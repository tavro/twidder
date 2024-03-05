import sqlite3


conn = sqlite3.connect('database.db', check_same_thread=False)
cursor = conn.cursor()


def init_db():
    with open('schema.sql', 'r') as f:
        sql_script = f.read()
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.executescript(sql_script)
    conn.commit()
    conn.close()


init_db()


def get_user_by_email(email):
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    return cursor.fetchone()


def get_email_by_token(token):
    cursor.execute("SELECT email FROM tokens WHERE token = ?", (token,))
    result = cursor.fetchone()
    if result:
        return result[0]
    return None


def check_token(token):
    cursor.execute("SELECT EXISTS(SELECT 1 FROM tokens WHERE token = ?)", (token,))
    return cursor.fetchone()[0] == 1


def user_exists(email):
    cursor.execute("SELECT EXISTS(SELECT 1 FROM users WHERE email = ?)", (email,))
    return cursor.fetchone()[0] == 1

def create_user(email, hashed_password, firstname, familyname, gender, city, country):
    try:
        cursor.execute("INSERT INTO users (email, password, firstname, familyname, gender, city, country) VALUES (?, ?, ?, ?, ?, ?, ?)",
                       (email, hashed_password, firstname, familyname, gender, city, country))
        conn.commit()
        return True
    except sqlite3.DatabaseError as e:
        print(f"Database error: {e}")
        conn.rollback()
        return False


def remove_token(token):
    cursor.execute("DELETE FROM tokens WHERE token = ?", (token,))
    conn.commit()
    return cursor.rowcount > 0


def create_token(email, token):
    cursor.execute("INSERT INTO tokens (email, token) VALUES (?, ?)", (email, token))
    conn.commit()


def update_password(email, new_hash):
    cursor.execute("UPDATE users SET password = ? WHERE email = ?", (new_hash, email))
    conn.commit()


def store_message(sender_email, message, recipient_email):
    cursor.execute("INSERT INTO messages (sender_email, recipient_email, message) VALUES (?, ?, ?)",
                   (sender_email, recipient_email, message))
    conn.commit()


def get_user_data(email):
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    return cursor.fetchone()


def get_messages(email):
    cursor.execute("""
    SELECT message FROM messages 
    WHERE recipient_email = ?
    """, (email,))
    return cursor.fetchall()