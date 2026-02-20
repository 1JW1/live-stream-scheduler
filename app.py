from flask import Flask, render_template, redirect, url_for, flash, send_from_directory, request
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_migrate import Migrate
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
import datetime
import os

from forms import CommentForm, LoginForm, MeetingForm, RegistrationForm

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'

db = SQLAlchemy(app)
migrate = Migrate(app, db)
socketio = SocketIO(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'

# Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))

# User model
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), nullable=False, unique=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(10), nullable=False)  # Either 'admin' or 'user'

# Meeting model
class Meeting(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False)
    agenda = db.Column(db.String(255), nullable=False)
    documents = db.Column(db.String(255), nullable=True)

# Comment model
class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), nullable=False)
    comment = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

# Archived meeting model
class ArchivedMeeting(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.DateTime, nullable=False)
    video_path = db.Column(db.String(200), nullable=False)
    minutes_path = db.Column(db.String(200), nullable=False)

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/live_stream')
@login_required
def live_stream():
    form = CommentForm()
    stored_comments = Comment.query.order_by(Comment.timestamp.asc()).all()
    video_stream_url = "/static/videos/live_stream.m3u8"
    return render_template('live_stream.html', form=form, comments=stored_comments, video_stream_url=video_stream_url)

@app.route('/schedule')
@login_required
def schedule():
    meetings = Meeting.query.all()
    return render_template('schedule.html', meetings=meetings)

@app.route('/admin', methods=['GET', 'POST'])
@login_required
def admin():
    if current_user.role != 'admin':
        flash('You are not authorized to access this page.', 'danger')
        return redirect(url_for('index'))

    form = MeetingForm()
    if form.validate_on_submit():
        filename = None
        file = form.documents.data
        if file and file.filename:
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        new_meeting = Meeting(
            date=form.date.data,
            agenda=form.agenda.data,
            documents=filename
        )
        db.session.add(new_meeting)
        db.session.commit()
        flash('Meeting added successfully!', 'success')
        return redirect(url_for('admin'))

    meetings = Meeting.query.order_by(Meeting.date.asc()).all()
    return render_template('admin.html', form=form, meetings=meetings)

@app.route('/admin/delete/<int:meeting_id>', methods=['POST'])
@login_required
def delete_meeting(meeting_id):
    if current_user.role != 'admin':
        flash('You are not authorized to perform this action.', 'danger')
        return redirect(url_for('index'))
    meeting = db.session.get(Meeting, meeting_id)
    if meeting:
        db.session.delete(meeting)
        db.session.commit()
        flash('Meeting deleted successfully.', 'success')
    return redirect(url_for('admin'))

@app.route('/archive')
@login_required
def archive():
    archived_meetings = ArchivedMeeting.query.order_by(ArchivedMeeting.date.desc()).all()
    return render_template('archive.html', archived_meetings=archived_meetings)

@app.route('/register', methods=['GET', 'POST'])
def register():
    form = RegistrationForm()
    if form.validate_on_submit():
        hashed_password = generate_password_hash(form.password.data)
        user = User(
            username=form.username.data,
            email=form.email.data,
            password=hashed_password,
            role=form.role.data
        )
        db.session.add(user)
        db.session.commit()
        flash('Account created successfully! Please log in.', 'success')
        return redirect(url_for('login'))
    return render_template('register.html', form=form)

@app.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if user and check_password_hash(user.password, form.password.data):
            login_user(user)
            next_page = request.args.get('next')
            return redirect(next_page or url_for('index'))
        flash('Login failed. Check your email and password.', 'danger')
    return render_template('login.html', form=form)

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out.', 'success')
    return redirect(url_for('index'))

# Handle new comments via WebSocket
@socketio.on('new_comment')
def handle_new_comment(data):
    if not current_user.is_authenticated:
        return
    username = current_user.username
    comment = Comment(username=username, comment=data['comment'])
    db.session.add(comment)
    db.session.commit()
    comment_data = {'username': comment.username, 'comment': comment.comment}
    emit('broadcast_comment', comment_data, broadcast=True)

# Join live stream room
@socketio.on('join')
def on_join(data):
    if not current_user.is_authenticated:
        return
    username = current_user.username
    room = data['room']
    join_room(room)
    emit('status', {'msg': f'{username} has joined the room.'}, room=room)

# Leave live stream room
@socketio.on('leave')
def on_leave(data):
    if not current_user.is_authenticated:
        return
    username = current_user.username
    room = data['room']
    leave_room(room)
    emit('status', {'msg': f'{username} has left the room.'}, room=room)

def create_tables():
    with app.app_context():
        db.create_all()

if __name__ == '__main__':
    create_tables()
    socketio.run(app, host='0.0.0.0', port=8000)
