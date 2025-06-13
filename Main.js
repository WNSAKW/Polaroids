let canvasW = 400;
let canvasH = 500;
let photoX = 50;
let photoY = 50;
let photoW = 300;
let photoH = 300;
let bg;
let brush; // Brush instance
let maxBrushCount = 10000; // Define maxBrushCount in global scope
let themes = [];
let theme;
let rainEffect; // RainEffect instance
let filters = [];
let selectedFilter;
let signImg;
let pg; // Graphics buffer for the drawing area
let polaroidText; // PolaroidText instance
let saveButton; // Save button

// Brush class definition
class Brush {
  constructor(photoW, photoH, maxBrushCount) {
    this.photoW = photoW;
    this.photoH = photoH;
    this.maxBrushCount = maxBrushCount;
    this.brushCount = 0;
    this.brushPos = createVector(random(0, photoW), random(0, photoH));
    this.brushDir = createVector(random([-1, 1]) * random(3, 6), 0); // Horizontal movement only
  }

  // Draw a single brush stroke on the graphics buffer
  drawStroke(pg, theme) {
    if (this.brushCount > this.maxBrushCount) return false;

    pg.push();
    let y = this.brushPos.y;
    let lerpAmt = pg.map(y, 0, this.photoH, 0, 1);
    let col;

    if (y < this.photoH * 0.3) {
      col = pg.lerpColor(theme.skyStart, theme.skyEnd, lerpAmt * 3);
    } else if (y < this.photoH * 0.5) {
      col = theme.horizon;
    } else {
      col = pg.lerpColor(theme.groundStart, theme.groundEnd, (lerpAmt - 0.5) * 2);
    }

    let alpha = random(50, 100);
    pg.fill(pg.red(col), pg.green(col), pg.blue(col), alpha);
    let size = random(15, 20);
    pg.ellipse(this.brushPos.x, this.brushPos.y, size, size * 2);
    pg.pop();

    this.brushCount++;
    return true;
  }

  // Update brush position
  update() {
    this.brushPos.add(this.brushDir);

    // Reset position if outside photo area
    if (
      this.brushPos.x < 0 || this.brushPos.x > this.photoW ||
      this.brushPos.y < 0 || this.brushPos.y > this.photoH
    ) {
      this.brushPos = createVector(random(0, this.photoW), random(0, this.photoH));
      let direction = random([-1, 1]);
      this.brushDir = createVector(direction * random(3, 6), 0);
    }
  }

  // Check if brush has reached max count
  isFinished() {
    return this.brushCount > this.maxBrushCount;
  }
}

// Theme class definition
class Theme {
  constructor(name, skyStart, skyEnd, horizon, groundStart, groundEnd) {
    this.name = name;
    this.skyStart = skyStart;
    this.skyEnd = skyEnd;
    this.horizon = horizon;
    this.groundStart = groundStart;
    this.groundEnd = groundEnd;
  }

  static getAllThemes() {
    return [
      new Theme("Grassland", color(135, 206, 250), color(255, 255, 255), color(220, 240, 200), color(60, 180, 75), color(0, 100, 0)),
      new Theme("Sunset", color(255, 100, 50), color(255, 200, 150), color(255, 180, 100), color(70, 130, 180), color(30, 90, 160)),
      new Theme("Spring", color(255, 220, 250), color(255, 255, 255), color(255, 200, 230), color(150, 230, 150), color(100, 200, 100)),
      new Theme("Winter", color(180, 220, 255), color(255, 240, 250), color(255, 250, 255), color(240, 240, 255), color(220, 220, 240)),
      new Theme("FoggyForest", color(200, 220, 220), color(230, 240, 240), color(180, 200, 60)), color(90, 110, 90), color(50, 180, 60)),
      new Theme("Forest", color(180, 220, 200), color(210, 240, 230), color(140, 180, 30), color(60, 100, 60), color(30, 70, 30)),
      new Theme("Lakeside", color(170, 220, 255), color(240, 255, 255), color(180, 230, 250), color(100, 180, 200), color(50, 130, 160)),
      new Theme("SunriseDew", color(255, 182, 193), color(255, 228, 181), color(240, 230, 140), color(34, 139, 34), color(0, 100, 0)),
      new Theme("Overcast", color(150, 150, 170), color(200, 200, 210), color(180, 180, 190), color(80, 100, 80), color(50, 70, 50)),
      new Theme("UrbanTwilight", color(148, 0, 211), color(255, 140, 0), color(199, 21, 133), color(70, 70, 90), color(30, 30, 50)),
      new Theme("FlowerField", color(255, 230, 240), color(240, 248, 255), color(255, 182, 193), color(255, 105, 180), color(124, 252, 0)),
      new Theme("DaytimeCity", color(135, 206, 235), color(240, 255, 255), color(200, 220, 230), color(100, 100, 120), color(60, 60, 80)),
      new Theme("Thunder&Lightning", color(75, 0, 130), color(128, 128, 128), color(105, 105, 105), color(60, 50, 70), color(30, 20, 40)),
      new Theme("DaytimeBeach", color(100, 149, 237), color(240, 248, 255), color(173, 216, 230), color(245, 222, 179), color(210, 180, 140)),
      new Theme("PinkBeach", color(255, 192, 203), color(255, 245, 238), color(255, 182, 193), color(245, 222, 179), color(210, 180, 140)),
      new Theme("MistyClouds", color(211, 211, 211), color(245, 245, 220), color(230, 230, 250), color(169, 169, 169), color(128, 128, 128)),
      new Theme("CrowdedPeople", color(176, 196, 222), color(245, 245, 220), color(211, 211, 211), color(105, 105, 105), color(255, 99, 71)),
      new Theme("UrbanTraffic", color(65, 105, 225), color(138, 43, 226), color(148, 0, 211), color(47, 79, 79), color(25, 25, 112))
    ];
  }
}

