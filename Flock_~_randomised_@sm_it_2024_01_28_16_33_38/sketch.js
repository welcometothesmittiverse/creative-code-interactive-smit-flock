let flock;
let source;
let canvas;
let message = "@sm___it";
let messageIndex = 0;
let customFont; // Variable to store the custom font

function preload() {
  // Load the custom font
  customFont = loadFont('UbuntuSans[wdth,wght].ttf'); // Replace with your font file
}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.style('display', 'block');
  cursor('crosshair'); // Set the cursor type
  background(255); // White background

  flock = new Flock();
  source = new Source(width / 2, height / 2);
}

function draw() {
  background(255);

  source.move();
  flock.run();
}

function mouseMoved() {
  flock.updateMouse(mouseX, mouseY);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(255);
}

// Boid class
class Boid {
  constructor(x, y, symbol) {
    this.position = createVector(x, y);
    this.velocity = p5.Vector.random2D();
    this.velocity.setMag(random(2, 4));
    this.acceleration = createVector();
    this.maxForce = 0.1;
    this.maxSpeed = 3;
    this.lifespan = 480; // 3 seconds at 60 frames per second
    this.symbol = symbol;
  }

  edges() {
    if (this.position.x > width) {
      this.position.x = 0;
    } else if (this.position.x < 0) {
      this.position.x = width;
    }

    if (this.position.y > height) {
      this.position.y = 0;
    } else if (this.position.y < 0) {
      this.position.y = height;
    }
  }

  align(boids) {
    let perceptionRadius = 50;
    let steering = createVector();
    let total = 0;

    for (let other of boids) {
      let d = dist(
        this.position.x,
        this.position.y,
        other.position.x,
        other.position.y
      );
      if (other != this && d < perceptionRadius) {
        steering.add(other.velocity);
        total++;
      }
    }

    if (total > 0) {
      steering.div(total);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }
    return steering;
  }

  flock(boids) {
    let alignment = this.align(boids);
    this.acceleration.add(alignment);
  }

  update() {
    this.position.add(this.velocity);
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.acceleration.mult(0);
    this.lifespan--;
  }

  show() {
    let size = 10;
    let alpha = map(this.lifespan, 0, 180, 0, 255);

  fill(0, 0, 0, alpha); // Set fill color (red)
  stroke(255, 255, 255, alpha); // Set stroke color (green)
    strokeWeight(1);
    textSize(size);
    textFont(customFont); // Set the custom font
    textAlign(CENTER, CENTER);
    text(this.symbol, this.position.x, this.position.y);
  }

  isDead() {
    return this.lifespan <= 0;
  }
}

// Source class
class Source {
  constructor(x, y) {
    this.position = createVector(x, y);
  }

  move() {
    this.position.x = noise(frameCount * 0.01) * width;
    this.position.y = noise(frameCount * 0.01 + 1000) * height;
  }
}

// Flock class
class Flock {
  constructor() {
    this.boids = [];
    this.targetBoidCount = message.length * 2; // Adjust to control the density
    this.boidCreationInterval = 0.5; // Create a new boid every 20 frames
    this.framesUntilNextBoid = this.boidCreationInterval;
  }

  run() {
    this.manageBoidCount();

    for (let i = this.boids.length - 1; i >= 0; i--) {
      let boid = this.boids[i];
      boid.edges();
      boid.flock(this.boids);
      boid.update();
      boid.show();

      if (boid.isDead()) {
        this.boids.splice(i, 1);
      }
    }
  }

  updateMouse(mx, my) {
    for (let boid of this.boids) {
      let d = dist(mx, my, boid.position.x, boid.position.y);
      if (d < 100) {
        let fleeVector = createVector(mx, my);
        fleeVector.sub(boid.position);
        fleeVector.setMag(2);
        fleeVector.mult(-1);
        boid.acceleration.add(fleeVector);
      }
    }
  }

  manageBoidCount() {
    this.framesUntilNextBoid--;
    if (this.framesUntilNextBoid <= 0) {
      this.boids.push(new Boid(source.position.x, source.position.y, message[messageIndex]));
      this.framesUntilNextBoid = this.boidCreationInterval;

      messageIndex++;
      if (messageIndex >= message.length) {
        messageIndex = 0; // Reset when the end of the message is reached
      }
    }
  }
}
