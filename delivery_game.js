//canvas drawing 

const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");

//timer in game//

let timeRemaining = 60;

let lastTime = 0;

//for game over screen//
let gameState = "playing";

let deliveries = 0;


//main game loop-->//

//updated each drawing function//
function gameLoop(timestamp) {

    const deltaTime = (timestamp - lastTime) / 1000;

    lastTime = timestamp;

    context.clearRect(
        0, 0, canvas.width, canvas.height
    );

    if (gameState === "playing") {

        update(deltaTime);

        drawBuildings();
        drawPackage();
        drawDeliveryPoint();
        drawPlayer();
        drawHUD();

    } else if (gameState === "timesUp") {

        drawBuildings();
        drawPackage();
        drawDeliveryPoint();
        drawPlayer();
        drawHUD();

        drawTimesUpScreen();
    } else if (gameState === "results") {
        drawResultsScreen();
    }

    requestAnimationFrame(gameLoop);
}

//player character (w/o sprite)//


const player = {
    x: 400,
    y: 250,

    width: 32,
    height: 32,

    speed: 200
};

//drawing player 
function drawPlayer() {

    context.fillStyle = "blue";

    if (player.carryingPackage) {
        context.fillStyle = "pink";
    } else {
        context.fillStyle = "blue";
    }

    context.fillRect(
        player.x,
        player.y,
        player.width,
        player.height
    );
}

//Canvas boundary//

function keepPlayerInsideCanvas() {

    if (player.x < 0) {
        player.x = 0;
    }

    if (player.y < 0) {
        player.y = 0;
    }

    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }

    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
    }
}


//adding player movement//
//arrow keys//

const keys = {};

window.addEventListener("keydown", function (event) {
    keys[event.key] = true;
});

window.addEventListener("keyup", function (event) {
    keys[event.key] = false;
});

//keyboard//
function update(deltaTime) {

    timeRemaining -= deltaTime;

    if (timeRemaining <= 0) {
        timeRemaining = 0;
        gameState = "timesUp";
        return;
    }

    const oldX = player.x;
    const oldY = player.y;

    if (keys["ArrowUp"] || keys["w"]) {
        player.y -= player.speed * deltaTime;
    }

    if (keys["ArrowDown"] || keys["s"]) {
        player.y += player.speed * deltaTime;
    }

    if (keys["ArrowLeft"] || keys["a"]) {
        player.x -= player.speed * deltaTime;
    }

    if (keys["ArrowRight"] || keys["d"]) {
        player.x += player.speed * deltaTime;
    }

    for (const building of buildings) {
        if (isColliding(player, building)) {
            player.x = oldX;
            player.y = oldY;

            break;
        }
    }

    checkPackagePickup();
    checkDelivery();

    keepPlayerInsideCanvas();
}

//creating buildings or obstacles

const buildings = [

    {
        x: 100,
        y: 100,
        width: 120,
        height: 80,
        color: "#e85d75"
    },

    {
        x: 600,
        y: 100,
        width: 120,
        height: 80,
        color: "#5d8be8"
    },

    {
        x: 300,
        y: 350,
        width: 150,
        height: 80,
        color: "#e8b85d"
    }

];

//drawing buildings on canvas//
function drawBuildings() {

    for (const building of buildings) {

        context.fillStyle = building.color;

        context.fillRect(
            building.x,
            building.y,
            building.width,
            building.height
        );
    }

}

//building object collision

