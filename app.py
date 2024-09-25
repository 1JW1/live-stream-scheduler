from flask import Flask, render_template, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from flask_socketio import SocketIO, emit, join_room, leave_room
import datetime
import os

from forms import CommentForm, LoginForm, MeetingForm

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.config['UPLOAD_FOLDER'] = 'static/uploads'

db = SQLAlchemy(app)
socketio = SocketIO(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'

# Global comments list for live stream
comments = []

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# User model
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), nullable=False, unique=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(80), nullable=False)
    role = db.Column(db.String(10), nullable=False)  # Either 'admin' or 'user'

# Meeting model
class Meeting(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False)
    agenda = db.Column(db.String(255), nullable=False)
    documents = db.Column(db.String(255), nullable=False)

# Comment model
class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), nullable=False)
    comment = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/live_stream')
@login_required
def live_stream():
    form = CommentForm()
    stored_comments = Comment.query.order_by(Comment.timestamp.asc()).all()
    return render_template('live_stream.html', form=form, comments=stored_comments)

@app.route('/schedule')
@login_required
def schedule():
    meetings = Meeting.query.all()
    return render_template('schedule.html', meetings=meetings)

@app.route('/admin')
@login_required
def admin():
    if current_user.role != 'admin':
        flash('You are not authorized to access this page.', 'danger')
        return redirect(url_for('index'))
    form = MeetingForm()
    return render_template('admin.html', form=form)

@app.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if user and user.password == form.password.data:
            login_user(user)
            return redirect(url_for('index'))
        flash('Login failed. Check email and password.', 'danger')
    return render_template('login.html', form=form)

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))

# Handle new comments
@socketio.on('new_comment')
def handle_new_comment(data):
    comment = Comment(username=current_user.username, comment=data['comment'])
    db.session.add(comment)
    db.session.commit()
    comment_data = {'username': comment.username, 'comment': comment.comment}
    emit('broadcast_comment', comment_data, broadcast=True)

# Join Hackney live stream room
@socketio.on('join')
def on_join(data):
    username = current_user.username
    room = data['room']
    join_room(room)
    emit('status', {'msg': f'{username} has joined the room.'}, room=room)

# Leave Hackney live stream room
@socketio.on('leave')
def on_leave(data):
    username = current_user.username
    room = data['room']
    leave_room(room)
    emit('status', {'msg': f'{username} has left the room.'}, room=room)

if __name__ == '__main__':
    db.create_all()
    socketio.run(app)