// Filter class definition
class Filter {
  constructor(name, type, param = null) {
    this.name = name;
    this.type = type;
    this.param = param;
  }

  // Static method to get all predefined filters
  static getAllFilters() {
    return [
      new Filter("None", null),
      new Filter("Blur3", BLUR, 3), //模糊3
      new Filter("Blur6", BLUR, 6), //模糊6
      new Filter("Grayscale", GRAY), //灰階
      new Filter("Invert", INVERT), //顏色反轉
      new Filter("Posterize2", POSTERIZE, 2), //色調分離2
      new Filter("Posterize4", POSTERIZE, 4), //色調分離4
      new Filter("Threshold", THRESHOLD) //黑白
    ];
  }
}

// RainEffect class definition
class RainEffect {
  constructor(photoW, photoH, numDroplets = 60, numStreaks = 12) {
    this.photoW = photoW;
    this.photoH = photoH;
    this.numDroplets = numDroplets;
    this.numStreaks = numStreaks;
    this.droplets = [];
    this.streaks = [];
    this.drawn = false;
    this.noiseSeed = random(1000); // Unique noise seed for consistent randomness
    this.generateDroplets();
    this.generateStreaks();
  }

  // Generate random water droplets, some clustered
  generateDroplets() {
    for (let i = 0; i < this.numDroplets; i++) {
      let x = random(0, this.photoW);
      let y = random(0, this.photoH);
      let size = random(2, 10); // Varied droplet sizes
      let isClustered = random() > 0.6; // 40% chance to cluster
      let clusterOffsetX = isClustered ? random(-12, 12) : 0;
      let clusterOffsetY = isClustered ? random(-12, 12) : 0;
      let opacity = random(60, 140); // Slightly higher opacity for visibility
      this.droplets.push({ x: x + clusterOffsetX, y: y + clusterOffsetY, size, opacity });
    }
  }

  // Generate random rain streaks
  generateStreaks() {
    for (let i = 0; i < this.numStreaks; i++) {
      let x = random(0, this.photoW);
      let yStart = random(-this.photoH * 0.2, this.photoH * 0.2); // Start higher
      let length = random(this.photoH * 0.4, this.photoH * 0.8); // Longer trails
      let angle = random(-PI / 8, PI / 8); // Slight tilt for natural flow
      let thickness = random(0.5, 1.8); // Thin, liquid-like streaks
      let baseOpacity = random(80, 150); // Stronger presence
      this.streaks.push({ x, yStart, length, angle, thickness, baseOpacity, noiseOffset: random(1000) });
    }
  }

  // Draw droplets and streaks on the graphics buffer
  draw(pg) {
    pg.push();
    noiseSeed(this.noiseSeed); // Set consistent noise seed

    // Draw droplets
    for (let droplet of this.droplets) {
      pg.fill(210, 230, 255, droplet.opacity); // Bluish, glass-like color
      pg.noStroke();
      pg.ellipse(droplet.x, droplet.y, droplet.size, droplet.size * 1.2); // Slightly oval
    }

    // Draw streaks
    pg.noFill();
    for (let streak of this.streaks) {
      pg.beginShape();
      let steps = 20; // More points for smoother, winding paths
      for (let i = 0; i <= steps; i++) {
        let t = i / steps;
        let y = streak.yStart + t * streak.length;
        // Winding path inspired by reference code's Perlin noise
        let offsetX = noise(streak.noiseOffset + y * 0.02) * 20 - 10; // Larger amplitude for curves
        let x = streak.x + cos(streak.angle) * t * streak.length + offsetX;
        let opacity = streak.baseOpacity * (1 - t * 0.7); // Gradual fade
        let thickness = streak.thickness * (1 - t * 0.6); // Pronounced tapering
        pg.stroke(210, 230, 255, opacity); // Bluish, liquid-like
        pg.strokeWeight(thickness);
        pg.vertex(x, y);
      }
      pg.endShape();

      // Add droplet at streak end
      let endX = streak.x + cos(streak.angle) * streak.length;
      let endY = streak.yStart + streak.length;
      pg.fill(210, 230, 255, streak.baseOpacity * 0.9);
      pg.noStroke();
      pg.ellipse(endX, endY, 5, 6); // Slightly larger droplet
    }

    pg.pop();
  }
}

