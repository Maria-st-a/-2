let font;
let tSize = 280; // Text Size
let tposX = 280; // X position of text
let tposY = 500; // Adjusted Y position
let pointCount = 0.1; // Reduced Point count for fewer particles

let speed = 10; // Speed of the particles
let comebackSpeed = 100; // Lower the number, less interaction
let dia = 120; // Diameter of interaction
let randomPos = false; // Starting points
let pointsDirection = "up"; // General movement direction
let interactionDirection = 1; // -1 and 1

let textPoints = [];
let newParticles = []; // Array for new particles after explosion
let explosionTriggered = false;
let explosionCenter;
let phase = "original"; // Track animation phase: "original", "explosion", "new"

let loadingParticles = []; // Array for loading circle particles
let loadingCircleVisible = false; // Flag to control when to show the loading circle

// Colors
let darkRed, brightRed;

function preload() {
  font = loadFont("AvenirNextLTPro-Demi.otf");
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  tposX = width / 2 - tSize * 1.2;
  tposY = 500;

  textFont(font);

  // Define colors
  darkRed = color(128, 0, 32); // Burgundy
  brightRed = color(255, 0, 0); // Bright red

  let points = font.textToPoints("HEY?", tposX, tposY, tSize, {
    sampleFactor: pointCount,
  });

  for (let i = 0; i < points.length; i++) {
    let pt = points[i];
    let textPoint = new Interact(
      pt.x,
      pt.y,
      speed,
      dia,
      randomPos,
      comebackSpeed,
      pointsDirection,
      interactionDirection
    );
    textPoints.push(textPoint);
  }

  explosionCenter = createVector(0, 0);
}

function draw() {
  background(0);

  if (phase === "original") {
    for (let i = 0; i < textPoints.length; i++) {
      let v = textPoints[i];
      v.update();
      v.show();
      v.behaviors();

      if (explosionTriggered) {
        v.explode(explosionCenter);
      }
    }

    if (explosionTriggered && textPoints.every(p => p.opacity === 0)) {
      phase = "new";
      spawnNewParticles();
    }
  } else if (phase === "new") {
    // Handle the new particles pulling together into words
    for (let i = 0; i < newParticles.length; i++) {
      let p = newParticles[i];
      p.update();
      p.show();
      p.pullToTarget();
    }

    // After the new particles have formed, spawn the loading circle particles
    if (loadingCircleVisible) {
      for (let i = 0; i < loadingParticles.length; i++) {
        let p = loadingParticles[i];
        p.update();
        p.show();
      }
    }
  }
}

// Handle mouse click to trigger explosion
function mousePressed() {
  if (phase === "original") {
    explosionTriggered = true;
    explosionCenter.set(mouseX, mouseY);
    setTimeout(() => {
      explosionTriggered = false;
      loadingCircleVisible = true; // Show the loading circle after explosion
      spawnLoadingParticles(); // Create the loading circle particles
    }, 1000);
  }
}

// Function to spawn new particles for "menu", "about us", "settings"
function spawnNewParticles() {
  newParticles = []; // Clear the array

  let words = ["menu", "about us", "settings"];
  let startY = height / 3;

  for (let i = 0; i < words.length; i++) {
    let wordPoints = font.textToPoints(words[i], width / 2 - 200, startY + i * 150, 80, {
      sampleFactor: pointCount * 2, // More precision for smaller words
    });

    for (let j = 0; j < wordPoints.length; j++) {
      let pt = wordPoints[j];
      let particle = new NewParticle(pt.x, pt.y);
      newParticles.push(particle);
    }
  }
}

// Function to spawn loading particles in a circle around the column
function spawnLoadingParticles() {
  let radius = 200 * 1.5; // 1.5 times bigger radius
  let numParticles = 60; // Number of particles for the circle
  let centerX = width / 2; // X position of the center
  let centerY = height / 3 + 100; // Y position of the center (around the "menu" column)

  for (let i = 0; i < numParticles; i++) {
    let angle = map(i, 0, numParticles, 0, TWO_PI);
    let x = centerX + cos(angle) * radius;
    let y = centerY + sin(angle) * radius;
    let particle = new LoadingParticle(x, y);
    loadingParticles.push(particle);
  }
}

