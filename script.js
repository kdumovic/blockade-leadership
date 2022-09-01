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

const teamNamesToGDocsUrl = {
  'Marguerite': 'https://docs.google.com/document/d/1pZGEJ7EXhw2hQna9AU5IkVoHtRhjgYIiFk7NHBurl-E',
  'Diego': 'https://docs.google.com/document/d/1q-8UuLGodUCtlKqqzbpeK1L5I_OeOfqWhz23Zw2pKm4',
  'Ben': 'https://docs.google.com/document/d/1DsF5sBvg58fTDU6JzEUPl7UagoFWJ2cfSFOC79JLwxo',
  'Kyle': 'https://docs.google.com/document/d/1Clunu6zmR6D-eyT-NMvvzfxOoPq9q9bb8CrzPImFW0c/',
  'Garrett': 'https://docs.google.com/document/d/1VQ_34_4rwJbO9ARale5uJYaNPW8ii6d7FsecsJ222Vs',
  'Charles': 'https://docs.google.com/document/d/1vVhbnKMYY7V-iZo6BSad9TuWThJFShsrw039-pW4luU',
};

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
  this.x = x;
  this.y = y;
  this.r = r;
  this.width = r;
  this.height = r/2.5;
  this.fillColor = fillColor || '#000';
  this.strokeColor = strokeColor || '#404040';
  this.selected = false;
  this.underCursor = false;
}

Point.prototype.draw = function(ctx) {
  ctx.beginPath();
  // ctx.arc(this.x, this.y, 6, 0, 2 * Math.PI, false);
  ctx.rect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);

  ctx.fillStyle = this.fillColor;
  ctx.lineWidth = 2;
  ctx.strokeStyle = this.strokeColor;
 
  if (this.selected) {
    ctx.strokeStyle = '#fff';
    ctx.fillStyle = '#fff';
  }
  if (this.underCursor) {
    ctx.strokeStyle = '#20c895';
    ctx.fillStyle = '#20c895';
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
  const a = 2 * Math.PI / teamNames.length;
  var x = HEX_RADIUS;
  var y = HEX_RADIUS;
  var size = HEX_RADIUS;
  for (var i = 0; i < teamNames.length; i++) {
    var xCoord = x + size * Math.cos(i * a);
    var yCoord = y + size * Math.sin(i * a);
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
    points[key].underCursor = false;
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

function coordsInBoundsOfPoint(x, y) { // return name if true, otherwise false
  for (var key in points) { // iterate over each point
    var point = points[key];
    let dx = point.width/2;
    let dy = point.height/2;
    if ((x > point.x+100-dx) && (x < point.x+100+dx) && (y > point.y-dy) && (y < point.y+dy)) { //+100 because of a weird off by 100px error...
      return point.id;
    }
  }
  return false;
}

function openInNewTab(url) {
 window.open(url, '_blank').focus();
}

document.addEventListener('click', function(e) {
  const rect = canvas.getBoundingClientRect()
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  var nameUnderCursor = coordsInBoundsOfPoint(mouseX, mouseY);
  if (nameUnderCursor) {
    openInNewTab(teamNamesToGDocsUrl[nameUnderCursor]);
  }
});

document.addEventListener('mousemove', function(e) {
  const rect = canvas.getBoundingClientRect()
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
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
  document.body.style.cursor = 'default';
  closestPoint.selected = true;
  var nameUnderCursor = coordsInBoundsOfPoint(mouseX, mouseY);
  if (nameUnderCursor) {
    points[nameUnderCursor].underCursor = true;
    document.body.style.cursor = 'pointer';
  }
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  draw();
});

function init() {
  initializePoints();
  initializeBackground();
  draw();
}
init();