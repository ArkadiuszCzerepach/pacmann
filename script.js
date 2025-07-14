const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let players = [];
let ball;
let score = [0,0];
let gameTime = 0;
let timerLimit = Infinity;
let lastTime = 0;
let gameRunning = false;

function startGame(timeSetting) {
    document.getElementById("menu").style.display = "none";
    canvas.style.display = "block";
    timerLimit = timeSetting === 'infinite' ? Infinity : timeSetting;
    initGame();
    requestAnimationFrame(gameLoop);
}

function initGame() {
    // Gracze: [x, y, vx, vy, team, role(0=off,1=def)]
    players = [
        {x:100,y:250,vx:0,vy:0, team:0, role:0}, // ofensywny
        {x:50,y:250,vx:0,vy:0, team:0, role:1},  // defensywny
        {x:700,y:250,vx:0,vy:0, team:1, role:0},
        {x:750,y:250,vx:0,vy:0, team:1, role:1}
    ];
    // Piłka
    ball = {x:400, y:250, vx:2, vy:1.5, radius:8};
    score = [0,0];
    gameTime = 0;
    lastTime = performance.now();
    gameRunning = true;
}

function gameLoop(time) {
    let delta = (time - lastTime) / 1000;
    lastTime = time;
    if(gameRunning) gameTime += delta;
    update(delta);
    draw();
    if(gameTime < timerLimit || timerLimit === Infinity) {
        requestAnimationFrame(gameLoop);
    } else {
        gameRunning = false;
        setTimeout(() => alert(`Koniec meczu! Wynik: ${score[0]} : ${score[1]}`), 100);
    }
}

function update(dt) {
    // Update piłki
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Kolizje ze ścianami
    if(ball.y < ball.radius || ball.y > canvas.height - ball.radius) ball.vy *= -1;
    if(
      (ball.x < ball.radius && !(ball.y > 200 && ball.y < 300)) ||
      (ball.x > canvas.width - ball.radius && !(ball.y > 200 && ball.y < 300))
    ) ball.vx *= -1;

    // Sprawdzenie gola
    if(ball.x < 0 && ball.y > 200 && ball.y < 300){
        score[1]++;
        resetBall();
    }
    if(ball.x > canvas.width && ball.y > 200 && ball.y < 300){
        score[0]++;
        resetBall();
    }

    // AI graczy
    players.forEach(p => {
        let targetX = p.role === 0 ? ball.x : (p.team===0 ? 100 : 700);
        let targetY = p.role === 0 ? ball.y : 250;

        let dx = targetX - p.x;
        let dy = targetY - p.y;
        let dist = Math.hypot(dx,dy);
        if(dist > 1){
            p.vx = (dx/dist)*2;
            p.vy = (dy/dist)*2;
        }

        p.x += p.vx;
        p.y += p.vy;
    });

    // Kolizje graczy z piłką
    players.forEach(p => {
        let dx = ball.x - p.x;
        let dy = ball.y - p.y;
        let dist = Math.hypot(dx, dy);
        if(dist < 15){
            // Odbicie piłki
            let nx = dx/dist;
            let ny = dy/dist;
            ball.vx = nx * 3;
            ball.vy = ny * 3;
        }
    });
}

function resetBall(){
    ball.x = 400; ball.y = 250;
    ball.vx = (Math.random()>0.5?1:-1)*2;
    ball.vy = (Math.random()*2-1)*2;
}

function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // Boisko
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0,0); ctx.lineTo(800,0);
    ctx.lineTo(800,200); ctx.lineTo(750,200);
    ctx.lineTo(750,300); ctx.lineTo(800,300);
    ctx.lineTo(800,500); ctx.lineTo(0,500);
    ctx.lineTo(0,300); ctx.lineTo(50,300);
    ctx.lineTo(50,200); ctx.lineTo(0,200);
    ctx.closePath();
    ctx.stroke();

    // Wynik i czas
    ctx.font = "20px sans-serif";
    ctx.fillStyle = "black";
    ctx.fillText(`${score[0]} : ${score[1]}`, 370, 30);
    ctx.fillText(`${timerLimit===Infinity ? "∞" : Math.max(0,(timerLimit-gameTime)).toFixed(0) + "s"}`, 370, 50);

    // Piłka
    ctx.fillStyle = "orange";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
    ctx.fill();

    // Gracze
    players.forEach((p,i)=>{
        ctx.fillStyle = p.team===0 ? "blue" : "red";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 12, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle="white";
        ctx.font="12px sans-serif";
        ctx.fillText((p.role+1), p.x-3, p.y+4);
    });
}
