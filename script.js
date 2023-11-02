import vikingIdleOne from "./assets/Viking-idle-01.png";
import vikingIdleTwo from "./assets/Viking-idle-02.png";
import vikingIdleThree from "./assets/Viking-idle-03.png";
import vikingIdleFour from "./assets/Viking-idle-04.png";
import vikingWalkOne from "./assets/Viking-walk-01.png";
import vikingWalkTwo from "./assets/Viking-walk-02.png";
import vikingWalkThree from "./assets/Viking-walk-03.png";
import vikingWalkFour from "./assets/Viking-walk-04.png";

const vikingIdleSprite = [
  vikingIdleOne,
  vikingIdleTwo,
  vikingIdleThree,
  vikingIdleFour,
];
const vikingWalkSprite = [
  vikingWalkOne,
  vikingWalkTwo,
  vikingWalkThree,
  vikingWalkFour,
];

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

window.addEventListener("load", () => {
  const Directions = {
    TOP: 0,
    RIGHT: 1,
    BOTTOM: 2,
    LEFT: 3,
  };
  const canvas = document.getElementById("render");
  const ctx = canvas.getContext("2d");

  canvas.width = 1280;
  canvas.height = 720;

  class InputHandler {
    constructor(game) {
      this.game = game;
      window.addEventListener("keydown", (e) => {
        switch (e.key) {
          case "w":
          case "a":
          case "s":
          case "d":
            this.insertKeyCode(e.key);
            break;
          default:
            break;
        }
      });
      window.addEventListener("keyup", (e) => {
        this.removeKeyCode(e.key);
      });
    }

    insertKeyCode(key) {
      if (this.verifyKeyNotExists(key)) {
        this.game.keys.push(key);
      }
    }

    verifyKeyNotExists(key) {
      return this.game.keys.indexOf(key) === -1;
    }

    verifyKeyExists(key) {
      return this.game.keys.indexOf(key) > -1;
    }

    removeKeyCode(key) {
      if (this.verifyKeyExists(key)) {
        this.game.keys.splice(this.game.keys.indexOf(key), 1);
      }
    }
  }

  class Bullet {
    constructor(game, x, y) {
      this.game = game;
      this.x = x;
      this.y = y;
      this.width = 32;
      this.height = 32;

      let actualXPlus = Math.round(Math.random()) ? 1 : -1;
      let actualYPlus = Math.round(Math.random()) ? 1 : -1;
      const minSpeed = 150;
      const maxSpeed = 250;

      this.speedX = getRandomArbitrary(minSpeed, maxSpeed) * actualXPlus;
      this.speedY = getRandomArbitrary(minSpeed, maxSpeed) * actualYPlus;
      this.markedForDeletion = false;

      this.sprite = document.getElementById("bullet");
    }

    update(deltaTime) {
      this.x += this.speedX * deltaTime;
      this.y += this.speedY * deltaTime;
      if (this.x > this.game.width * 2 || this.x < -100)
        this.markedForDeletion = true;
      if (this.y > this.game.height * 2 || this.y < -100)
        this.markedForDeletion = true;
    }

    draw(context) {
      context.drawImage(this.sprite, this.x, this.y, this.width, this.height);
    }
  }

  class Player {
    constructor(game) {
      this.game = game;
      this.height = 64;
      this.width = 64;
      this.verticalLimit = game.height - this.height;
      this.horizontalLimit = game.width - this.width;
      this.x = this.horizontalLimit / 2;
      this.y = this.verticalLimit / 2;
      this.movement = {
        x: 0,
        y: 0,
      };
      this.speed = 400;
      this.bullets = [];
      this.health = 100;
      this.maxSpriteFrame = 3;
      this.actualSpriteFrame = 0;
      this.timeToNextFrame = 0.1;
      this.spriteTimer = 0;

      this.spriteIdle = document.getElementById("player_idle");
      this.spriteWalk = document.getElementById("player_walk");
    }

    update(deltaTime) {
      if (this.game.keys.includes("w")) this.movement.y = -1;
      else if (this.game.keys.includes("s")) this.movement.y = 1;
      else this.movement.y = 0;

      if (this.game.keys.includes("a")) this.movement.x = -1;
      else if (this.game.keys.includes("d")) this.movement.x = 1;
      else this.movement.x = 0;

      const length = Math.sqrt(
        Math.pow(this.movement.x, 2) + Math.pow(this.movement.y, 2)
      );

      if (length !== 0) {
        this.movement.x /= length;
        this.movement.y /= length;
      }

      this.y += this.speed * deltaTime * this.movement.y;
      if (this.y >= this.verticalLimit) this.y = this.verticalLimit;
      else if (this.y <= 0) this.y = 0;

      this.x += this.speed * deltaTime * this.movement.x;
      if (this.x >= this.horizontalLimit) this.x = this.horizontalLimit;
      else if (this.x <= 0) this.x = 0;

      this.bullets.forEach((bullet) => {
        bullet.update(deltaTime);
      });
      this.bullets = this.bullets.filter((bullet) => !bullet.markedForDeletion);

      this.spriteTimer += deltaTime;

      if (this.spriteTimer >= this.timeToNextFrame) {
        this.spriteTimer = 0;
        if (this.actualSpriteFrame < this.maxSpriteFrame) {
          this.actualSpriteFrame++;
        } else {
          this.actualSpriteFrame = 1;
        }
        this.spriteIdle.src = vikingIdleSprite[this.actualSpriteFrame];
        this.spriteWalk.src = vikingWalkSprite[this.actualSpriteFrame];
      }
    }

    draw(context) {
      context.fillStyle = "black";
      context.save();

      if (this.movement.y !== 0 || this.movement.x !== 0) {
        if (this.movement.x < 0) {
          context.scale(-1, 1);
          context.drawImage(
            this.spriteWalk,
            -this.x - this.width,
            this.y,
            this.width,
            this.height
          );
        } else {
          context.drawImage(
            this.spriteWalk,
            this.x,
            this.y,
            this.width,
            this.height
          );
        }
        context.restore();
      } else {
        context.drawImage(
          this.spriteIdle,
          this.x,
          this.y,
          this.width,
          this.height
        );
      }

      this.bullets.forEach((bullet) => {
        bullet.draw(context);
      });
    }

    shootRandom() {
      this.bullets.push(
        new Bullet(this.game, this.x + this.width / 2, this.y + this.height / 2)
      );
    }
  }

  class Enemy {
    constructor(game) {
      this.game = game;
      this.width = 64;
      this.height = 64;
      this.spawnSides = {
        [Directions.TOP]: {
          y: -50,
          x: Math.random() * (this.game.width * 0.9 - this.width),
          speedX: getRandomArbitrary(-150, 100),
          speedY: getRandomArbitrary(150, 100),
          rotation: 0,
        },
        [Directions.RIGHT]: {
          y: Math.random() * (this.game.height * 0.9 - this.height),
          x: 1300,
          speedX: getRandomArbitrary(-150, -100),
          speedY: getRandomArbitrary(-150, 150),
          rotation: 90,
        },
        [Directions.BOTTOM]: {
          y: 800,
          x: Math.random() * (this.game.width * 0.9 - this.width),
          speedX: getRandomArbitrary(-150, 150),
          speedY: getRandomArbitrary(-150, -100),
          rotation: -180,
        },
        [Directions.LEFT]: {
          y: Math.random() * (this.game.height * 0.9 - this.height),
          x: -50,
          speedX: getRandomArbitrary(150, 100),
          speedY: getRandomArbitrary(-150, 150),
          rotation: -90,
        },
      };
      this.actualSide = this.spawnSides[Math.floor(Math.random() * 4)];
      this.y = this.actualSide.y;
      this.x = this.actualSide.x;
      this.speedX = this.actualSide.speedX;
      this.speedY = this.actualSide.speedY;
      this.rotation = this.actualSide.rotation;
      this.isDead = false;
      this.health = 2;
      this.sprite = document.getElementById("enemy");
    }

    update(deltaTime) {
      const length = Math.sqrt(
        Math.pow(this.speedX, 2) + Math.pow(this.speedY, 2)
      );

      const directionX = this.speedX / length;
      const directionY = this.speedY / length;

      this.x += directionX * length * deltaTime;
      this.y += directionY * length * deltaTime;

      if (
        this.x - this.width < -200 ||
        this.x + this.width > this.game.width + 200
      )
        this.isDead = true;
      if (
        this.y + this.height > this.game.height + 200 ||
        this.y - this.height < -200
      )
        this.isDead = true;
    }

    draw(context) {
      context.save();

      const centerX = this.x + this.width / 2;
      const centerY = this.y + this.height / 2;

      context.translate(centerX, centerY);

      context.rotate((this.rotation * Math.PI) / 180);

      context.drawImage(
        this.sprite,
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height
      );
      context.restore();
    }
  }

  class SceneUI {
    constructor(game) {
      this.game = game;
      this.fontSize = 25;
      this.fontFamily = "pixelArt";
      this.color = "white";
      this.healthWidth = 200;
    }

    draw(context) {
      context.save();

      context.fillStyle = this.color;
      context.shadowOffsetX = 2;
      context.shadowOffsetY = 2;
      context.shadowColor = "black";
      context.font = this.fontSize + "px " + this.fontFamily;
      context.fillText("Score " + this.game.score, 20, 40);

      context.fillText(this.game.gameTime.toFixed("0"), 20, 80);

      if (this.game.isGameOver) {
        context.textAlign = "center";
        let endMessage;
        if (
          this.game.score >= this.game.winScore ||
          this.game.gameTime >= this.game.timeLimit
        ) {
          endMessage = "Victory";
        } else {
          endMessage = "FAILED";
        }
        context.font = "50px " + this.fontFamily;
        context.fillText(
          endMessage,
          this.game.width * 0.5,
          this.game.height * 0.5
        );
      }

      context.shadowColor = "transparent";
      context.fillStyle = "green";
      context.fillRect(180, 20, this.healthWidth, 25);

      context.restore();
    }
  }

  class GameManager {
    constructor(width, height) {
      this.width = width;
      this.height = height;
      this.player = new Player(this);
      this.inputHandler = new InputHandler(this);
      this.ui = new SceneUI(this);
      this.keys = [];
      this.enemies = [];
      this.isGameOver = false;
      this.enemyTimer = 0;
      this.enemyInterval = 0.5;
      this.bulletInterval = 0.5;
      this.bulletTimer = 0;
      this.score = 0;
      this.winScore = 100;
      this.timeLimit = 60;
      this.gameTime = 0;
    }

    update(deltaTime) {
      if (!this.isGameOver) this.gameTime += deltaTime;
      if (this.gameTime >= this.timeLimit) this.isGameOver = true;

      this.player.update(deltaTime);
      this.enemies.forEach((enemy) => {
        if (this.isGameOver) {
          enemy.isDead = true;
        }
        enemy.update(deltaTime);
        if (this.checkCollision(this.player, enemy)) {
          this.player.health -= 10;
          this.ui.healthWidth -= 20;
          enemy.isDead = true;
        }

        this.player.bullets.forEach((bullet) => {
          if (this.checkCollision(bullet, enemy)) {
            enemy.health--;
            bullet.markedForDeletion = true;
            if (enemy.health <= 0) {
              enemy.isDead = true;
              this.score += 10;
            }
          }
        });
      });

      this.enemies = this.enemies.filter((enemy) => !enemy.isDead);

      if (this.enemyTimer >= this.enemyInterval && !this.isGameOver) {
        this.addEnemy();
        this.enemyTimer = 0;
      } else {
        this.enemyTimer += deltaTime;
      }

      if (this.bulletTimer >= this.bulletInterval && !this.isGameOver) {
        this.player.shootRandom();
        this.bulletTimer = 0;
      } else {
        this.bulletTimer += deltaTime;
      }

      if (this.score >= this.winScore) {
        this.isGameOver = true;
      } else if (this.player.health <= 0) {
        this.isGameOver = true;
      }
    }

    draw(context) {
      this.player.draw(context);
      this.enemies.forEach((enemy) => {
        enemy.draw(context);
      });
      this.ui.draw(context);
    }

    addEnemy() {
      this.enemies.push(new Enemy(this));
    }

    checkCollision(collider, other) {
      return (
        collider.x < other.x + other.width &&
        collider.x + collider.width > other.x &&
        collider.y < other.y + other.height &&
        collider.height + collider.y > other.y
      );
    }
  }

  const game = new GameManager(canvas.width, canvas.height);
  let lastTime = 0;

  function animate(timeStamp) {
    const deltaTime = (timeStamp - lastTime) / 1000; // converted to seconds to use in movement calculations
    lastTime = timeStamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.update(deltaTime);
    game.draw(ctx);
    requestAnimationFrame(animate);
  }

  animate(0);
});
