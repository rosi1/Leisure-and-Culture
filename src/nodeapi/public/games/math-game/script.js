'use strict';

//clicking on the start/reset 
var playing = false;
var score;
var action;
var timeRemaining;
var correctAnswer;
const domain = "http://localhost:8080";

document.getElementById("start").onclick= function(){
    if(playing) location.reload(); //reload page

    else{

        playing = true;
        score=0;
        //implementing the score 
        document.getElementById("scoreValue").innerHTML= score;

        //show countdown box
        show("timer");
        //set the value of the timer to 60
        timeRemaining = 20;
        document.getElementById("timeremaining").innerHTML= timeRemaining;
		
		//hide game over box
		hide("gameOver")

        //change button to reset
        document.getElementById("start").innerHTML= "Reset game";

        startCountdown();

        generateQa();
    } 
}

//if we click on answer box
for(var i=1; i<5; i++){
    document.getElementById("box" + i).onclick= function(){
        //if we are playing
        if(playing) {
            if( this.innerHTML == correctAnswer){
                score++;
                document.getElementById("scoreValue").innerHTML=score;
                //show correct box for 1sec and hide wrong boxes
                show("correct");
                hide("wrong");
                setTimeout(function () {
                    hide("correct");   
                },1000)
                //generate new Q&A
                generateQa();
    
            }else{
                //show wrong box for 1sec
                show("wrong");
                hide("correct");
                setTimeout(function () {
                    hide("wrong");   
                },1000)
            }
        }
    }
}

function startCountdown(){
    action = setInterval(function(){
        timeRemaining -= 1;
        document.getElementById("timeremaining").innerHTML= timeRemaining;
        if(timeRemaining === 0){
            stopCountdown();
            show("gameOver");

            window.localStorage.setItem("score", `${score}`);
            if(score < 6){
                document.getElementById("gameOver").innerHTML=`GAME OVER!<br>
                YOUR SCORE IS ${score}
                <img src = what1-trans.gif>`;
            }else if( score < 10){
                document.getElementById("gameOver").innerHTML=`GAME OVER!<br>
                YOUR SCORE IS ${score} 
                <img src = med-trans.gif>`
                // document.getElementById("gameOver").style.backgroundImage= "med-trans.gif;"
            }else{
                document.getElementById("gameOver").innerHTML=`GAME OVER!<br>
                YOUR SCORE IS ${score}
                <img src = best-trans.gif>`;
            }
            hide("timer");
			hide("correct");
			hide("wrong");
            // hide("info");
			playing= false;
			document.getElementById("start").innerHTML="START GAME";
            sendScoreToServer(score);
			}
    },1000)
}
function stopCountdown(){
    clearInterval(action);
}

function hide(Id){
	document.getElementById(Id).style.display= "none";
}

function show(Id){
	document.getElementById(Id).style.display= "block";
}
// generate question and multiple answers
function generateQa(){
	var x = 1 + Math.round(9 * Math.random()) ;
    var y = 1 + Math.round(9 * Math.random()) ;
    correctAnswer = x * y;
    document.getElementById("question").innerHTML=`${x} x ${y}`;

    var correctPosition = 1 + Math.round(3 * Math.random()) ;

    //fill one of the boxes with the correct answer
    document.getElementById("box" + correctPosition).innerHTML= correctAnswer;
    // document.querySelector("answers" + correctPosition).innerHTML= 1 + Math.round(99 * Math.random()) ;
    var randAnswers = [correctAnswer];

    for(var i=1; i<5; i++){
        if (i != correctPosition) {
            var wrongAnswer;
            do{
                wrongAnswer = 1 + Math.round(99 * Math.random()) ;  
            }while(randAnswers.indexOf(wrongAnswer)>-1);
        document.getElementById("box" + i).innerHTML= wrongAnswer;
        randAnswers.push(wrongAnswer);
    }
}
}

function sendScoreToServer(score) {

    var formData = new Object();
    formData.email = localStorage.getItem("userEmail");
    formData.score = score;
    formData.gameName = "math";
    var jsonString = JSON.stringify(formData);

    $.ajax({
        url : domain + "/record/save",
        type: "POST",
        headers: { 'Content-Type': 'application/json', "x-access-token": localStorage.getItem("token") },
        //dataType: 'json',
        data: jsonString,
        success: function(res)
        {
                console.log("Record saved");
                return true;
        },
        error: function(xhr, status, error){
            var errorMessage = xhr.status + ': ' + xhr.statusText + ' - '+ xhr.responseText;
            console.log('Error - ' + errorMessage);
            return false;
        }
    });
}

const inf = document.querySelector('.inf');
    inf.style.display = "none";
    inf.innerText = `Lets practice math with trivia!
    You'll have 20 sec to choose the right answers
     for the questions,
    lets play/ practice - press START.`

    const info = document.querySelector('.info');
    info.style.cursor= 'help';
        info.onmouseenter = function(e) {
        if (inf.style.display === 'none') {
            inf.style.display = 'block';
            inf.style.position= 'absolute';
            inf.style.top= "100%";
        }

    }
    info.onmouseleave = function(e) {
        if (inf.style.display === 'block') {
            inf.style.display = 'none';
        }
    }