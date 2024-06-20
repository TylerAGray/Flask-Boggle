from unittest import TestCase
from app import app
from flask import session, json

class FlaskTests(TestCase):

    def setUp(self):
        self.client = app.test_client()
        app.config['TESTING'] = True

    def test_index(self):
        with self.client:
            response = self.client.get('/')
            self.assertEqual(response.status_code, 200)
            self.assertIn('board', session)
            self.assertIn(b'<table>', response.data)

    def test_check_word(self):
        with self.client as client:
            with client.session_transaction() as sess:
                sess['board'] = [['C', 'A', 'T', 'X', 'Y'],
                                 ['A', 'N', 'A', 'T', 'Z'],
                                 ['T', 'A', 'C', 'X', 'Y'],
                                 ['A', 'T', 'A', 'T', 'Z'],
                                 ['T', 'A', 'C', 'X', 'Y']]
            response = client.post('/check-word', json={'word': 'CAT'})
            self.assertEqual(response.json['result'], 'ok')

            response = client.post('/check-word', json={'word': 'DOG'})
            self.assertEqual(response.json['result'], 'not-a-word')

    def test_post_score(self):
        with self.client as client:
            response = client.post('/post-score', json={'score': 10})
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json['times_played'], 1)
            self.assertEqual(response.json['high_score'], 10)
