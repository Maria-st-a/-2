let font;
let tSize = 280; // Text Size
let tposX = 280; // X position of text
let tposY = 280; // Y position of text
let pointCount = 0.1; // Reduced Point count for fewer particles

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
  
  tposX = width / 2 - tSize * 1.2;
  tposY = height / 2 - tSize / 2.5;
  
  textFont(font);

  let points = font.textToPoints("HEY?", tposX, tposY, tSize, {
    sampleFactor: pointCount, // Reduced sample factor
  });

  // Initialize particles at the text points
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
    speed = map(d, 0, this.come, 0, this.maxSpeed);
  }
  desired.setMag(speed);
  let steer = p5.Vector.sub(desired, this.vel);
  return steer;
};

Interact.prototype.flee = function (target) {
  let desired = p5.Vector.sub(target, this.pos);
  let d = desired.mag();

  if (d < this.dia) {
    desired.setMag(this.maxSpeed);
    desired.mult(this.dir);
    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxForce);
    return steer;
  } else {
    return createVector(0, 0);
  }
};

// Function to change opacity based on mouse distance
Interact.prototype.changeOpacity = function (mx, my) {
  let mousePos = createVector(mx, my);
  let d = dist(this.pos.x, this.pos.y, mousePos.x, mousePos.y);

  // Check if the particle is within interaction distance
  if (d < this.dia) {
    // Gradually reduce opacity as it gets closer to the mouse
    this.opacity = map(d, 0, this.dia, 255, 50); // 255 = fully visible, 50 = less visible
  } else {
    // Restore opacity to full when the mouse is away
    this.opacity = 255;
  }
};

Interact.prototype.update = function () {
  this.pos.add(this.vel);
  this.vel.add(this.acc);
  this.acc.mult(0);
};

Interact.prototype.show = function () {
  // Set the fill color with the opacity
  fill(this.color.levels[0], this.color.levels[1], this.color.levels[2], this.opacity);
  noStroke();  // Remove stroke for a solid fill

  // Use original size for the circles
  ellipse(this.pos.x, this.pos.y, 16, 16); // Use the original circle size
};

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
