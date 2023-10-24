const gameBoard = document.getElementById('game-board');
const context = gameBoard.getContext("2d");
const scoreValue = document.getElementById("score-value");
const msgDiv = document.getElementById("msg");

const WIDTH = gameBoard.width;
const HEIGHT = gameBoard.height;
let UNIT = 25;
const LEFT = 37, UP = 38, RIGHT = 39, DOWN = 40, SPACE = 32;

let foodX, foodY, xVel = UNIT, yVel = 0, food, score = 0;
let active = true, started = false, isStopped = false, SPEED = 200, isObstacles = false, isMuted = false;

const snakeFood = isTouchDevice () ? ["🍎", "🥛", "🥚"] : ["🪱", "🍎", "🐛", "🐥", "🥚"]

// TODO: TO enhance the feature(in future)
const bigFood = "🐇"
const nonFood = ["🍇", "🫑", "🍲", "🌾"]

let snake = [{ x: 25, y: 25 }]
let obstacles = []
let audio;

// Play sounds
function audioPlayer(purpose) {
    if (isMuted) return

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
            audio = new Audio('/assets/audio/dead.mp3'); break;

        case "space":
            audio = new Audio('/assets/audio/pop.mp3'); break;

        case "bite":
            audio = new Audio('/assets/audio/eat.mp3'); break;

        case "snake-sound":
            audio = new Audio('/assets/audio/snake-sound.mp3'); break;
    }
    if (audio) audio.play();
}

window.addEventListener("keydown", handleKeyDown)


// Responsive food items
function resizeWindow() {
    if (window.screen.width < 600) {
        UNIT = 30
    } else if (window.screen.width > 350 && window.screen.width < 300) {
        UNIT = 30
    }
}

function toggleMute() {

    const muteIcon = document.getElementById("mute-icon");
    if (isMuted) {
        muteIcon.classList.remove('fa-volume-mute')
        muteIcon.classList.add('fa-volume-up')
    } else {
        muteIcon.classList.remove('fa-volume-up')
        muteIcon.classList.add('fa-volume-mute')
    }

    isMuted = !isMuted
}

// Detect device - mobile or desktop
function isTouchDevice() {
    try {
        document.createEvent("TouchEvent")
        deviceType = "touch"
        return true
    } catch (e) {
        deviceType = "mouse"
        return false
    }
}

// Initial message
window.onload = function () {
    if (isTouchDevice()) {
        msgDiv.textContent = "Tap to pause or continue"
        drawText("Tap to start", WIDTH / 2, (HEIGHT / 2) - 35, 30, 'atarian, sans-serif');
    } else {
        msgDiv.textContent = "Press space to pause or continue"
        drawText("Press space to start", WIDTH / 2, (HEIGHT / 2) - 35, 30, 'atarian, sans-serif');
    }

}


// For tap event handling
gameBoard.addEventListener('touchstart', function (event) {
    touchstartY = event.changedTouches[0].screenY;
}, false);
gameBoard.addEventListener('touchend', function (event) {
    let touchendY = event.changedTouches[0].screenY;
    if (touchendY === touchstartY) {
        if (isTouchDevice()) {
            handleSpace()
        }
    }
}, false);


gameBoard.addEventListener('swiped-left', function (e) {
    if (isTouchDevice()) {
        initialize()
        if (xVel === UNIT) return
        audioPlayer("left")
        xVel = -UNIT;
        yVel = 0;
    }
});

gameBoard.addEventListener('swiped-right', function (e) {

    if (isTouchDevice()) {
        initialize()
        if (xVel === -UNIT) return
        audioPlayer("right")
        xVel = UNIT;
        yVel = 0;
    }
});

gameBoard.addEventListener('swiped-up', function (e) {

    if (isTouchDevice()) {
        initialize()
        if (yVel === UNIT) return
        audioPlayer("up")
        xVel = 0; yVel = -UNIT;

    }
});

