from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, TextAreaField, SubmitField, DateField, FileField
from wtforms.validators import DataRequired, Email, Length, EqualTo

class LoginForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])
    submit = SubmitField('Login')

class CommentForm(FlaskForm):
    comment = TextAreaField('Your Comment', validators=[DataRequired()])
    submit = SubmitField('Submit')

class MeetingForm(FlaskForm):
    date = DateField('Meeting Date', validators=[DataRequired()])
    agenda = StringField('Meeting Agenda', validators=[DataRequired(), Length(max=255)])
    documents = FileField('Upload Documents', validators=[DataRequired()])
    submit = SubmitField('Add Meeting')
