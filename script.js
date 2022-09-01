const canvas = document.getElementById('canvas');
canvas.width = 2200;
canvas.height = 2200;
canvas.style.width = "1100px";
canvas.style.height = "1100px";
const ctx = canvas.getContext('2d');
ctx.translate(200, 0);
ctx.scale(2,2);

const HEX_RADIUS = 450;
const POINT_RADIUS = 120;
var selectedPointName = 'Marguerite';

const teamNames = [
  'Marguerite',
  'Diego',
  'Ben',
  'Kyle',
  'Garrett',
  'Charles'
];

const a = 2 * Math.PI / teamNames.length;

const connectionText = {
  'Marguerite': {
    'Marguerite': null,
    'Ben': 'Translate business requirements into product roadmap',
    'Kyle': 'Operations counterpart, biz dev partner, co-execute company vision',
    'Garrett': 'Co-creating AND creative vision (thought partners)',
    'Diego': 'Artistic brainstorming',
    'Charles': 'Fundraising & Budget review',
  },
  'Ben': {
    'Marguerite': 'Translate business requirements into product roadmap',
    'Ben': null,
    'Kyle': 'Product goals, roadmap & ND MVP reqs',
    'Garrett': 'Develop engineering action items around creative vision',
    'Diego': null,
    'Charles': 'Offboard & organize Blockade\'s financial backlog',
  },
  'Kyle': {
    'Marguerite': 'Operations counterpart, biz dev partner, co-execute company vision',
    'Ben': 'Product goals, roadmap & ND MVP reqs',
    'Kyle': null,
    'Garrett': 'Creative process + product collab',
    'Diego': 'Artistic process management',
    'Charles': 'Operations & process partner, delegate overlapping responsibilities',
  },
  'Garrett': {
    'Marguerite': 'Co-creating AND creative vision (thought partners)',
    'Ben': 'Develop engineering action items around creative vision',
    'Kyle': 'Creative process + product collab',
    'Garrett': null,
    'Diego': 'Creative direction + art team management',
    'Charles': null,
  },
  'Diego': {
    'Marguerite': 'Artistic brainstorming',
    'Ben': null,
    'Kyle': 'Artistic process management',
    'Garrett': 'Creative direction + art team management',
    'Diego': null,
    'Charles': null,
  },
  'Charles': {
    'Marguerite': 'Fundraising & Budget review',
    'Ben': 'Offboard & organize Blockade\'s financial backlog',
    'Kyle': 'Operations & process partner, delegate overlapping responsibilities',
    'Garrett': null,
    'Diego': null,
    'Charles': null,
  },
}

var points = {};
var pointNameToConnections = {};

var Point = function(id, x, y, r, fillColor, strokeColor) {
  this.id = id;
  this.x= x;
  this.y= y;
  this.r = r;
  this.fillColor = fillColor || '#000';
  this.strokeColor = strokeColor || '#404040';
  this.selected = false;
}

Point.prototype.draw = function(ctx) {
  ctx.beginPath();
  //ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false);
  var rectWidth = this.r;
  var rectHeight = this.r/2.5;
  ctx.rect(this.x - rectWidth/2, this.y - rectHeight/2, rectWidth, rectHeight);
  ctx.fillStyle = this.fillColor;
  ctx.lineWidth = 2;
  ctx.strokeStyle = this.strokeColor;
 
  if (this.selected) {
    ctx.strokeStyle = '#fff';
    ctx.fillStyle = '#fff';
  }
  ctx.fill();
  ctx.stroke();
  
  // add label
  ctx.font = '18px Space Grotesk';
  ctx.fillStyle = 'white';
  if (this.selected) {
    ctx.fillStyle = '#000';
  }
  ctx.textAlign = 'center';
  ctx.fillText(this.id, this.x, this.y+5);
}

