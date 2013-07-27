var Events = Backbone.Events;

function Bot(x,y) {
  this.angle = 0
  this.x = x
  this.y = y
}
var CIRCLE = 2 * Math.PI
Bot.prototype = {
  secondsToTurnACircle: 3,
  secondsPerPoint: 0.1,
  driveThroughPoints: function(points,cb) {
    var todo = points;
    var runPoint = function() {
      var p = todo.shift()
      var pointDone = function() {
        if(todo.length === 0) return cb()
        runPoint()
      }
      this.point(p.x,p.y,pointDone)
    }.bind(this)
    runPoint()
  },
  point: function(x,y,cb) {
    var rX = x - this.x
    var rY = y - this.y
    var angle = Math.atan2(rX,rY)
    var diff = angle - this.angle
    console.log("rotating to",diff)
    var sqr = function(x) { return x*x }
    var distance = Math.sqrt(sqr(Math.abs(rX - this.rX)) + sqr(Math.abs(rY - this.rY)))
    this.turn(diff,function() {
      this.angle = angle;
      console.log("new bearing",diff)
      this.drive(distance,function() {
        console.log("new position",x,y)
        this.x = x
        this.y = y
        cb()
      }.bind(this))
    }.bind(this))
  },
  turn: function(amount,cb) {
    var circles = amount / CIRCLE
    var direction = amount > 0 ? "clockwise" : "counterclockwise";
    this[direction]()
    setTimeout(function() {
      this.stop()
      cb()
    }.bind(this),circles * this.secondsToTurnACircle)
  },
  stop: function() {
    this.leftMotor("stop")
    this.rightMotor("stop")
  },
  clockwise: function() {
    this.leftMotor("forward")
    this.rightMotor("backward")
  },
  counterclockwise: function() {
    this.leftMotor("backward")
    this.rightMotor("forward")
  },
  forward: function() {
    this.leftMotor("forward")
    this.rightMotor("forward")
  },
  leftMotor: function(direction) {
    this.trigger("left",direction)
  },
  rightMotor: function(direction) {
    this.trigger("right",direction)
  },
  drive: function(distance,cb) {
    var duration = distance / this.secondsPerPoint
    this.forward();
    setTimeout(function() {
      this.stop()
      cb()
    },duration)
  }
}

_.extend(Bot.prototype,Events);

function BotModel(bot,x,y) {
  this.bearing = 0
  this.right = OFF
  this.left = OFF
  this.x = x
  this.y = y
  var switcher = function(side) {
    return function(direction) {
      this[side] = direction
    }.bind(this)
  }.bind(this)
  bot.on("left",switcher("left"))
  bot.on("right",switcher("right"))
}
var SECOND = 1000;
var OFF = "stop"
var FORWARD = "forward"
var BACKWARD = "backward"

BotModel.prototype = {
  radiansPerSecond: CIRCLE / 8,
  pointsPerSecond: 100,
  tick: function(tickMillseconds) {
    if(this.left == OFF && this.right == OFF) return
    var tickSecondRatio = tickMillseconds / 1000
    if(this.left == FORWARD && this.right == FORWARD) {
      this.x += Math.cos(this.bearing) * this.pointsPerSecond * tickSecondRatio
      this.y += Math.sin(this.bearing) * this.pointsPerSecond * tickSecondRatio
      return
    }
    if(this.left == FORWARD && this.right == BACKWARD) {
      return this.bearing += this.radiansPerSecond * tickSecondRatio
    }
    if(this.left == BACKWARD && this.right == FORWARD) {
      return this.bearing += this.radiansPerSecond * tickSecondRatio
    }
    throw new Error("Can't model one wheel turning")
  }  
}


