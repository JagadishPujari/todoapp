/*global define*/
'use strict';

/**
 * The main controller for the app. The controller:
 * - retrieves and persist the model via the todoStorage service
 * - exposes the model to the template and provides event handlers
 */

define([
	'angular'
], function (angular) {
	return ['$scope', '$location', 'todoStorage', 'filterFilter', '$timeout',
		function ($scope, $location, todoStorage, filterFilter, $timeout) {
			var todos = $scope.todos = todoStorage.get();

			$scope.newTodo = '';
			$scope.editedTodo = null;

			$scope.$watch('todos', function () {
				$scope.remainingCount = filterFilter(todos, { completed: false }).length;
				$scope.doneCount = todos.length - $scope.remainingCount;
				$scope.allChecked = !$scope.remainingCount;
				todoStorage.put(todos);
				for(var i=0; i<$scope.todos.length; i++){
					if($scope.todos[i].completed){
						$scope.todos[i].completedDate = new Date();
					}else{
						$scope.todos[i].completedDate = "";
					}
				}
			}, true);

			if ($location.path() === '') {
				$location.path('/');
			}

			$scope.location = $location;

			$scope.$watch('location.path()', function (path) {
				$scope.statusFilter = (path === '/active') ?
					{ completed: false } : (path === '/completed') ?
					{ completed: true } : null;
					if(path == '/active'){
						for(var i=0; i<$scope.todos.length; i++){
							$scope.todos[i].active = !$scope.todos[i].completed ? true : false;
						}
					}
					if(path == '/'){
						for(var i=0; i<$scope.todos.length; i++){
							$scope.todos[i].active = $scope.todos[i].completed ? true : false;
						}
					}
					if(path == '/completed'){
						for(var i=0; i<$scope.todos.length; i++){
							if($scope.todos[i].completed);
								$scope.todos[i].completedDate = new Date();
						}
					}
					
			});


			$scope.addTodo = function () {

				var newTodo = $scope.newTodo.trim();
				if (!newTodo.length) {
					return;
				}

				todos.push({
					title: newTodo,
					completed: false,
					status:"new",
					active: false,
					createdDate: new Date(),
					completedDate: ""
				});
				$timeout(function(){
					todos[todos.length-1].status = "old";
				}, 30000);
				$scope.newTodo = '';
			};


			$scope.editTodo = function (todo) {
				$scope.editedTodo = todo;
				// Clone the original todo to restore it on demand.
				$scope.originalTodo = angular.copy(todo);
			};


			$scope.doneEditing = function (todo) {
				$scope.editedTodo = null;
				todo.title = todo.title.trim();

				if (!todo.title) {
					$scope.removeTodo(todo);
				}
			};

			$scope.revertEditing = function (todo) {
				todos[todos.indexOf(todo)] = $scope.originalTodo;
				$scope.doneEditing($scope.originalTodo);
			};

			$scope.removeTodo = function (todo) {
				todos.splice(todos.indexOf(todo), 1);
			};


			$scope.clearDoneTodos = function () {
				$scope.todos = todos = todos.filter(function (val) {
					return !val.completed;
				});
			};


			$scope.markAll = function (done) {
				todos.forEach(function (todo) {
					todo.completed = done;
				});
			};
		}
	];
});
