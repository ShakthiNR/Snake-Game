const gameBoard = document.getElementById('game-board');
const context = gameBoard.getContext("2d");
const scoreValue = document.getElementById("score-value");
const msgDiv = document.getElementById("msg");

const WIDTH = gameBoard.width;
const HEIGHT = gameBoard.height;
let UNIT = 25;
const LEFT = 37, UP = 38, RIGHT = 39, DOWN = 40, SPACE = 32;

let foodX, foodY, xVel = UNIT, yVel = 0, food, score = 0;
let active = true, started = false, isStopped = false, SPEED = 200, isObstacles = false;

const snakeFood = ["🪱", "🍎", "🐛", "🐥", "🐇"]
const bigFood = "🐇"
const nonFood = ["🍇", "🫑", "🍲", "🌾"]

let snake = [{ x: 0, y: 0 }]
let obstacles = []
let audio;

function audioPlayer(purpose) {
    switch (purpose) {
        case "left":
            audio = new Audio('/assets/audio/left.mp3'); break;

        case "right":
            audio = new Audio('/assets/audio/right.mp3'); break;
        case "up":
            audio = new Audio('/assets/audio/up.mp3'); break;

        case "down":
            audio = new Audio('/assets/audio/down.mp3'); break;

        case "enterance":
            audio = new Audio('/assets/audio/start-game.mp3'); break;

        case "hit":
            audio = new Audio('/assets/audio/hit.mp3'); break;

        case "space":
            audio = new Audio('/assets/audio/pop.mp3'); break;

        case "bite":
            audio = new Audio('/assets/audio/eat.mp3'); break;
    }
    if (audio) audio.play();
}

window.addEventListener("keydown", handleKeyDown)

function resizeWindow() {
    if (window.screen.width < 511) {
        UNIT = 20
    }else if (window.screen.width > 300 && window.screen.width < 380) {
        UNIT = 15
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
ð
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
    context.font = "20px Arial";
    var textX = foodX + UNIT / 2 - context.measureText(food).width / 2;
    var textY = foodY + UNIT / 2 + 10;
    context.fillText(food, textX, textY);
    controlSpeed()
}

function controlSpeed() {
    if (score >= 5 && score <= 10) SPEED = 160
    else if (score >= 11 && score <= 15) SPEED = 140
    else if (score >= 16 && score <= 25) SPEED = 130
    else if (score >= 26 && score <= 30) SPEED = 120
    else if (score > 31) SPEED = 100
    else SPEED = 200
}

function drawSnake() {

    snake.forEach((snakePart, index) => {
        if (index === 0) context.fillStyle = "#4B772E";
        else context.fillStyle = "#ACDB55";
        
        context.fillRect(snakePart.x, snakePart.y, UNIT, UNIT)
    })
}

function moveSnake() {
    if (isObstacles) {
        obstacles.length = 0
    }

    const head = { x: snake[0].x + xVel, y: snake[0].y + yVel }
    snake.unshift(head)


    if (snake[0].x === foodX && snake[0].y === foodY) {
        audioPlayer("bite")
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

function buildObstacles({ initial }) {
    let tempObstacles = [];
    if (foodY > 75) {
        tempObstacles[0] = { x: foodX, y: foodY - (UNIT * 2) }
    }
    if (foodX > 75) {
        tempObstacles[1] = { x: foodX - (UNIT * 2), y: foodY }
    }

    if (!initial) {
        if (foodX + (UNIT * 2) > 500) {
            tempObstacles[2] = { x: foodX + (UNIT * 2), y: foodY }
        } else {
            if (foodY + (UNIT * 2) < 500) {
                tempObstacles[2] = { x: foodX, y: foodY + (UNIT * 2) }
            }
        }
    }

    return tempObstacles
}

function createObstacles() {

    if (score !== 0 && score % 3 === 0) {
        obstacles = buildObstacles({ initial: true })
        obstacles.forEach((part) => {
            context.fillStyle = "#222";
            context.fillRect(part.x, part.y, UNIT, UNIT)
        })
        isObstacles = true
    } else {
        isObstacles = false
    }

}

function nextTick(isTerminated) {

    if (!active) {
        clearBoard()
        clearTimeout(timeOutVar)
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
            createObstacles()
            checkGameOver()
            nextTick()
        }, SPEED)
    }
}


function handleKeyDown(event) {

    if (event.keyCode === LEFT || event.keyCode === RIGHT || event.keyCode === UP || event.keyCode === DOWN || event.keyCode === SPACE) {
        if (!started) {
            started = true;
            nextTick();
            return
        }
    }


    switch (event.keyCode) {
        case LEFT:
            if (xVel === UNIT) return
            audioPlayer("left")
            xVel = -UNIT;
            yVel = 0; break;
        case RIGHT:
            if (xVel === -UNIT) return
            audioPlayer("right")
            xVel = UNIT;
            yVel = 0; break;
        case UP:
            if (yVel === UNIT) return
            audioPlayer("up")
            xVel = 0; yVel = -UNIT; break;
        case DOWN:
            if (yVel === -UNIT) return
            audioPlayer("down")
            xVel = 0; yVel = UNIT; break;
        case SPACE:
            audioPlayer("space")

            if (!active) {
                active = true;
                started = true;
                snake = [{ x: 0, y: 0 }]
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
    const isHitTheObstacles = isHeadHit()
    const isHitBody = !isValidSnakePosition()

    if (isHitWall || isHitBody || isHitTheObstacles) {
        audioPlayer("hit")
        // var audio = new Audio('/assets/audio/hit.mp3');
        // audio.play();
        active = false;
        // started = false; //TODO: Check it once
    }
}

function isHeadHit() {
    let snakeHeadX = snake[0].x
    let snakeHeadY = snake[0].y

    let hitHead = obstacles.filter(elm => elm.x === snakeHeadX && elm.y === snakeHeadY)
    return hitHead.length === 0 ? false : true
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