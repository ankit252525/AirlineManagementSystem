
from airline import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    phone_number = db.Column(db.String(15), unique=True, nullable=False)
    address = db.Column(db.String(255), nullable=False)
    pincode = db.Column(db.String(10), nullable=False)
    password = db.Column(db.String(255), nullable=False)
