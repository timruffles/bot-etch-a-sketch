var $ = angular.element
var app = angular.module("bot",[])


app.controller("botControl",function($scope) {
  $scope.commands = []
  $scope.addCommand = function(cmd) {
    $scope.commands.push({ type: "move", path: cmd })
    $scope.$digest()
  }
})

app.controller("commands",function($scope) {
})

app.directive("commandCanvas",function() {
  return function link(scope,el,attrs) {
    var command;
    var width;
    var height;

    ctx = el[0].getContext("2d")
    el.bind("mousedown",lineStart)
    el.bind("mouseup",lineEnd)
    ctx.strokeStyle = "red"

    function coordsToRatios(points) {
      return points.map(function(p) {
        return {x: p.x/width, y: p.y/height }
      })
    }
    function normaliseCoords(evt) {
      return {x: evt.offsetX, y: evt.offsetY}
    }
    function lineStart(evt) {
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
      var normed = normaliseCoords(evt)
      ctx.lineTo(normed.x,normed.y)
      command.push(normed)
      ctx.stroke()
    }
    function lineEnd(evt) {
      ctx.stroke();
      commandFinished(commandFinished)
      $(evt.target).unbind("mousemove",lineMove)
    }
    function commandFinished() {
      scope.command = coordsToRatios(command)
      scope.$eval( attrs.onpath )
    }
  }
})

app.directive("minimap",function() {

  var width;
  var height;

  function drawPath(ctx,points) {
    ctx.strokeStyle = "red"
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