function isColliding(a, b) {

    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

//the packages to be collected//

const package = {
    x: 200,
    y: 300,

    width: 24,
    height: 24,

    collected: false
};

//packages drawing//

function drawPackage() {
    if (package.collected) {
        return;
    }

    context.fillStyle = "pink";

    context.fillRect(
        package.x,
        package.y,
        package.width,
        package.height
    );

    context.fillStyle = "blue";

    context.fillRect(
        package.x + 8,
        package.y,
        4,
        package.height
    );
}

//package collision//

function checkPackagePickup() {

    if (!package.collected && isColliding(player, package)) {

        package.collected = true;

        player.carryingPackage = true;
    }
}

player.carryingPackage = false; //check where this should be after//

//where packages go so the delivery points//
//creating the shape itself//
const deliveryPoint = {
    x: 650,
    y: 350,

    width: 60,
    height: 60
}

//function to draw it on screen//
function drawDeliveryPoint() {
    context.fillStyle = "gold";

    context.fillRect(
        deliveryPoint.x,
        deliveryPoint.y,
        deliveryPoint.width,
        deliveryPoint.height,
    );

    context.fillStyle = "purple";

    context.fillText(
        "DELIVER HERE!", deliveryPoint.x + 5, deliveryPoint.y + 35
    );
}

//check if delivery is possible and what to do if it is//

function checkDelivery() {
    if (
        player.carryingPackage && isColliding(player, deliveryPoint)) {

        player.carryingPackage = false;

        score += 100;
        deliveries++;

        respawnPackage();
    }

}

//respawning different packages after each delivery//

function respawnPackage() {
    let validPosition = false;

    while (!validPosition) {
        package.x = Math.random() * (canvas.width - package.width);
        package.y = Math.random() * (canvas.height - package.height);

        validPosition = true;

        //so that packages cant spawn in buildings/ where player cant reach//

        for (const building of buildings) {
            if (isColliding(package, building)) {
                validPosition = false;
                break;
            }
        }

        //also cant spawn on delivery point//

        if (isColliding(package, deliveryPoint)) {
            validPosition = false;
        }

        package.collected = false;
    }
}


//SECTION FOR SCORE//
let score = 0; //changed in checkdelivery()//

function drawHUD() {
    context.fillStyle = "white";
    context.font = "20px Sans";

    context.fillText(
        "Score: " + score,
        20,
        30
    );

    context.fillStyle = "white";
    context.font = "20px Arial";

    context.fillText(
        "Time left: " + Math.ceil(timeRemaining),
        20,
        50
    );
}

//gameover screen and timesup screen//

function drawTimesUpScreen() {

    //backgorund//
    context.fillStyle = "grey";
    context.fillRect(
        0, 0, canvas.width, canvas.height
    );

    //main screen//

    context.fillStyle = "white";
    context.font = "bold 50px Sans";
    context.textAlign = "center";

    context.fillText(
        "TIME'S UP!", canvas.width / 2, 150
    );

    //enter to continue//
    context.fillText(
        "Press Enter for your results", canvas.width / 2, canvas.height / 2 + 20
    );

    context.textAlign = "left"
}

//pressing enter for results//
window.addEventListener("keydown", function (event) {

    if (event.key === "Enter" && gameState === "timesUp") {

        gameState = "results";
    }

});

//restarting game//
window.addEventListener("keydown", function (event) {

    if (event.key.toLowerCase() === "r" &&
        gameState === "results") {

        restartGame();
    }

});

function restartGame() {

    // Reset timer
    timeRemaining = 60;

    // Reset score
    score = 0;

    // Reset deliveries
    deliveries = 0;

    // Reset package
    package.collected = false;

    // Reset player
    player.x = 400;
    player.y = 250;

    player.carryingPackage = false;

    // Start game
    gameState = "playing";
}


//results screen//

function drawResultsScreen() {

    context.fillStyle = "rgba(0, 0, 0, 0.95)";
    context.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    context.textAlign = "center";

    // Title
    context.fillStyle = "white";
    context.font = "bold 45px Arial";

    context.fillText(
        "DELIVERY COMPLETE!",
        canvas.width / 2,
        100
    );

    // Deliveries
    context.font = "28px Arial";

    context.fillText(
        "Deliveries: " + deliveries,
        canvas.width / 2,
        190
    );

    // Score
    context.fillText(
        "Score: " + score,
        canvas.width / 2,
        240
    );



    // Restart instruction
    context.font = "20px Arial";

    context.fillText(
        "Press R to play again",
        canvas.width / 2,
        380
    );

    context.textAlign = "left";
}


requestAnimationFrame(gameLoop);