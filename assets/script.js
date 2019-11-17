$(document).ready(function () {
 // Assign hooks into various DOM elements
 var viewScoresButton = $("#view-scores");
 var timeSpan = $("#time-remaining");
 var ariaTimer = $("#aria-timer");
 var startPageDiv = $("#start-page");
 var startQuizButton = $("#start-quiz");
 var quizPageDiv = $("#quiz-page");
 var questionsH = $("#question");
 var responseList = $("#response-list");
 var correctH = $("#correct");
 var incorrectH = $("#incorrect");

 // Global Variables

 // Variables for timer functionality
 var timeRemaining;
 var timerId;

 // Keeps track of which question is being shown
 var questionIndex;

 // Event Listeners

 viewScoresButton.click(function (event) {
  event.preventDefault();

  // Check to see if high scores array exists in local storage
  var highScoresRaw = localStorage.getItem("highScores");

  // If exists, convert to array and display it to user
  if (highScoresRaw !== null) {
   try {
    var highScores = JSON.parse(highScoresRaw);

    var scoresText = "HIGH SCORES\n\n";

    highScores.forEach(function (scr) {
     scoresText += scr.initials + ": " + scr.score + "\n";
    });
    alert(scoresText);
   } catch (ex) {
    alert("Problem retrieving scores.\nError:  " + ex);
   }
  } else {
   alert("No scores to display.");
  }
 });

 startQuizButton.click(function (Event) {
  event.preventDefault();

  initializeQuizVariables();
  showQuiz();
  timerId = setInterval(updateTimer, 1000);
  showQuestion(questionIndex);
 });

 // Methods

 function initializeQuizVariables() {
  // Sets all variables to their initial values

  questionIndex = 0;

  // Initialize timer, giving 15 seconds per question
  timeRemaining = questions.length * 15;

  // Initialize accessible readout of timer for screen reader users
  ariaTimer.attr("aria-valuemax", timeRemaining);
 }

 function showQuiz() {
  // Hide start page and show quiz
  startPageDiv.addClass("d-none");
  quizPageDiv.removeClass("d-none");
  correctH.addClass("d-none");
  incorrectH.addClass("d-none");
 }

 function updateTimer() {
  timeSpan.text(timeRemaining);
  ariaTimer.attr("aria-valuenow", timeRemaining);

  if (timeRemaining > 0) {
   timeRemaining--;
  } else {
   recordScore();
   return;
  }
 }

 function showStartPage() {
  // Hide quiz and show start page
  quizPageDiv.addClass("d-none");
  startPageDiv.removeClass("d-none");
  timeSpan.text(0);
 }

 function showQuestion(index) {
  // Shows the specified question

  // Show the title
  questionsH.text(questions[index].title);

  // Present the choices
  responseList.empty();
  questions[index].choices.forEach(function (choice) {
   responseList.append($("<li>").append($("<button>").addClass("btn btn-info choice-button").text(choice).click(function (event) {
    // We must add the click event handler for the choice buttons dynamically on the fly because they don't exist until created here
    event.preventDefault();

    // Determine if answer was correct or not and show corresponding output on page
    if ($(this).text() === questions[questionIndex].answer) {
     correctH.removeClass("d-none");
     incorrectH.addClass("d-none");
    } else {
     incorrectH.removeClass("d-none");
     correctH.addClass("d-none");

     // Deduct 10 points for being wrong
     if (timeRemaining > 10) {
      timeRemaining -= 10;
     } else {
      // If there aren't 10 seconds remaining in the game, end game and record the score
      timeRemaining = 0;
      setTimeout(recordScore, 1000);
      return;
     }
    }
    if (questionIndex < (questions.length - 1)) {
     // Move to the next question if there is one, otherwise end the game and record the score
     questionIndex++;
     setTimeout(showQuestion, 100, questionIndex);
    } else {
     recordScore();
     return;
    }
   })).addClass("list-group-item"));
  })

  $(".choice-button:first").focus();
 }

 function recordScore() {
  clearInterval(timerId);
  playerInitials = prompt("Your score is " + timeRemaining.toString() + ". Please enter your initials to save your score.");

  var highScores = null;
  var scoreData = {
   initials: playerInitials,
   score: timeRemaining.toString()
  };

  var highScoresRaw = localStorage.getItem("highScores");
  if (highScoresRaw !== null) {
   try {
    highScores = JSON.parse(highScoresRaw);
    highScores.push(scoreData);
    localStorage.setItem("highScores", JSON.stringify(highScores));
   } catch (ex) {
    alert("Couldn't retrieve high scores\nError: " + ex);
   }
  } else {
   highScores = [scoreData];
   localStorage.setItem("highScores", JSON.stringify(highScores));
  }
  showStartPage();
 }
});
