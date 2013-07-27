app = angular.module("bot",[])

app.controller("botControl",function($scope) {
  $scope.addCommand = function() {
  }
})

app.controller("commands",function($scope) {
  $scope.commands = [{path: "fooby"}]
})

app.directive("commandCanvas",function() {
  return function(scope,el,attrs) {
  }
})

app.directive("minimap",function() {
  return function(scope,el,attrs) {
    var path;

    el.html( scope.$eval("command.path") )
  }
})
