from flask import Flask, render_template, jsonify
from flask_sqlalchemy import SQLAlchemy
import mysql.connector
from mysql.connector import Error

app = Flask(__name__)

# MySQL configuration
def create_db_connection():
    try:
        connection = mysql.connector.connect(
            host="localhost",
            user="root",
            password="ankit123",
            database="airline"
        )
        if connection.is_connected():
            print("Successfully connected to the database")
        return connection
    except Error as e:
        print(f"Error while connecting to MySQL: {e}")
        return None

# SQLAlchemy configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///airline.db'
db = SQLAlchemy(app)

# Import models after db initialization
from models import User  

# Ensure the database is created
with app.app_context():
    db.create_all()

# Routes
@app.route('/')
def home():
    return "Welcome to the Airline Management System!"

@app.route('/test-db')
def test_db():
    connection = create_db_connection()
    if connection:
        cursor = connection.cursor()
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        cursor.close()
        connection.close()
        return jsonify({"tables": tables})
    else:
        return jsonify({"error": "Failed to connect to the database"}), 500

if __name__ == '__main__':
    app.run(debug=True)




from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:@localhost/airline'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Import model
from models import User

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    new_user = User(
        name=data['name'],
        email=data['email'],
        phone_number=data['phone_number'],
        address=data['address'],
        pincode=data['pincode'],
        password=data['password']
    )
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "User registered successfully!"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)
