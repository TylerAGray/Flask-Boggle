from flask import Flask, request, render_template, jsonify, session
from boggle import Boggle

app = Flask(__name__)
app.config['SECRET_KEY'] = 'aSdFgHjKl1234567890' 

boggle_game = Boggle()

@app.route('/')
def index():
    """Show the game board and display high score and number of plays."""
    board = boggle_game.make_board()
    session['board'] = board
    highscore = session.get("highscore", 0)
    nplays = session.get("nplays", 0)
    return render_template('index.html', board=board, highscore=highscore, nplays=nplays)

@app.route('/check-word')
def check_word():
    """Check if the submitted word is valid."""
    word = request.args.get('word')
    board = session['board']
    response = boggle_game.check_valid_word(board, word)
    return jsonify({'result': response})

@app.route('/post-score', methods=['POST'])
def post_score():
    """Receive score, update number of plays, and update high score if appropriate."""
    score = request.json.get('score')
    highscore = session.get('highscore', 0)
    nplays = session.get('nplays', 0)

    session['nplays'] = nplays + 1
    if score > highscore:
        session['highscore'] = score

    return jsonify(brokeRecord=score > highscore)

if __name__ == '__main__':
    app.run(debug=True)
