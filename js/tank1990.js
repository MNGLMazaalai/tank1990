import { Map } from './entities/map.js';
import { Bot } from './entities/bot.js';
import { Tank } from './entities/tank.js';
import { Spawn } from './entities/spawn.js';
import { Explosion } from './entities/explosion.js';
import { Renderer } from './entities/renderer.js';
import { Boost } from './entities/boost.js'; 

const cellSize = 32,
  width = 13,
  height = 13;
const app = new PIXI.Application({
  width: width * cellSize,
  height: height * cellSize,
  backgroundColor: 0x000000,
});
const gameBoard = new PIXI.Container();

// let shot = false;
let map = new Map();
let p2 = new Tank(12, 8, 0, 0);
let p1 = new Tank(12, 4, 0, 0),
  gameLoop1,
  gameLoop2;
let players = [];
let boosters = new Array;
// let timerused = false;
let timerused = false;
players.push(p1);
players.push(p2);
// console.log(players);

app.stage.addChild(map.body);
app.stage.addChild(gameBoard);
players.forEach((player) => {
  gameBoard.addChild(player.body);
});
document.body.appendChild(app.view);

var keyState = {};
window.addEventListener(
  'keydown',
  function (e) {
    
    // if (e.keyCode != 32 && e.which != 32) {
    //   console.log('here');
    //   for (let i = 37; i < 41; i++) keyState[i] = false;
    // }
    keyState[e.keyCode || e.which] = true;
  },
  true
);
window.addEventListener(
  'keyup',
  function (e) {
    keyState[e.keyCode || e.which] = false;
    if (e.keyCode == 32 || e.which == 32) players[0].shot = false;
    if (e.keyCode == 90 || e.which == 90) players[1].shot = false;

    // if (e.keyCode == 32 || e.which == 32) shot = false;
  },
  true
);
let new_bot,
  cnt = 50,
  bots = [],
  choose = 0,
  bullets = [],
  botX = [6, 12, 0];

function botMoveLoop() {
  if (timerused) 
    return;
  //moves: left, up, right, down
  if (cnt == 70 && bots.length < 4) {
    let spawn = new Spawn(0, botX[choose]);
    gameBoard.addChild(spawn);
    setTimeout(() => {
      gameBoard.removeChild(spawn);
    }, 500);
  }
  if (cnt == 99 && bots.length < 4) {
    // let speed = Math.floor(Math.random() * 2);
    // speed++;
    // console.log(speed);
    new_bot = new Bot(0, botX[choose], 2, 2);
    bots.push(new_bot);
    gameBoard.addChild(new_bot.body);
    choose++;
    choose %= botX.length;
  }
  let num = 0;
  if (cnt % 10 == 0) {
    bots.forEach((bot) => {
      let shoot_check = Math.floor(Math.random() * 3);
      if (shoot_check == 1) {
        let bullet = bot.fire(num++);
        if (bullet != null) {
          bullets.push(bullet);
          gameBoard.addChild(bullet.body);
        }
      }
    });
  }
  // if (cnt % 2 == 0) {
  bots.forEach((bot) => {
    if (!bot.freeze) {
      // console.log(cnt, bot.speed);
      if (cnt % bot.speed == 0) {
        bot.move(map, players, bots);
      }
    } else {
      setTimeout(() => {
        bot.freeze = 0;
      }, 5000);
    }
  });
  // }
  // else if (keyState[68]) players[1].move(app.stage, bots, 4, map);
  // else if (keyState[87]) players[1].move(app.stage, bots, 0, map);
  cnt++;
  cnt %= 100;
  // console.log(keyState);
}

