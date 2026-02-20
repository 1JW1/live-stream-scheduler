from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, TextAreaField, SubmitField, DateField, FileField, SelectField
from wtforms.validators import DataRequired, Email, Length, EqualTo, Optional

class LoginForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])
    submit = SubmitField('Login')

class CommentForm(FlaskForm):
    comment = TextAreaField('Your Comment', validators=[DataRequired()])
    submit = SubmitField('Post Comment')

class MeetingForm(FlaskForm):
    date = DateField('Meeting Date', validators=[DataRequired()])
    agenda = StringField('Meeting Agenda', validators=[DataRequired(), Length(max=255)])
    documents = FileField('Upload Documents (optional)', validators=[Optional()])
    submit = SubmitField('Add Meeting')

class RegistrationForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    email = StringField('Email', validators=[DataRequired(), Email()])
    role = SelectField('Role', choices=[('user', 'Regular User'), ('admin', 'Admin')], validators=[DataRequired()])
    password = PasswordField('Password', validators=[DataRequired(), Length(min=6)])
    confirm_password = PasswordField('Confirm Password', validators=[DataRequired(), EqualTo('password')])
    submit = SubmitField('Create Account')
