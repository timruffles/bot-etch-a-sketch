var $ = angular.element
var app = angular.module("bot",[])


app.controller("botControl",function($scope) {
  $scope.commands = []
  $scope.bot = new Bot(0,0)
  $scope.addCommand = function(cmd) {
    $scope.commands.push({ type: "move", path: cmd })
    $scope.$digest()
  }
  $scope.removeCommand = function(cmd) {
    $scope.commands = $scope.commands.filter(function(c) {
      return c != cmd;
    })
    $scope.$digest()
  }
  $scope.commandDone = function(cmd) {
    $scope.removeCommand(cmd)
  }
})

app.controller("commands",function($scope) {
})

app.directive("commandCanvas",function() {
  return function link(scope,el,attrs) {
    var command = [];
    var width;
    var height;
    var fading = false;
    var started = false;

    ctx = el[0].getContext("2d")
    el.bind("mousedown",lineStart)
    el.bind("mouseup",lineEnd)
    el.bind("mouseout",lineEnd)
    ctx.strokeStyle = "blue"
    ctx.lineWidth = 4

    function coordsToRatios(points) {
      return points.map(function(p) {
        return {x: p.x/width, y: p.y/height }
      })
    }
    function normaliseCoords(evt) {
      return {x: evt.offsetX, y: evt.offsetY}
    }
    function fadeOut() {
      if(fading) return
      fading = true;
      el.addClass("fade");
      setTimeout(function() {
        ctx.clearRect(0,0,width,height)
        el.removeClass("fade")
        fading = false
      },500);
    }
    function lineStart(evt) {
      if(fading) return;
      started = true;
      el.find(".draw-me").css("display","none");
      ctx.clearRect(0,0,width,height)
      ctx.beginPath()
      var box = el[0].getBoundingClientRect()
      width = box.width
      height = box.height
      command = []
      var normed = normaliseCoords(evt)
      ctx.moveTo(normed.x,normed.y)
      command.push(normed)
      $(evt.target).bind("mousemove",lineMove)
    }
    function lineMove(evt) {
      if(fading) return
      var normed = normaliseCoords(evt)
      ctx.lineTo(normed.x,normed.y)
      command.push(normed)
      ctx.stroke()
    }
    function lineEnd(evt) {
      if(fading || !started) return
      started = false;
      ctx.stroke();
      commandFinished()
      fadeOut();
      $(evt.target).unbind("mousemove",lineMove)
      command = []
    }
    function commandFinished() {
      if(command.length < 2) return command = [];
      scope.command = coordsToRatios(command)
      scope.$eval( attrs.onpath )
      command = []
    }
  }
})

app.directive("minimap",function() {

  var width;
  var height;

  function drawPath(ctx,points) {
    ctx.strokeStyle = "blue"
    ctx.beginPath()
    points.forEach(function(p,i) {
      ctx[i === 0 ? "moveTo" : "lineTo"](p.x * width,p.y * height)
    })
    ctx.stroke()
  }

  function link(scope,el,attrs) {
    var ctx = el[0].getContext("2d")
    var box = el[0].getBoundingClientRect()
    width = box.width
    height = box.height
    drawPath(ctx,scope.$eval("command.path"))
  }

  return {
    link: link
  }
})

app.directive("botCanvas",function() {
  return function(scope,el,attrs) {
    var ctx = el[0].getContext("2d")
    var box = el[0].getBoundingClientRect()

    ctx.fillStyle = "red"
    ctx.strokeStyle = "red"
    ctx.lineWidth = 2

    var n;
    var normalisedOrigin = n = {x: box.width/2,y: box.height/2}

    var bot = scope.$eval(attrs.bot)
    var model = new BotModel(bot,n.x,n.y)

    var lastTime = Date.now()
    var tickMilli = 200;

    scope.$watch(attrs.commands,function(cmds) {
      if(!scope.currentCommand && cmds.length > 0) {
        scope.currentCommand = cmds[0]
        runCommand(cmds[0])
      }
    },true)

    function normalise(points) {
      return points.map(function(p) {
        return {x:p.x * box.width, y: p.y*box.height}
      })
    }

    function runCommand(cmd) {
      bot.driveThroughPoints(normalise(cmd.path),function() {
        scope.currentCommand = cmd
        scope.$eval(attrs.ondone)
        console.log("DONE",cmd)
        setTimeout(function() {
          scope.currentCommand = false;
        },500)
      })
    }

    var loop = function() {
      var now = Date.now()
      var diff = now - lastTime;
      model.tick(diff)
      lastTime = now
      setTimeout(loop,tickMilli);
      draw();
    }
    loop();

    function draw() {
      ctx.clearRect(0,0,box.width,box.height);

      ctx.beginPath()
      var r = 5
      ctx.arc(model.x,model.y,r,0,CIRCLE)
      ctx.fill()
      ctx.stroke()

      var bX = model.x + Math.cos(model.bearing) * r
      var bY = model.y + Math.sin(model.bearing) * r

      ctx.beginPath()
      ctx.moveTo(bX,bY)

      var length = 5

      var eX = model.x + Math.cos(model.bearing) * (r + length)
      var eY = model.y + Math.sin(model.bearing) * (r + length)

      ctx.lineTo(eX,eY)

      ctx.stroke()

    }
    
  }
})
