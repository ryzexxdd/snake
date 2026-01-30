const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");

const box = 15;
const canvasSize = 300;

let gameInterval;
let speed;

function startGame() {
    let snake = [{ x: 150, y: 150 }];
    let direction = "right";
    let score = 0;
    speed = 200;

    let food = randomFood();
    scoreEl.textContent = "Счёт: 0";

    function randomFood() {
        return {
            x: Math.floor(Math.random() * (canvasSize / box)) * box,
            y: Math.floor(Math.random() * (canvasSize / box)) * box
        };
    }

    // -------- ТРАВЯНОЙ ФОН --------
    function drawBackground() {
        // база
        const grad = ctx.createLinearGradient(0, 0, 0, canvasSize);
        grad.addColorStop(0, "#4b8f4b");
        grad.addColorStop(1, "#2f6f2f");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvasSize, canvasSize);

        // мягкая сетка-ориентир
        ctx.strokeStyle = "rgba(255,255,255,0.07)";
        ctx.lineWidth = 1;
        for (let i = 0; i <= canvasSize; i += box) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvasSize);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(canvasSize, i);
            ctx.stroke();
        }

        // текстура «травинки» (точки)
        ctx.fillStyle = "rgba(0,0,0,0.08)";
        for (let x = box / 2; x < canvasSize; x += box) {
            for (let y = box / 2; y < canvasSize; y += box) {
                if ((x + y) % 30 === 0) ctx.fillRect(x, y, 2, 2);
            }
        }
    }

    function drawSnake() {
        for (let i = 0; i < snake.length; i++) {
            const p = snake[i];

            if (i === 0) {
                ctx.fillStyle = "#3cff00";
                ctx.beginPath();
                ctx.roundRect(p.x, p.y, box, box, 6);
                ctx.fill();

                ctx.fillStyle = "#000";
                ctx.fillRect(p.x + 9, p.y + 4, 2, 2);
                ctx.fillRect(p.x + 9, p.y + 9, 2, 2);
            } else {
                ctx.fillStyle = "#2ecc71";
                ctx.beginPath();
                ctx.roundRect(p.x, p.y, box, box, 5);
                ctx.fill();
            }
        }
    }

    function drawFood() {
        const cx = food.x + box / 2;
        const cy = food.y + box / 2;

        ctx.fillStyle = "#e63939";
        ctx.beginPath();
        ctx.arc(cx, cy, box / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.beginPath();
        ctx.arc(cx - 3, cy - 3, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    window.changeDirection = function (dir) {
        if (dir === "up" && direction !== "down") direction = "up";
        if (dir === "down" && direction !== "up") direction = "down";
        if (dir === "left" && direction !== "right") direction = "left";
        if (dir === "right" && direction !== "left") direction = "right";
    };

    function gameOver() {
        clearInterval(gameInterval);
        alert("Игра окончена. Счёт: " + score);
        startGame();
    }

    function moveSnake() {
        let head = { ...snake[0] };

        if (direction === "up") head.y -= box;
        if (direction === "down") head.y += box;
        if (direction === "left") head.x -= box;
        if (direction === "right") head.x += box;

        if (head.x < 0 || head.y < 0 || head.x >= canvasSize || head.y >= canvasSize) {
            gameOver();
            return;
        }

        for (let part of snake) {
            if (head.x === part.x && head.y === part.y) {
                gameOver();
                return;
            }
        }

        if (head.x === food.x && head.y === food.y) {
            score++;
            scoreEl.textContent = "Счёт: " + score;
            food = randomFood();

            if (speed > 60) {
                speed -= 10;
                clearInterval(gameInterval);
                gameInterval = setInterval(game, speed);
            }
        } else {
            snake.pop();
        }

        snake.unshift(head);
    }

    function game() {
        drawBackground();
        drawFood();
        moveSnake();
        drawSnake();
    }

    gameInterval = setInterval(game, speed);

    // свайпы
    let sx = 0, sy = 0;
    canvas.addEventListener("touchstart", e => {
        sx = e.touches[0].clientX;
        sy = e.touches[0].clientY;
    });

    canvas.addEventListener("touchend", e => {
        let dx = e.changedTouches[0].clientX - sx;
        let dy = e.changedTouches[0].clientY - sy;

        if (Math.abs(dx) > Math.abs(dy)) {
            dx > 0 ? changeDirection("right") : changeDirection("left");
        } else {
            dy > 0 ? changeDirection("down") : changeDirection("up");
        }
    });
}

startGame();

