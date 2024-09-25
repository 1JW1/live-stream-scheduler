import unittest
from app import app, db, User, Meeting, Comment

class TestApp(unittest.TestCase):

    def setUp(self):
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.app = app.test_client()
        db.create_all()

    def tearDown(self):
        db.session.remove()
        db.drop_all()

    def test_home_page(self):
        response = self.app.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Welcome', response.data)

    def test_login_page(self):
        response = self.app.get('/login')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Login', response.data)

    def test_schedule_page(self):
        user = User(username='admin', email='admin@example.com', password='password', role='admin')
        db.session.add(user)
        db.session.commit()

        with self.app.session_transaction() as sess:
            sess['user_id'] = user.id

        response = self.app.get('/schedule')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Meeting Schedule', response.data)

if __name__ == '__main__':
    unittest.main()