// Particle for the new words
function NewParticle(x, y) {
  this.pos = createVector(random(width), random(height));
  this.target = createVector(x, y);
  this.vel = p5.Vector.random2D();
  this.acc = createVector();
  this.maxSpeed = 5;
  this.maxForce = 0.5;
  this.color = random() > 0.5 ? darkRed : brightRed;
  this.opacity = 0; // Start invisible
}

NewParticle.prototype.pullToTarget = function () {
  let force = p5.Vector.sub(this.target, this.pos);
  let distance = force.mag();
  let speed = this.maxSpeed;

  // Gradually increase visibility
  this.opacity = constrain(this.opacity + 5, 0, 255);

  if (distance < 100) {
    speed = map(distance, 0, 100, 0, this.maxSpeed);
  }
  force.setMag(speed);
  let steer = p5.Vector.sub(force, this.vel);
  steer.limit(this.maxForce);

  this.applyForce(steer);
};

NewParticle.prototype.applyForce = function (f) {
  this.acc.add(f);
};

NewParticle.prototype.update = function () {
  this.vel.add(this.acc);
  this.pos.add(this.vel);
  this.acc.mult(0);
};

NewParticle.prototype.show = function () {
  fill(this.color.levels[0], this.color.levels[1], this.color.levels[2], this.opacity);
  noStroke();
  ellipse(this.pos.x, this.pos.y, 8, 8);
};

// Particle for the loading circle
function LoadingParticle(x, y) {
  this.pos = createVector(x, y);
  this.vel = createVector(0, 0);
  this.acc = createVector();
  this.maxSpeed = 1;
  this.maxForce = 0.1;
  this.color = random() > 0.5 ? darkRed : brightRed;
}

LoadingParticle.prototype.update = function () {
  // Move particles in a circular motion
  let angle = atan2(this.pos.y - height / 3, this.pos.x - width / 2);
  let force = createVector(cos(angle), sin(angle)).mult(0.2);
  this.acc.add(force);
  this.vel.add(this.acc);
  this.pos.add(this.vel);
  this.acc.mult(0);
};

LoadingParticle.prototype.show = function () {
  fill(this.color.levels[0], this.color.levels[1], this.color.levels[2]);
  noStroke();
  ellipse(this.pos.x, this.pos.y, 8, 8);
};

function Interact(x, y, m, d, t, s, di, p) {
  this.home = createVector(x, y);
  this.pos = this.home.copy();
  this.target = createVector(x, y);
  this.vel = p5.Vector.random2D();
  this.acc = createVector();
  this.maxSpeed = m;
  this.dia = d;
  this.come = s;
  this.dir = p;
  this.opacity = 255;
  this.color = random() > 0.5 ? darkRed : brightRed;
}

Interact.prototype.explode = function (center) {
  let direction = p5.Vector.sub(this.pos, center);
  let force = direction.copy().normalize().mult(10);
  this.vel.add(force);
  this.opacity -= 5;
  if (this.opacity < 0) this.opacity = 0;
};

Interact.prototype.update = function () {
  this.pos.add(this.vel);
  this.vel.add(this.acc);
  this.acc.mult(0);
};

Interact.prototype.show = function () {
  fill(this.color.levels[0], this.color.levels[1], this.color.levels[2], this.opacity);
  noStroke();
  ellipse(this.pos.x, this.pos.y, 16, 16);
};

Interact.prototype.behaviors = function () {
  let arrive = this.arrive(this.target);
  this.applyForce(arrive);
};

Interact.prototype.arrive = function (target) {
  let desired = p5.Vector.sub(target, this.pos);
  let distance = desired.mag();
  let speed = this.maxSpeed;
  if (distance < this.come) {
    speed = map(distance, 0, this.come, 0, this.maxSpeed);
  }
  desired.setMag(speed);
  let steer = p5.Vector.sub(desired, this.vel);
  return steer;
};

Interact.prototype.applyForce = function (f) {
  this.acc.add(f);
};

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
