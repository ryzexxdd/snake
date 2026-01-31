const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const hud = document.getElementById("hud");

const eatSound = document.getElementById("eatSound");
const deadSound = document.getElementById("deadSound");
const bgMusic = document.getElementById("bgMusic");

const SIZE = 15;
const FIELD = 300;

let snake, food, dir, score, best, timer;
let speed = 200;
let unlocked = false;

// ---------- ТЕКСТУРА ЗМЕИ ----------
const skinImg = new Image();
skinImg.src = "snake_skin.png";
let skinPattern = null;

skinImg.onload = () => {
    skinPattern = ctx.createPattern(skinImg, "repeat");
};

best = Number(localStorage.getItem("snake_best")) || 0;

// ---------- ЗВУК ----------
function unlockSound() {
    if (unlocked) return;
    unlocked = true;
    bgMusic.volume = 0.25;
    bgMusic.play().catch(()=>{});
}

// ---------- СТАРТ ----------
function start() {
    snake = [{x:150,y:150}];
    dir = "right";
    score = 0;
    food = spawnFood();
    updateHud();
    bgMusic.currentTime = 0;
    bgMusic.play().catch(()=>{});
    clearInterval(timer);
    timer = setInterval(loop, speed);
}

function spawnFood() {
    return {
        x: Math.floor(Math.random()*(FIELD/SIZE))*SIZE,
        y: Math.floor(Math.random()*(FIELD/SIZE))*SIZE
    };
}

function updateHud() {
    hud.textContent = `Счёт: ${score} | Рекорд: ${best}`;
}

// ---------- ФОН ----------
function drawBackground() {
    const g = ctx.createLinearGradient(0,0,0,FIELD);
    g.addColorStop(0,"#4b8f4b");
    g.addColorStop(1,"#2f6f2f");
    ctx.fillStyle = g;
    ctx.fillRect(0,0,FIELD,FIELD);

    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    for(let i=0;i<=FIELD;i+=SIZE){
        ctx.beginPath();
        ctx.moveTo(i,0); ctx.lineTo(i,FIELD); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0,i); ctx.lineTo(FIELD,i); ctx.stroke();
    }

    ctx.fillStyle = "rgba(0,0,0,0.07)";
    for(let i=0;i<200;i++){
        ctx.fillRect(Math.random()*FIELD, Math.random()*FIELD, 2, 2);
    }
}

// ---------- ЗМЕЯ С ТЕКСТУРОЙ ----------
function drawSnake() {
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // тень
    ctx.strokeStyle = "rgba(0,0,0,0.45)";
    ctx.lineWidth = SIZE + 3;
    ctx.beginPath();
    snake.forEach((p,i)=>{
        const x = p.x + SIZE/2;
        const y = p.y + SIZE/2;
        i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
    });
    ctx.stroke();

    // тело с текстурой
    if (skinPattern) {
        ctx.strokeStyle = skinPattern;
    } else {
        ctx.strokeStyle = "#2ecc71";
    }

    ctx.lineWidth = SIZE;
    ctx.beginPath();
    snake.forEach((p,i)=>{
        const x = p.x + SIZE/2;
        const y = p.y + SIZE/2;
        i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
    });
    ctx.stroke();

    // контур
    ctx.strokeStyle = "#0b3d1f";
    ctx.lineWidth = 2;
    ctx.stroke();

    // голова
    const h = snake[0];
    ctx.fillStyle = skinPattern || "#3cff00";
    ctx.beginPath();
    ctx.arc(h.x+SIZE/2,h.y+SIZE/2,SIZE/2,0,Math.PI*2);
    ctx.fill();

    ctx.strokeStyle = "#0b3d1f";
    ctx.stroke();

    // глаза
    ctx.fillStyle="#000";
    const e = {
        right:[[10,4],[10,9]],
        left:[[3,4],[3,9]],
        up:[[4,3],[9,3]],
        down:[[4,10],[9,10]]
    }[dir];

    ctx.fillRect(h.x+e[0][0],h.y+e[0][1],2,2);
    ctx.fillRect(h.x+e[1][0],h.y+e[1][1],2,2);
}

// ---------- ЕДА ----------
function drawFood() {
    ctx.fillStyle="#e63939";
    ctx.beginPath();
    ctx.arc(food.x+SIZE/2,food.y+SIZE/2,SIZE/2,0,Math.PI*2);
    ctx.fill();

    ctx.fillStyle="rgba(255,255,255,0.5)";
    ctx.beginPath();
    ctx.arc(food.x+SIZE/2-3,food.y+SIZE/2-3,3,0,Math.PI*2);
    ctx.fill();
}

// ---------- УПРАВЛЕНИЕ ----------
function changeDirection(d) {
    unlockSound();
    if(d==="up"&&dir!=="down")dir="up";
    if(d==="down"&&dir!=="up")dir="down";
    if(d==="left"&&dir!=="right")dir="left";
    if(d==="right"&&dir!=="left")dir="right";
}

window.addEventListener("keydown",e=>{
    unlockSound();
    if((e.key==="ArrowUp"||e.key==="w")&&dir!=="down")dir="up";
    if((e.key==="ArrowDown"||e.key==="s")&&dir!=="up")dir="down";
    if((e.key==="ArrowLeft"||e.key==="a")&&dir!=="right")dir="left";
    if((e.key==="ArrowRight"||e.key==="d")&&dir!=="left")dir="right";
});

// ---------- ЛОГИКА ----------
function gameOver() {
    clearInterval(timer);
    bgMusic.pause();
    deadSound.play().catch(()=>{});
    if(score > best){
        best = score;
        localStorage.setItem("snake_best", best);
    }
    alert(`Игра окончена\nСчёт: ${score}`);
    start();
}

function move() {
    const h = {...snake[0]};
    if(dir==="up")h.y-=SIZE;
    if(dir==="down")h.y+=SIZE;
    if(dir==="left")h.x-=SIZE;
    if(dir==="right")h.x+=SIZE;

    if(h.x<0||h.y<0||h.x>=FIELD||h.y>=FIELD) return gameOver();
    if(snake.some(p=>p.x===h.x&&p.y===h.y)) return gameOver();

    snake.unshift(h);

    if(h.x===food.x&&h.y===food.y){
        score++;
        updateHud();
        food = spawnFood();
        eatSound.play().catch(()=>{});
    } else {
        snake.pop();
    }
}

function loop() {
    drawBackground();
    drawFood();
    move();
    drawSnake();
}

start();