// PolaroidText class definition
class PolaroidText {
  constructor(themeName, filterName) {
    this.themeName = themeName;
    this.filterName = filterName;
    this.monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  }

  // Get formatted date and time string
  getDateTime() {
    let currentMonth = this.monthNames[month() - 1];
    let currentDay = nf(day(), 2);
    let currentYear = year();
    let currentHours = nf(hour(), 2);
    let currentMinutes = nf(minute(), 2);
    return `${currentMonth}.${currentDay},${currentYear} ${currentHours}:${currentMinutes}`;
  }

  // Display text on canvas
  display() {
    fill(80);
    textSize(16);
    text(`《 ${this.themeName} 》`, canvasW / 2, canvasH - 70);
    text(this.filterName, canvasW / 2, canvasH - 50);
    text(this.getDateTime(), canvasW / 2, canvasH - 30);
  }
}

function preload() {
  bg = loadImage("canvas.png");
  signImg = loadImage("sign.png");
}

function setup() {
  createCanvas(canvasW, canvasH);
  // Create save button
  saveButton = createButton('Save Image');
  saveButton.position(canvasW / 2 - 50, canvasH + 10); // Centered below canvas
  saveButton.mousePressed(saveCanvasImage);
  saveButton.style('font-size', '16px');
  saveButton.style('padding', '5px 15px');
  saveButton.hide(); // Hide button initially
  reset(); // Initialize everything
}

function reset() {
  pg = createGraphics(photoW, photoH); // Recreate graphics buffer

  // Initialize themes and filters
  themes = Theme.getAllThemes();
  filters = Filter.getAllFilters();

  // Draw background
  image(bg, 0, 0, width, height);

  // Select random theme and filter
  theme = random(themes);
  selectedFilter = random(filters);

  // Initialize PolaroidText
  polaroidText = new PolaroidText(theme.name, selectedFilter.name);

  // Initialize Brush
  brush = new Brush(photoW, photoH, maxBrushCount);

  // Initialize RainEffect
  rainEffect = new RainEffect(photoW, photoH);

  // Add oil painting canvas texture using Perlin noise to the graphics buffer
  pg.noiseDetail(4, 0.5);
  for (let x = 0; x < photoW; x++) {
    for (let y = 0; y < photoH; y++) {
      let noiseVal = pg.noise(x * 0.02, y * 0.02);
      let gray = pg.map(noiseVal, 0, 1, 220, 255);
      pg.stroke(gray, 30);
      pg.point(x, y);
    }
  }
  pg.noStroke();

  textAlign(CENTER, CENTER);
  textFont('Georgia');
  textStyle(ITALIC);

  saveButton.hide(); // Hide save button until image is generated
  loop(); // Restart draw loop
}

function saveCanvasImage() {
  // Save the entire canvas with a timestamped filename
  let timestamp = nf(year(), 4) + nf(month(), 2) + nf(day(), 2) + '_' + nf(hour(), 2) + nf(minute(), 2) + nf(second(), 2);
  saveCanvas(`polaroid_${timestamp}`, 'png');
}

function mouseClicked() {
  // Check if click is within Polaroid area
  if (
    mouseX >= photoX &&
    mouseX <= photoX + photoW &&
    mouseY >= photoY &&
    mouseY <= photoY + photoH
  ) {
    reset(); // Regenerate new image
  }
}

function draw() {
  if (brush.isFinished()) {
    // Draw rain effect before applying filter
    if (!rainEffect.drawn) {
      rainEffect.draw(pg);
      rainEffect.drawn = true;
    } else {
      // Apply selected filter to the graphics buffer
      if (selectedFilter.type) {
        if (selectedFilter.param) {
          pg.filter(selectedFilter.type, selectedFilter.param);
        } else {
          pg.filter(selectedFilter.type);
        }
      }

      // Draw the filtered graphics buffer onto the main canvas
      image(pg, photoX, photoY);

      // Draw sign.png centered on the canvas
      image(signImg, 0, 0, canvasW, canvasH);

      // Display text using PolaroidText
      polaroidText.display();

      // Show save button when image is fully generated
      saveButton.show();

      noLoop(); // Stop drawing until next reset
      return;
    }
  } else {
    // Draw brush stroke and update position
    brush.drawStroke(pg, theme);
    brush.update();
  }

  // Continuously draw the graphics buffer to the main canvas during painting
  image(pg, photoX, photoY);
}
