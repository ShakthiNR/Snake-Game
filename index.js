const gameBoard = document.getElementById('game-board');
const context = gameBoard.getContext("2d");
const scoreValue = document.getElementById("score-value");
const msgDiv = document.getElementById("msg");

const WIDTH = gameBoard.width;
const HEIGHT = gameBoard.height;
const UNIT = 25;
const LEFT = 37, UP = 38, RIGHT = 39, DOWN = 40, SPACE = 32;

let foodX, foodY, xVel = UNIT, yVel = 0, food, score = 0;
let active = true, started = false, isStopped = false, SPEED = 200;

const snakeFood = ["🪱", "🍎", "🐛", "🐥", "🐇"]
const bigFood = "🐇"
const nonFood = ["🍇", "🫑", "🍲", "🌾"]

let snake = [

    { x: 0, y: 0 }
]
window.addEventListener("keydown", handleKeyDown)

function resizeWindow() {
    if(window.screen.width < 511) {
        
    }
  
}

startGame();

function startGame() {
    
    context.fillStyle = "#E2F5B9"
    context.fillRect(0, 0, WIDTH, HEIGHT)
    msgDiv.style.visibility = 'visible';
    createFood();
    displayFood();
    drawSnake()
}

function clearBoard() {
    context.fillStyle = "#E2F5B9"
    context.fillRect(0, 0, WIDTH, HEIGHT)
}

function createFood() {
    foodX = getRandomNumber(WIDTH / UNIT) * UNIT
    foodY = getRandomNumber(HEIGHT / UNIT) * UNIT
    food = snakeFood[getRandomNumber(5)]
}

function getRandomNumber(number) {
    return Math.floor(Math.random() * number)
}

//TODO: Check the food position (check algorithm)
function displayFood() {

    // context.fillStyle = 'red';
    // context.fillRect(foodX, foodY, UNIT, UNIT)
    context.font = "20px Arial";

    // Calculate the position to center the text
    var textX = foodX + UNIT / 2 - context.measureText(food).width / 2;
    var textY = foodY + UNIT / 2 + 10;

    context.fillText(food, textX, textY);

}

function drawSnake() {

    snake.forEach((snakePart, index) => {
        if (index === 0) {
            context.fillStyle = "#4B772E";

        } else {
            context.fillStyle = "#ACDB55";

        }
        context.fillRect(snakePart.x, snakePart.y, UNIT, UNIT)
    })
}

function moveSnake() {


    const head = { x: snake[0].x + xVel, y: snake[0].y + yVel }
    snake.unshift(head)


    if (snake[0].x === foodX && snake[0].y === foodY) {
        score = score + 1;
        scoreValue.textContent = score;
        createFood()
    } else {
        snake.pop()
    }


}

function drawText(text, centerX, centerY, fontsize, fontface) {
    context.save();
    context.fillStyle = "black";
    context.font = fontsize + 'px ' + fontface;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, centerX, centerY);
    context.restore();
}


function nextTick(isTerminated) {


    if (!active) {
        clearBoard()
        clearTimeout(timeOutVar)
        // context.font = "bold 50px serif";
        // context.fillStyle = "white";
        // context.textAlign = "center";
        // context.fillText("Game Over!!",WIDTH/2,HEIGHT/2)
        drawText("Game Over!!!", WIDTH / 2, (HEIGHT / 2) - 30, 50, 'serif');
        drawText("Press space to continue", WIDTH / 2, (HEIGHT / 2), 16, 'serif');
        msgDiv.style.visibility = 'hidden';
        return
    }

    if (isTerminated) {
        clearTimeout(timeOutVar)
    } else {
        timeOutVar = setTimeout(() => {
            clearBoard()
            displayFood()
            moveSnake()
            drawSnake()
            checkGameOver()
            nextTick()
        }, SPEED)
    }
}


function handleKeyDown(event) {


    switch (event.keyCode) {
        case LEFT:
            if (xVel === UNIT) return
            xVel = -UNIT;
            yVel = 0; break;
        case RIGHT:
            if (xVel === -UNIT) return
            xVel = UNIT;
            yVel = 0; break;
        case UP:
            if (yVel === UNIT) return
            xVel = 0; yVel = -UNIT; break;
        case DOWN:
            if (yVel === -UNIT) return
            xVel = 0; yVel = UNIT; break;
        case SPACE:

            if (!active) {
                active = true;
                started = true;
                snake = [

                    { x: 0, y: 0 }
                ]
                xVel = UNIT;
                score = 0
                scoreValue.textContent = score;
                yVel = 0;
                startGame();
                nextTick(false)
                return
            }

            if (!started) {
                started = true;
                nextTick();
            } else {
                isStopped = !isStopped;
                nextTick(isStopped)
            }




    }
}


function checkGameOver() {
    const isHitWall = snake[0].x < 0 || snake[0].x >= WIDTH || snake[0].y < 0 || snake[0].y >= HEIGHT;
    const isHitBody = !isValidSnakePosition()



    if (isHitWall || isHitBody) {
        active = false;
        // started = false; //TODO: Check it once
    }
}


function isValidSnakePosition() {
    const seen = {};
    const duplicates = [];

    for (let i = 0; i < snake.length; i++) {
        const objStr = JSON.stringify(snake[i]);
        if (seen[objStr]) {
            duplicates.push(snake[i]);
        }
        seen[objStr] = true;
    }


    return duplicates.length === 0 ? true : false;
}