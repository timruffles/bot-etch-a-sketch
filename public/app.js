var $ = angular.element
var app = angular.module("bot",[])


app.controller("botControl",function($scope) {
  $scope.commands = []
  $scope.addCommand = function(cmd) {
    $scope.commands.push({ type: "move", path: cmd })
    $scope.$digest()
  }
  $scope.removeCommand = function(cmd) {
    $scope.commands = $scope.commands.filter(function(c) {
      return c != cmd;
    })
  }
  console.log($scope)
})

app.controller("commands",function($scope) {
})

app.directive("commandCanvas",function() {
  return function link(scope,el,attrs) {
    var command = [];
    var width;
    var height;
    var fading = false;

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
      fading = true
      el.addClass("fade")
      setTimeout(function() {
        ctx.clearRect(0,0,width,height)
        el.removeClass("fade")
        fading = false
      },500)
    }
    function lineStart(evt) {
      if(fading) return;
      var box = el[0].getBoundingClientRect()
      width = box.width
      height = box.height
      command = []
      ctx.beginPath()
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
      if(fading) return
      ctx.stroke();
      commandFinished()
      $(evt.target).unbind("mousemove",lineMove)
      command = []
    }
    function commandFinished() {
      if(fading || command.length < 2) return
      fadeOut();
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
