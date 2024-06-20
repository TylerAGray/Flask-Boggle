class BoggleGame {
    /* 
    Constructor to initialize a new game at the given DOM element id.
    The game length defaults to 60 seconds unless specified otherwise.
    */
    constructor(boardId, secs = 60) {
      this.secs = secs; // game length in seconds
      this.showTimer(); // display the initial timer value
  
      this.score = 0; // initial score
      this.words = new Set(); // set to store unique words
      this.board = $("#" + boardId); // jQuery object for the game board
  
      // Set a timer to call the tick method every 1000 milliseconds (1 second)
      this.timer = setInterval(this.tick.bind(this), 1000);
  
      // Attach a submit event handler to the word submission form
      $(".add-word", this.board).on("submit", this.handleSubmit.bind(this));
    }
  
    /* 
    Display a word in the list of words on the game board.
    */
    showWord(word) {
      $(".words", this.board).append($("<li>", { text: word }));
    }
  
    /* 
    Display the current score on the game board.
    */
    showScore() {
      $(".score", this.board).text(this.score);
    }
  
    /* 
    Display a status message on the game board.
    */
    showMessage(msg, cls) {
      $(".msg", this.board)
        .text(msg) // set the message text
        .removeClass() // remove existing classes
        .addClass(`msg ${cls}`); // add the new class
    }
  
    /* 
    Handle the submission of a word: if the word is unique and valid, update the score and display the word.
    */
    async handleSubmit(evt) {
      evt.preventDefault(); // prevent the form from submitting normally
      const $word = $(".word", this.board); // get the input element for the word
  
      let word = $word.val(); // get the value of the input element
      if (!word) return; // if the input is empty, do nothing
  
      if (this.words.has(word)) {
        this.showMessage(`Already found ${word}`, "err"); // if the word has already been found, show an error message
        return;
      }
  
      // Check with the server if the word is valid
      const resp = await axios.get("/check-word", { params: { word: word }});
      if (resp.data.result === "not-word") {
        this.showMessage(`${word} is not a valid English word`, "err"); // if the word is not in the dictionary
      } else if (resp.data.result === "not-on-board") {
        this.showMessage(`${word} is not a valid word on this board`, "err"); // if the word is not on the board
      } else {
        this.showWord(word); // display the word on the board
        this.score += word.length; // update the score
        this.showScore(); // display the new score
        this.words.add(word); // add the word to the set of found words
        this.showMessage(`Added: ${word}`, "ok"); // show a success message
      }
  
      $word.val("").focus(); // clear the input field and focus it for the next entry
    }
  
    /* 
    Update the timer display in the DOM.
    */
    showTimer() {
      $(".timer", this.board).text(this.secs);
    }
  
    /* 
    Handle the passing of a second in the game.
    */
    async tick() {
      this.secs -= 1; // decrement the timer
      this.showTimer(); // update the timer display
  
      if (this.secs === 0) {
        clearInterval(this.timer); // stop the timer when it reaches 0
        await this.scoreGame(); // end the game and score it
      }
    }
  
    /* 
    End the game, score it, and update the final message.
    */
    async scoreGame() {
      $(".add-word", this.board).hide(); // hide the word submission form
      const resp = await axios.post("/post-score", { score: this.score }); // send the score to the server
      if (resp.data.brokeRecord) {
        this.showMessage(`New record: ${this.score}`, "ok"); // if a new record is set, show a message
      } else {
        this.showMessage(`Final score: ${this.score}`, "ok"); // otherwise, show the final score
      }
    }
  }
  