gameBoard.addEventListener('swiped-down', function (e) {

    if (isTouchDevice()) {
        initialize()
        if (yVel === -UNIT) return
        audioPlayer("down")
        xVel = 0; yVel = UNIT;

    }
});


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
    food = snakeFood[getRandomNumber(snakeFood.length)]
    controlSpeed()
}

function getRandomNumber(number) {
    return Math.floor(Math.random() * number)
}

//TODO: Check the food position (check algorithm)
function displayFood() {
    context.font = isTouchDevice() ?  `${UNIT - 2}px serif` : `${UNIT}px serif`;
    var textX = foodX + UNIT / 2 - context.measureText(food).width / 2;
    var textY = foodY + UNIT / 2 + 10;
    context.fillText(food, textX, textY);
}

// Modify speed if score increases
function controlSpeed() {
    if (score >= 5 && score <= 10) SPEED = 200
    else if (score >= 11 && score <= 15) SPEED = 180
    else if (score >= 16 && score <= 25) SPEED = 160
    else if (score >= 26 && score <= 30) SPEED = 140
    else if (score >= 31 && score <= 36) SPEED = 130
    else if (score > 36) SPEED = 110
    else SPEED = 220
}

function drawSnake() {

    // Iterates over array too render snake
    snake.forEach((snakePart, index) => {
        if (index === 0) context.fillStyle = "#4B772E";
        else context.fillStyle = "#ACDB55";

        context.fillRect(snakePart.x, snakePart.y, UNIT, UNIT)
    })
}

// Move snake -> unshift, pop
function moveSnake() {
    if (isObstacles) obstacles.length = 0

    const head = { x: snake[0].x + xVel, y: snake[0].y + yVel }
    snake.unshift(head)

    // Catch the food
    if (snake[0].x === foodX && snake[0].y === foodY) {
        audioPlayer("bite")
        score = score + 1;
        scoreValue.textContent = score;
        createFood()
    } else snake.pop()

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

// algorithm to build obstacles
function createObstacles() {

    if (score !== 0 && score % 3 === 0) {
        obstacles = buildObstacles({ initial: true })
        obstacles.forEach((part) => {
            context.fillStyle = "#222";
            context.fillRect(part.x, part.y, UNIT, UNIT)
        })
        isObstacles = true
    }
    else if (score !== 0 && score > 20 && score % 7 === 0) {
        obstacles = buildObstacles({ initial: false })
        obstacles.forEach((part) => {
            context.fillStyle = "#222";
            context.fillRect(part.x, part.y, UNIT, UNIT)
        })
        isObstacles = true
    }
    else isObstacles = false
}

function nextTick(isTerminated) {
    if (!active) {
        clearBoard()
        clearTimeout(timeOutVar)
        drawText("Game Over!!!", WIDTH / 2, (HEIGHT / 2) - 35, 50, 'serif');
        drawText(`${isTouchDevice() ? "Tap to continue" : "Press space to continue"}  `, WIDTH / 2, (HEIGHT / 2), 24, 'serif');
        msgDiv.style.visibility = 'hidden';
        return
    }

    if (isTerminated) clearTimeout(timeOutVar)
    else {
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

function resetVariables() {
    snake = [{ x: 25, y: 25 }]
    xVel = UNIT;
    score = 0
    scoreValue.textContent = score;
    yVel = 0;
    audioPlayer("snake-sound")
}

function initialize() {
    if (!started) {
        started = true;
        nextTick();
        return
    }
}

function handleSpace() {

    if (!active) {
        active = true;
        started = true;
        resetVariables()
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

// control the snake navigation
function handleKeyDown(event) {

    if (event.keyCode === LEFT || event.keyCode === RIGHT || event.keyCode === UP || event.keyCode === DOWN) {
        initialize()
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
            handleSpace()
    }
}


function checkGameOver() {
    const isHitWall = snake[0].x < 0 || snake[0].x >= WIDTH || snake[0].y < 0 || snake[0].y >= HEIGHT;
    const isHitTheObstacles = isHeadHit()
    const isHitBody = !isValidSnakePosition()

    if (isHitWall || isHitBody || isHitTheObstacles) {
        audioPlayer("hit")
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

// to detect if snake hits own body
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