function playerMoveLoop() {
  let answer = false;
  if (keyState[37]) {
    if (players[0].move(app.stage, bots, 3, map, boosters, gameBoard, timerused))
      answer = true;
  }
  if (keyState[38]) {
    if (players[0].move(app.stage, bots, 0, map, boosters, gameBoard, timerused))
      answer = true;
  }
  if (keyState[39]) {
    if (players[0].move(app.stage, bots, 1, map, boosters, gameBoard, timerused))
      answer = true;
  }
  if (keyState[40]) {
    if (players[0].move(app.stage, bots, 2, map, boosters, gameBoard, timerused))
      answer = true;
  }
  if (keyState[65]) {
    if (players[1].move(app.stage, bots, 3, map, boosters, gameBoard, timerused))
      answer = true;
  }
  if (keyState[87]) {
    if (players[1].move(app.stage, bots, 0, map, boosters, gameBoard, timerused))
      answer = true;
  }
  if (keyState[68]) {
    if (players[1].move(app.stage, bots, 1, map, boosters, gameBoard, timerused))
      answer = true;
  }
  if (keyState[83]) {
    if (players[1].move(app.stage, bots, 2, map, boosters, gameBoard, timerused))
      answer = true;
  }
  console.log(answer);
  if (answer) {
    timerused = answer;
    setTimeout(() => {
      timerused = false;
    }, 5000);
  }
}

let gege = new Boost(0, 0);
boosters.push(gege);
gameBoard.addChild(gege.body);

function GameOver(inter1, inter2) {
  // clearInterval(inter1);
  // clearInterval(inter2);
  // alert("game over");
}

function BulletMoveLoop() {
  // console.log(players[0].shot);
  if (keyState[32] && !players[0].shot) {
    // console.log('here');
    let bullet = players[0].fire();
    if (bullet != null) {
      players[0].shot = true;
      bullets.push(bullet);
      gameBoard.addChild(bullet.body);
    }
  }
  if (keyState[90] && !players[1].shot) {
    let bullet = players[1].fire();
    if (bullet != null) {
      players[1].shot = true;
      bullets.push(bullet);
      gameBoard.addChild(bullet.body);
    }
  }
  for (let i = 0; i < bullets.length; i++) {
    let bullet = bullets[i];
    bullet.move();
    let answer = bullet.collision(app.stage, map, bots, players, bullets, gameBoard, boosters);
    if (answer[2]) {
      gameOver(gameLoop1, gameLoop2);
      return;
    }
    if (answer[0]) {
      if (!answer[3]) { 
        let explosion = new Explosion(bullet.y, bullet.x, 'bullet');
        gameBoard.addChild(explosion);
        setTimeout(() => {
          gameBoard.removeChild(explosion);
        }, 500);
      }
      gameBoard.removeChild(bullet.body);
      // console.log(bullet.owner, bullet.owner.leftBullet, 'to ');
      bullet.owner.leftBullet++; // ?????
      if (bullet.owner.leftBullet > bullet.owner.bulletmax) {
        bullet.owner.leftBullet = bullet.owner.bulletmax;
      }
      answer[1][i] = true;

      // console.log(answer[1]);
      let temp = bullet;
      // if (answer[1] != -1) {
      // }
      // let rm = 0;
      // for (let m = 0; m < answer[1].length; i++) {
      //   if (answer[1][m]) {
      //     let tmp = bullets[m - rm];
      //     bullets[m - rm] = bullets[bullets.length];
      //     bullets[bullets.length] = tmp;
      //   }
      // }
      bullets[i] = bullets[bullets.length - 1];
      bullets[bullets.length - 1] = temp;
      bullets.pop();
      // i -= answer[1];
      i--;
    }
  }
}
window.requestAnimationFrame(BulletMoveLoop);
window.requestAnimationFrame(playerMoveLoop);
window.requestAnimationFrame(botMoveLoop);
gameLoop1 = setInterval(BulletMoveLoop, 25);
gameLoop2 = setInterval(playerMoveLoop, 20);
gameLoop2 = setInterval(botMoveLoop, 20);
function gameOver(loop1, loop2) {
  clearInterval(loop1);
  clearInterval(loop2);
  // alert();
  let gameOverElement = Renderer(
    200,
    100,
    0,
    (width * cellSize - 200) / 2,
    'gameOver'
  );
  gameBoard.addChild(gameOverElement);
  app.stage.children.forEach((el) => {
    app.stage.removeChild(el);
    if (el == PIXI.Container) {
      el.children.forEach((el1) => {
        el.removeChild(el);
      });
    }
  });
  console.log(height, cellSize);
  let lastInterval = setInterval(() => {
    gameOverElement.y++;
    // console.log(gameOverElement.y, height * cellSize / 2);
    if (gameOverElement.y == (height * cellSize - 100) / 2)
      clearInterval(lastInterval);
  }, 10);
}