function drawLabel (ctx, connection, alignment, padding) {
  if (!alignment) alignment = 'center';
  if (!padding) padding = 0;
  
  var text = connection.labelText;

  var p1 = {'x': connection.startX, 'y': connection.startY};
  var p2 = {'x': connection.endX, 'y': connection.endY};
  
  var dx = p2.x - p1.x;
  var dy = p2.y - p1.y;  
  
  // Keep text upright
  var angle = Math.atan2(dy,dx);
  if (angle < -Math.PI/2 || angle > Math.PI/2){
    var p = p1;
    p1 = p2;
    p2 = p;
    dx *= -1;
    dy *= -1;
    angle -= Math.PI;
  }
  
  var p, pad;
  if (alignment=='center'){
    p = p1;
    pad = 1/2;
  } else {
    var left = alignment=='left';
    p = left ? p1 : p2;
    pad = padding / Math.sqrt(dx*dx+dy*dy) * (left ? 1 : -1);
  }

  ctx.save();
  ctx.textAlign = alignment;
  ctx.textBaseline = 'bottom';
  ctx.translate(p.x+dx*pad,p.y+dy*pad);
  ctx.rotate(angle);
  ctx.font = "18px Space Grotesk";
  ctx.fillStyle = '#fff';
  ctx.fillText(text,0,0);
  ctx.restore();
}

var Connection = function(fromPoint, toPoint, strokeColor) {
  this.id = fromPoint.id + '-' + toPoint.id;
  this.fromName = fromPoint.id;
  this.toName = toPoint.id;
  this.labelText = connectionText[fromPoint.id][toPoint.id];
  this.startX= fromPoint.x;
  this.startY= fromPoint.y;
  this.endX = toPoint.x;
  this.endY = toPoint.y;
  this.strokeColor = strokeColor || '#404040';
  this.selected = false;
}

Connection.prototype.draw = function(ctx) {
  ctx.beginPath();
  ctx.moveTo(this.startX, this.startY);
  ctx.lineTo(this.endX, this.endY);
  ctx.lineWidth = 2;
  ctx.strokeStyle = this.strokeColor;
  if (this.selected) {
    ctx.strokeStyle = '#fff';
  }
  ctx.stroke();
}

function initializePoints() {
  var initX = HEX_RADIUS;
  var initY = HEX_RADIUS;
  for (var i = 0; i < teamNames.length; i++) {
    var xCoord = initX + initX * Math.cos(a * i);
    var yCoord = initY + initY * Math.sin(a * i);
    var point = new Point(teamNames[i], xCoord, yCoord, POINT_RADIUS);
    points[teamNames[i]] = point;
  }
}

function drawPoints() {
  for (var key in points) {
    points[key].draw(ctx);
  }
}

function initializeBackground() {
  for (var fromKey in points) { // for each point
    var fromPoint = points[fromKey];
    for (var toKey in points) {
      var toPoint = points[toKey];
      if (fromPoint.id == toPoint.id) continue;
      // draw to each other point
      var connection = new Connection(fromPoint, toPoint);
      if (!pointNameToConnections[fromPoint.id]) pointNameToConnections[fromPoint.id] = [];
      pointNameToConnections[fromPoint.id].push(connection);
      if (fromPoint.selected) connection.selected = true;
      connection.draw(ctx);
    }
  }
}

function drawBackground() {
  for (var key in pointNameToConnections) {
    for (var i = 0; i < pointNameToConnections[key].length; i++) {
      var connection = pointNameToConnections[key][i];
      connection.draw(ctx);
    }
  } 
}

function drawSelected() {
  points[selectedPointName].selected = true;
  points[selectedPointName].draw(ctx);
  
  var selectedConnections = pointNameToConnections[selectedPointName];
  for (var i = 0; i < selectedConnections.length; i++) {
    var connection = selectedConnections[i];
    if (connection.labelText) {
      connection.selected = true;
      connection.draw(ctx);
      drawLabel(ctx, connection);
    }
  }
}

function resetSelected() {
  for (var key in points) {
    points[key].selected = false;
    var connectionsFromPoint = pointNameToConnections[key];
    for (var i = 0; i < connectionsFromPoint.length; i++) {
      var connection = connectionsFromPoint[i];
      connection.selected = false;
    }
  }
}

function draw() {
  drawBackground();
  drawSelected();
  drawPoints();
}

document.addEventListener('mousemove', function(e) {
  const rect = canvas.getBoundingClientRect()
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;
  //console.log("x: " + mouseX + " y: " + mouseY);
  //console.log(e.pageX, e.pageY);
  
  let closestPoint = null;
  let distance = Infinity;
  for (var key in points) {
    let pointX = points[key].x;
    let pointY = points[key].y;
    let d = Math.sqrt((mouseX - pointX) ** 2 + (mouseY - pointY) ** 2);
    if (d < distance) {
      closestPoint = points[key];
      selectedPointName = points[key].id;
      distance = d;
    }
  }
  
  resetSelected();
  closestPoint.selected = true;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  draw();
});

function init() {
  initializePoints();
  initializeBackground();
  draw();
}
init();