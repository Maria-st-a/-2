let font;
let tSize = 280; // Text Size
let tposX, tposY; // X and Y position of text
let pointCount = 4; // Increased sample factor to reduce the number of particles

let speed = 10; // Speed of the particles
let comebackSpeed = 100; // Lower the number, less interaction
let dia = 120; // Diameter of interaction
let randomPos = false; // Starting points
let pointsDirection = "up"; // Left, right, up, down general
let interactionDirection = 1; // -1 and 1

let textPoints = [];

function preload() {
  font = loadFont("AvenirNextLTPro-Demi.otf");
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Adjust text position relative to the window size
  tposX = width / 2 - tSize * 1.2;
  tposY = height / 2 - tSize / 2.5;

  textFont(font);

  let points = font.textToPoints("HEY?", tposX, tposY, tSize, {
    sampleFactor: pointCount, // This controls the number of points
  });

  // Initialize particles at the text points
  for (let i = 0; i < points.length; i++) {
    let pt = points[i];

    let textPoint = new Interact(
      pt.x,
      pt.y,
      speed,   // Keep the speed
      dia,
      randomPos,
      comebackSpeed,
      pointsDirection,
      interactionDirection
    );
    textPoints.push(textPoint);
  }
}

function draw() {
  background(0);

  // Update the position of each particle
  for (let i = 0; i < textPoints.length; i++) {
    let v = textPoints[i];
    v.update();
    v.show(); // Show the particle with the defined color and thickness
    v.behaviors();
  }
}

// Adjust particles' behavior and movement
function Interact(x, y, m, d, t, s, di, p) {
  if (t) {
    this.home = createVector(random(width), random(height));
  } else {
    this.home = createVector(x, y);
  }
  this.pos = this.home.copy();
  this.target = createVector(x, y);

  if (di == "general") {
    this.vel = createVector();
  } else if (di == "up") {
    this.vel = createVector(0, -y);
  } else if (di == "down") {
    this.vel = createVector(0, y);
  } else if (di == "left") {
    this.vel = createVector(-x, 0);
  } else if (di == "right") {
    this.vel = createVector(x, 0);
  }

  this.acc = createVector();
  this.r = 8;
  this.maxSpeed = m;
  this.maxforce = 1;
  this.dia = d;
  this.come = s;
  this.dir = p;

  // Set initial opacity and color for each particle
  this.opacity = 255;
  this.color = color(random(255), random(255), random(255)); // Random color for each point
}

Interact.prototype.behaviors = function () {
  let arrive = this.arrive(this.target);
  let mouse = createVector(mouseX, mouseY);
  let flee = this.flee(mouse);

  this.applyForce(arrive);
  this.applyForce(flee);
};

Interact.prototype.applyForce = function (f) {
  this.acc.add(f);
};

Interact.prototype.arrive = function (target) {
  let desired = p5.Vector.sub(target, this.pos);
  let d = desired.mag();
  let speed = this.maxSpeed;
  if (d < this.come) {
  