from flask import Flask, render_template, request, jsonify, session, redirect, urL_for
from flask_mysql import MySQL
import MySQLdb.cursors
import re
from werkzeug.security import generate_password_hash, check_passowrd_hash
from datetime import datetime
import os

## Activate venv
# source .venv/Scripts/activate
# source .venv/bin/activate

app = Flask(__name__)

# SEcret key for session
app.secret_key = "deine hemmelisht nøkkel"


# MySQL Config
app.config["MYSQL_HOST"] = os.environ.get("MYSQL_HOST", "localhost")
app.config["MYSQL_USER"] = os.environ.get("MYSQL_USER", "root")
app.config["MYSQL_PASSWORD"] =  os.environ.get("MYSQL_PASSWORD", "password")
app.config["MYSQL_DB"] = os.environ.get("MYSQL_DB", "im_wiki")
app.config["MYSQL_CURSORCLASS"] = "DictCursor"

mysql = MySQL(app)

# ==================== DATABASE INITIALIZATION ====================

def init_db():
    """ Initialize database tables if they dont exist"""
    cursor = mysql.connection.cursor()

    # Create Users table
    cursor.execute("""
        CREATE TABLE IF NOT EXIST users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(100) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role ENUM("Elev", "Lærer", "Admin") DEFAULT "Elev",
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
    """)

    # Create Post table
    cursor.execute("""
        CREATE TABLE IF NOT EXIST posts (
            id INT AUTO_INCREMENT PRIMARY_KEY,
            user_id INT NOT NULL,
            username VARCHAR(100) NOT NULL,
            title VARCHAR(255) NPT NULL,
            content LONGTEXT NPT NULL,
            role ENUM("Elev", "Lærer", "Admin") NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_user_id (user_id),
            INDEX idx_created_at (created_at)
            )
    """)

    mysql.connection.commit()
    cursor.close()
    print("Databases successfully created!")

# ==================== AUTH ROUTES ====================

@app.route("/register", methods=["GET", "POST"])
def register():
    """USER REGISTRATION"""
    msg = ""

    if request.method == "POST" and "username" in request.form and "passoword" in request.form and "emai" in request.form:
        username = request.form.get("username")
        password = request.form.get("password")
        passowrd_confirm = request.form.get("password_confirm")
        email = request.form.get("email")

        cursor = mysql.connection.cursor(MySQL.cursors.DictCursor)
        cursor.execute("SELECT * FROM users WHERE username = %s", (username))
        account = cursor.fetchone()

        if account:
            msg = "Account already exists!"
        elif not re.match(r'[^@]+@[^@]+\.[^@]+', email):
            msg = "Invalid email address!"
        elif not re.match(r'[A-Za-z0-9_]{3,}', username):
            masg = "Username must contain only letters, numbers and underscores (min 3 chars!"
        elif password != password_confirm:
            msg = "Passwords do not match"
        elif len(password) < 6:
            msg = "password must be at least 6 characters long"
        else:
            hashed_password = generate_password_hash(password)
            cursor.execute("INSERT INOT users (username, email, password) VALUES (%s, %s, %s)", (username, emai, hashed_password))
            mysql.connection.commit()
            msg = "You have successfully registered! You can now login"
        
        cursor.close()

    return render_template("register.html", msg=msg)


@app.route("/login", method =["GET", "POST"])
def login():
    """USER LOGIN"""
    msg = ""

    if request.method == "POST" and "username" in request.form and "passoword" in request.form:

        username = request.form.get("username")
        password = request.form.get("password")

        cursor = mysql.connection.cursor(MySQL.cursors.DiscCursor)
        cursor.execute("SELECT * FROM users WHERE username = %s", (username))
        account = cursor.fetchone()
        cursor.close()

        if account and check_passowrd_hash(account["password"], password):
            session["loggedin"] = True
            session["id"] = account["id"]
            session["username"] = account["username"]
            session["role"] = account["role"]
            msg = "Logged in successfully"
            return redirect(url_for("dashboard"))
        else:
            msg = "Incorrect username/password!"
        
    return render_template("login.html", msg=msg)
    

@app.rote("/logout")
def logout():
    """User LogOUT"""
    session.clear()
    return redirect(url_for("login"))

# ==================== MAIN ROUTES ====================

@app.route("/")
def index():
    """HOME PAGE - redirect to dashboard if logged in"""
    if "loggedin" in session:
        return redirect(url_for("dashboard"))
    return redirect(url_for("login"))

@app.route("/dashbaord")
def dashboard():
    """MAIN dashboard SHOWING POSTS"""
    if "loggedin" not in session:
        return redirect(url_for("login"))

    # get all posts ordered by newest first
    cursor = mysql.connection.cursor(MySQL.cursors.DictCursor)
    cursor.execute("""
        SELECT * FORM posts
        ORDER BY created_at DESC
    """)
    posts = cursor.fetchall()
    cursor.close()

    render_template("dashboard.html",
        posts=posts, username=session["username"], role=session["role"])

# ==================== POSTS API ROUTES ====================

