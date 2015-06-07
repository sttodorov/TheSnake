function SnakeGame(canvas, pixelSize, numberOfObsticles, gamespeed) {

    var playgroundContainer = document.getElementById("playground").getElementsByTagName('div')[0];

    canvas.width = getNumberCloseToPixel(playgroundContainer.clientWidth - playgroundContainer.clientWidth*0.05);
    canvas.height = getNumberCloseToPixel(window.innerHeight*0.8);
    
    this.canvas = canvas;
    this.pixelSize = pixelSize;
    this.numberOfObsticles = numberOfObsticles;
    this.gamespeed = gamespeed;

    this.startGame = Start;

    function Start() {
        var obsticles = generateObsticles(this.canvas, numberOfObsticles, pixelSize);

        var apple = new Apple();
        apple.refresh(obsticles, this.canvas, pixelSize);

        var snake = new Snake(this.pixelSize);
        snake.initialize(this.canvas);

        var gameEngine = setInterval(gameRefresh, gamespeed);
        var ctx = this.canvas.getContext('2d');

        document.onkeydown = keyPressedHandler;
        canvas.addEventListener('touchstart', handleTouchStart, false);        
        canvas.addEventListener('touchmove', handleTouchMove, false);

        var xDown = null;                                                        
        var yDown = null;                                                        

        function handleTouchStart(evt) {          
            if(evt.preventDefault) evt.preventDefault();
            evt.returnValue = false;                          
            xDown = evt.touches[0].clientX;                                      
            yDown = evt.touches[0].clientY;                                      
        };                                                

        function handleTouchMove(evt) {
            evt.preventDefault();
            if ( ! xDown || ! yDown ) {
                return;
            }

            var xUp = evt.touches[0].clientX;                                    
            var yUp = evt.touches[0].clientY;

            var xDiff = xDown - xUp;
            var yDiff = yDown - yUp;

            if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
                if ( xDiff > 0 ) {
                    snake.changeDirection('L');
                } else {
                    snake.changeDirection('R');
                }                       
            } else {
                if ( yDiff > 0 ) {
                    snake.changeDirection('U');
                } else { 
                    snake.changeDirection('D');
                }                                                                 
            }
            /* reset values */
            xDown = null;
            yDown = null;                                             
        };

        function gameRefresh() {
            if (snake.alive) {
                snake.score++;

                var newSnakeEl = snake.move();

                checkSnakeAndObsticles(obsticles, newSnakeEl);
                checkSnakeAndApple(apple, newSnakeEl);

                reDraw();
            }
            else {
                gameOver();
            }
        }

        function gameOver() {
            clearInterval(gameEngine);
            var userName = prompt('Enter your name: ', 'unnamed');

            canvas.style.display = 'none';

            var score = snake.score; 
            var currentScores = localStorage.getItem('scores');
            if (!currentScores) {
                currentScores = [];
            }
            else {
                currentScores = JSON.parse(currentScores);
            }

            processScores(currentScores, userName,score);
            printScores(currentScores);
            showSection("scores");
            document.getElementById("startButton").style.display = "block"; 

            return false;
        }

        function processScores(currentScores, userName, score)
        {
            if (currentScores.length == 0) {
                currentScores.push({ name: userName, score: score });
            }
            else {

                if (score < currentScores[currentScores.length - 1].score) {
                    currentScores.push({ name: userName, score: score });
                }
                else {
                    for (var i = 0; i < currentScores.length; i++) {
                        if (currentScores[i].score < score) {
                            currentScores.splice(i, 0, { name: userName, score: score });
                            break;
                        }
                    }
                }
            }

            localStorage.removeItem('scores');
            localStorage.setItem('scores', JSON.stringify(currentScores));
        }
         
        
        function reDraw() {
            //clear
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            //obsticles
            ctx.fillStyle = '#FFF';
            for (var i = 0; i < obsticles.length; i++) {
                ctx.fillRect(obsticles[i].x, obsticles[i].y, pixelSize, pixelSize);
            }

            //apple
            ctx.fillStyle = '#0F0';
            ctx.fillRect(apple.X, apple.Y, pixelSize, pixelSize);
            ctx.fillStyle = '#F00';
            ctx.fillRect(apple.X + pixelSize / 4, apple.Y + pixelSize / 4, pixelSize - pixelSize / 2, pixelSize - pixelSize / 2);

            //snake
            ctx.fillStyle = '#2A8EC2';
            for (var i = 0; i < snake.elements.length; i++) {
                ctx.fillRect(snake.elements[i].x, snake.elements[i].y, pixelSize, pixelSize);
            }
            ctx.fillStyle = '#0F0';
            ctx.fillRect(snake.elements[0].x + pixelSize / 4, snake.elements[0].y + pixelSize / 4, pixelSize / 2, pixelSize / 2);
        }

        function keyPressedHandler(e) {
            switch (e.keyCode) {
                case 37: snake.changeDirection('L'); break;       //left 
                case 38: snake.changeDirection('U'); break;           //up
                case 39: snake.changeDirection('R'); break;        //right
                case 40: snake.changeDirection('D'); break;         //down 
            }
            gameRefresh();
        }

        function checkSnakeAndObsticles(allObsticles, newSnakeElement) {
            for (var i = 0; i < obsticles.length; i++) {
                if (allObsticles[i].x == newSnakeElement.x && allObsticles[i].y == newSnakeElement.y) {
                    snake.alive = false;
                    return;
                }
            }
        }

        function checkSnakeAndApple(theApple, newSnakeElement) {
            if (newSnakeElement.x != theApple.X || newSnakeElement.y != theApple.Y) {
                snake.elements.pop();
            }
            else {
                snake.score += 50;
                theApple.refresh(obsticles, canvas, pixelSize);
            }
        }
    }

    //helping functions
    function getRandomNumberInRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    function getNumberCloseToPixel(num) {
        return num - num % pixelSize;
    }

    //obstacles
    function generateObsticles(canvas, numberOfObsticles, pixelSize) {
        var obsticles = [];

        function generateObsticle(_x, _y) {
            obsticles.push({ x: _x, y: _y });
        }

        //generating walls
        for (var i = 0; i < canvas.width; i += pixelSize) {
            generateObsticle(i, 0);
            generateObsticle(i, canvas.height - pixelSize);
        }
        for (var i = 0; i < canvas.height; i += pixelSize) {
            generateObsticle(0, i);
            generateObsticle(canvas.width - pixelSize, i);
        }

        for (var i = 0; i < numberOfObsticles; i++) {
            var newX = getNumberCloseToPixel(getRandomNumberInRange(0, canvas.width));
            var newY = getNumberCloseToPixel(getRandomNumberInRange(0, canvas.height));

            //checks if the obsticle is near the start of the snake
            while (newY == canvas.height / 2) {
                newX = getNumberCloseToPixel(getRandomNumberInRange(0, canvas.width));
                newY = getNumberCloseToPixel(getRandomNumberInRange(0, canvas.height));
            }

            //checks if the obsticle is near another obsticle
            var loop = true;
            while (loop) {
                loop = false;
                for (var j = 0; j < obsticles.length; j++) {
                    if ((newX == obsticles[j].x - pixelSize || newX == obsticles[j].x || newX == obsticles[j].x + pixelSize) &&
                        (newY == obsticles[j].y - pixelSize || newY == obsticles[j].y || newY == obsticles[j].y + pixelSize)) {
                        newX = getNumberCloseToPixel(getRandomNumberInRange(0, canvas.width));
                        newY = getNumberCloseToPixel(getRandomNumberInRange(0, canvas.height));

                        loop = true;
                        break;
                    }
                }
            }

            generateObsticle(newX, newY);
        }

        return obsticles;
    }

    //apple
    function Apple() {
        this.X = 0;
        this.Y = 0;

        this.refresh = function (obsticles, canvas, pixelSize) {
            this.X = getNumberCloseToPixel(getRandomNumberInRange(0, canvas.width));
            this.Y = getNumberCloseToPixel(getRandomNumberInRange(0, canvas.height));

            //aplle not close to obsticles
            var loop = true;
            while (loop) {
                loop = false;
                for (var j = 0; j < obsticles.length; j++) {
                    if ((this.X == obsticles[j].x - pixelSize || this.X == obsticles[j].x || this.X == obsticles[j].x + pixelSize) &&
                        (this.Y == obsticles[j].y - pixelSize || this.Y == obsticles[j].y || this.Y == obsticles[j].y + pixelSize)) {
                        this.X = getNumberCloseToPixel(getRandomNumberInRange(0, canvas.width));
                        this.Y = getNumberCloseToPixel(getRandomNumberInRange(0, canvas.height));

                        loop = true;
                        break;
                    }
                }
            }
        }
    }

    //snake
    function Snake(pixelSize) {
        this.elements = [];
        this.direction = 'R';
        this.alive = true;
        this.score = 0;

        function getNewElement(_x, _y) {
            return { x: _x, y: _y };
        }

        //initialize snake
        this.initialize = function (canvas) {
            var widthCenter = getNumberCloseToPixel(canvas.width/2);
            var heightCenter = getNumberCloseToPixel(canvas.height/2);

            this.elements.push(getNewElement(widthCenter + pixelSize * 2, heightCenter));
            this.elements.push(getNewElement(widthCenter + pixelSize, heightCenter));
            this.elements.push(getNewElement(widthCenter + 0, heightCenter));
            this.elements.push(getNewElement(widthCenter - pixelSize, heightCenter));
        }


        this.move = function () {
            var newElement;

            switch (this.direction) {
                case 'R': newElement = getNewElement(this.elements[0].x + pixelSize, this.elements[0].y); break;
                case 'L': newElement = getNewElement(this.elements[0].x - pixelSize, this.elements[0].y); break;
                case 'U': newElement = getNewElement(this.elements[0].x, this.elements[0].y - pixelSize); break;
                case 'D': newElement = getNewElement(this.elements[0].x, this.elements[0].y + pixelSize); break;
            }

            this.elements.unshift(newElement);

            // check if I bite myself
            for (var i = 0; i < this.elements.length; i++) {

                for (var j = 0; j < this.elements.length; j++) {

                    if (i == j) {
                        continue;
                    }

                    if (this.elements[i].x == this.elements[j].x && this.elements[i].y == this.elements[j].y) {
                        this.alive = false;
                        return;
                    }
                }
            }

            return newElement;
        }

        this.changeDirection = function (newDirection) {
            if (newDirection == 'U') {

                if (this.direction != 'D') {
                    this.direction = 'U';
                }
            }
            else if (newDirection == 'D') {
                if (this.direction != 'U') {
                    this.direction = 'D';
                }
            }
            else if (newDirection == 'R') {
                if (this.direction != 'L') {
                    this.direction = 'R';
                }
            }
            else if (newDirection == 'L') {
                if (this.direction != 'R') {
                    this.direction = 'L';
                }
            }
        }
    }
}

