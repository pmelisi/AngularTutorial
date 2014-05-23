var TodoApp = angular.module("TodoApp", ["ngResource", "ngRoute"]).
    config(function ($routeProvider) {
        $routeProvider.
            when('/', { controller: ListCtrl, templateUrl: 'list.html' }).
            when('/new', { controller: CreateCtrl, templateUrl: 'details.html' }).
            when('/edit/:editId', { controller: EditCtrl, templateUrl: 'details.html' }).
            otherwise({ redirectTo: '/' });
    });

TodoApp.factory('Todo', function ($resource) {
    return $resource('/api/todo/:id', { id: '@id' }, { update: { method: 'PUT' } });
});

TodoApp.directive('sorted', [function () {
    return {
        scope: true,
        restrict: 'A',
        transclude: true,
        template: '<a class="btn btn-link" ng-click="do_sort()" ng-transclude></a>' +
            	  '<span ng-show="do_show(true)">' +
                  '<i class="glyphicon glyphicon-arrow-down"></i>' +
          		  '</span>' +
         		  '<span ng-show="do_show(false)">' +
                  '<i class="glyphicon glyphicon-arrow-up"></i>' +
                  '</span> ',
        controller: function ($scope, $element, $attrs) {
            $scope.sort_by = $attrs.sorted;

            $scope.do_sort = function () {
                $scope.sort($scope.sort_by);
            };

            $scope.do_show = function (is_desc) {
                return (is_desc != $scope.is_desc && $scope.sort_order == $scope.sort_by)
            }
        }
    };
}])

var CreateCtrl = function ($scope, $location, Todo) {
    $scope.action = "Add";
    $scope.save = function () {
        Todo.save($scope.item, function () {
            $location.path('/');
        });
    };
};

var EditCtrl = function ($scope, $location, $routeParams, Todo) {
    var id = $routeParams.editId;

    $scope.action = "Update";
    $scope.item = Todo.get({ id: id });

    $scope.save = function () {
        Todo.update({ id: id }, $scope.item, function () {
            $location.path('/');
        });
    };
};

var ListCtrl = function ($scope, $location, Todo) {
    $scope.search = function () {
        Todo.query({
            q: $scope.query,
            sort: $scope.sort_order,
            desc: $scope.is_desc,
            offset: $scope.offset,
            limit: $scope.limit
        },
        function (data) {
            $scope.more = data.length === 20;
            $scope.todos = $scope.todos.concat(data);
        });
    }

    $scope.sort = function (col) {
        if ($scope.sort_order === col) {
            $scope.is_desc = !$scope.is_desc;
        } else {            
            $scope.is_desc = false;
        }
        $scope.sort_order = col;
        $scope.reset();
    };

    $scope.has_more = function () {
        return $scope.more;
    };

    $scope.show_more = function () {
        $scope.offset += $scope.limit;
        $scope.search();
    };

    $scope.reset = function () {
        $scope.limit = 20;
        $scope.offset = 0;
        $scope.todos = [];
        $scope.more = true;
        $scope.search();
    }

    $scope.delete = function () {
        var id = this.todo.Id;
        Todo.delete({ id: id }, function () {
            $('#todo_' + id).fadeOut();
        });
    }

    $scope.sort_order = "Priority";
    $scope.is_desc = false;

    $scope.reset();
};