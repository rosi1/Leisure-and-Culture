const domain = "http://localhost:8080";

class mixOrMatch{
    constructor(totalTime, cards){
        this.cardsArray = cards;
        this.totalTime = totalTime;
        this.timeRemianing = totalTime;
        this.timer = document.getElementById('time-remaining');
        this.ticker = document.getElementById('flips');

    }
    startGame(){
        this.cardToCheck = null;
        this.totalClicks = 0;
        this.timeRemianing = this.totalTime;
        this.matchedCards = [];
        this.busy = true;

        setTimeout(( )=> {
            this.shuffleCards();
            this.countDown = this.startCountDown();
            this.busy = false;
        }, 500);
        this.hideCards();
        this.timer.innerText= this.timeRemianing;
        this.ticker.innerText= this.totalClicks;
        
    }
    hideCards(){
        this.cardsArray.forEach(card =>{
            card.classList.remove('visible');
            card.classList.remove('matched');
        });
    }
    
    flipCard(card){
        if(this.canFlipCard(card)){
            this.totalClicks++;
            this.ticker.innerText = this.totalClicks;
            card.classList.add('visible');

            if(this.cardToCheck){
                this.checkForCardMatch(card);
            }else{
                this.cardToCheck = card;
            }
        }
    }
    checkForCardMatch(card){
        if(this.getCardType(card) === this.getCardType(this.cardToCheck)){
            this.cardMatch(card, this.cardToCheck);
        }else{
            this.cardMisMatch(card, this.cardToCheck);
        }
        this.cardToCheck = null;
    }

    cardMatch(card1,card2){
        this.matchedCards.push(card1);
        this.matchedCards.push(card2);
        card1.classList.add('matched');
        card2.classList.add('matched');
        if(this.matchedCards.length === this.cardsArray.length)
            this.victory();
    }
    cardMisMatch(card1,card2){
        this.busy = true;
        setTimeout(() => {
            card1.classList.remove('visible');
            card2.classList.remove('visible');
            this.busy = false;
        }, 1000);
    }

    getCardType(card){
        return card.getElementsByClassName('card-value')[0].src;
    }


    startCountDown(){
        return setInterval(() => {
            this.timeRemianing--;
            this.timer.innerText = this.timeRemianing;
            if(this.timeRemianing === 0){
                this.gameOver();
            }
            
        }, 1000);
    }

    gameOver(){
        clearInterval(this.countDown);
        document.getElementById('game-over-text').classList.add('visible');
    }

    victory(){
        console.log("time remaining: " + this.timeRemianing);
        console.log("totalClicks: " + this.totalClicks);
        
        let score = (this.timeRemianing * 4) - (this.totalClicks * 2);
        // let score = (this.totalClicks) - (this.timeRemianing * 2);
        console.log("score: " + score);
        
        clearInterval(this.countDown);
        document.getElementById('victory-text').classList.add('visible');
        sendScoreToServer(score);
    }

    shuffleCards(){
        for(let i = this.cardsArray.length - 1; i > 0; i--){
            let randIndex = Math.floor(Math.random() * (i+1));
            this.cardsArray[randIndex].style.order = i;
            this.cardsArray[i].style.order = randIndex
        }
    }
    canFlipCard(card){
        return !this.busy && !this.matchedCards.includes(card) && card !== this.cardToCheck;
    }
}

function ready(){
    let overlays = Array.from(document.getElementsByClassName('overlay-text'));
    let cards = Array.from(document.getElementsByClassName('card'));
    let game = new mixOrMatch(60, cards);

    overlays.forEach(overlay =>{
        overlay.addEventListener('click', () =>{
            overlay.classList.remove('visible');
            game.startGame();
        });
    });
    cards.forEach(card =>{
        card.addEventListener('click', () =>{
            game.flipCard(card);
        });
    });
}

function sendScoreToServer(score) {

    var formData = new Object();
    formData.email = localStorage.getItem("userEmail");
    formData.score = score;
    formData.gameName = "memory";
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

if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', ready());
}else{
    ready();
}