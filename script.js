const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 500;

let timeLeft = Infinity;
let score = [0, 0];

function startGame(mode) {
    timeLeft = (mode === "infinite") ? Infinity : 120;
    resetPositions();
}

let ball = {
    x: 400,
    y: 250,
    vx: 2,
    vy: 1.5,
    radius: 8
};

let players = [
    {x:100,y:250,vx:0,vy:0,team:0,role:1,color:"blue"},
    {x:200,y:250,vx:0,vy:0,team:0,role:0,color:"blue"},
    {x:700,y:250,vx:0,vy:0,team:1,role:1,color:"red"},
    {x:600,y:250,vx:0,vy:0,team:1,role:0,color:"red"}
];

function resetPositions(){
    ball.x=400; ball.y=250; ball.vx=2; ball.vy=1.5;
    players[0].x=100; players[0].y=250;
    players[1].x=200; players[1].y=250;
    players[2].x=700; players[2].y=250;
    players[3].x=600; players[3].y=250;
}

function update(dt){
    // AI ruch
    players.forEach(p => {
        let targetX = ball.x;
        let targetY = ball.y;
        let dx = targetX - p.x;
        let dy = targetY - p.y;
        let dist = Math.hypot(dx, dy);
        if(dist > 1){
            p.vx = (dx/dist)*2;
            p.vy = (dy/dist)*2;
        }
        p.x += p.vx;
        p.y += p.vy;

        // Ograniczenia pola
        if(p.role===1){
            if(p.team===0){
                p.x=Math.max(0, Math.min(200, p.x));
            }else{
                p.x=Math.max(600, Math.min(800, p.x));
            }
        }else{
            p.x=Math.max(0, Math.min(800, p.x));
        }
        p.y=Math.max(0, Math.min(500, p.y));
    });

    // Kolizje między graczami
    for(let i=0;i<players.length;i++){
        for(let j=i+1;j<players.length;j++){
            let p1=players[i], p2=players[j];
            let dx=p2.x-p1.x, dy=p2.y-p1.y;
            let dist=Math.hypot(dx,dy);
            let minDist=12*0.8*2;
            if(dist<minDist && dist>0){
                let overlap=(minDist-dist)/2;
                let nx=dx/dist, ny=dy/dist;
                p1.x-=nx*overlap; p1.y-=ny*overlap;
                p2.x+=nx*overlap; p2.y+=ny*overlap;
            }
        }
    }

    // Ruch piłki
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Odbicia od ścian
    if(ball.y < ball.radius || ball.y > canvas.height - ball.radius) ball.vy *= -1;
    if(ball.x < ball.radius || ball.x > canvas.width - ball.radius) ball.vx *= -1;

    // Tarcze by piłka nie zwalniała w nieskończoność
    ball.vx *= 1.0;
    ball.vy *= 1.0;

    // Kolizja piłki z graczami
    players.forEach(p=>{
        let dx=ball.x-p.x, dy=ball.y-p.y;
        let dist=Math.hypot(dx,dy);
        let minDist=8+12*0.8;
        if(dist<minDist && dist>0){
            let nx=dx/dist, ny=dy/dist;
            ball.vx=nx*3;
            ball.vy=ny*3;
        }
    });

    // Ograniczenia piłki do boiska
    ball.x = Math.max(ball.radius, Math.min(canvas.width-ball.radius, ball.x));
    ball.y = Math.max(ball.radius, Math.min(canvas.height-ball.radius, ball.y));

    // Gole
    if(ball.x < 10 && ball.y > 200 && ball.y < 300){
        score[1]++;
        resetPositions();
    }
    if(ball.x > 790 && ball.y > 200 && ball.y < 300){
        score[0]++;
        resetPositions();
    }

    // Czas gry
    if(timeLeft!==Infinity){
        timeLeft -= dt;
        if(timeLeft<=0){
            timeLeft=0;
            // stop
            ball.vx=0; ball.vy=0;
        }
    }
}

function draw(){
    ctx.fillStyle="#eee";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.strokeStyle="black";
    ctx.lineWidth=2;
    ctx.strokeRect(0,0,canvas.width,canvas.height);

    // Linie bramek
    ctx.strokeRect(0,200,10,100);
    ctx.strokeRect(790,200,10,100);

    // Linie stref
    ctx.strokeStyle="red";
    ctx.beginPath();
    ctx.moveTo(200,0); ctx.lineTo(200,500);
    ctx.moveTo(600,0); ctx.lineTo(600,500);
    ctx.stroke();

    // Piłka
    ctx.beginPath();
    ctx.fillStyle="black";
    ctx.arc(ball.x,ball.y,ball.radius,0,Math.PI*2);
    ctx.fill();

    // Gracze
    players.forEach((p,i)=>{
        ctx.beginPath();
        ctx.fillStyle=p.color;
        ctx.arc(p.x,p.y,12,0,Math.PI*2);
        ctx.fill();
        ctx.fillStyle="white";
        ctx.font="12px sans-serif";
        ctx.textAlign="center";
        ctx.textBaseline="middle";
        ctx.fillText(p.role+1,p.x,p.y);
    });

    // Wynik
    ctx.fillStyle="black";
    ctx.font="20px sans-serif";
    ctx.textAlign="center";
    ctx.fillText(`${score[0]} : ${score[1]}`,400,30);
    if(timeLeft!==Infinity){
        ctx.fillText(`${Math.ceil(timeLeft)}s`,400,55);
    }
}

let last=0;
function gameLoop(timestamp){
    let dt=(timestamp-last)/1000;
    last=timestamp;
    update(dt);
    draw();
    requestAnimationFrame(gameLoop);
}

startGame("2min"); // albo "infinite"
requestAnimationFrame(gameLoop);