function printScores(currentScores) {

    var scoresSection = document.getElementById("scores").getElementsByTagName('div')[0];
    
    if(currentScores.length==0)
    {
        var messege = document.createElement('p');
        messege.className = "text-info";
        messege.innerHTML = "No records yet. You have the chance to be the first one. :)"   
        scoresSection.appendChild(messege);
        return;
    }
    var scoresBoard = document.createElement('table');
    scoresBoard.className = "table table-striped";

    var recordHeader = document.createElement('thead');
    var scoreHeaderRow = document.createElement('tr');
    var numberHeader = document.createElement('th');
    var playerHeader = document.createElement('th');
    var scoreHeader = document.createElement('th');

    playerHeader.innerHTML = "Username";
    numberHeader.innerHTML = "No.";
    scoreHeader.innerHTML = "Score";

    scoreHeaderRow.appendChild(numberHeader);
    scoreHeaderRow.appendChild(playerHeader);
    scoreHeaderRow.appendChild(scoreHeader);
    recordHeader.appendChild(scoreHeaderRow);
    scoresBoard.appendChild(recordHeader);

    var listScores = document.createElement('tbody');
    for (var i = 0; i < currentScores.length; i++) {
        var currRecord = document.createElement('tr');

        var currNumber = document.createElement('td');
        var currPlayer = document.createElement('td');
        var currScore = document.createElement('td');

        currNumber.innerHTML = i+1;
        currPlayer.innerHTML = currentScores[i].name;
        currScore.innerHTML = currentScores[i].score;

        currRecord.appendChild(currNumber);
        currRecord.appendChild(currPlayer);
        currRecord.appendChild(currScore);
        listScores.appendChild(currRecord);
    }
    scoresBoard.appendChild(listScores);
    scoresSection.removeChild(scoresSection.lastChild);
    scoresSection.appendChild(scoresBoard);
}