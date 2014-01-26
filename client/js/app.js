var app = angular.module('DigitalFastPass', ['ngRoute']).
  config(['$routeProvider', function($routeProvider) {
  $routeProvider.
	when('/home', {templateUrl: 'views/home.html',   controller: 'home'}).
	when('/now-serving', {templateUrl: 'views/now-serving.html',   controller: 'now-serving'}).
	otherwise({redirectTo: '/home'});
}]);
app.controller('home',['$scope','DFPfactory',function($scope,DFPfactory){
	$scope.model = {
		header:"Digital Fast Pass",
		subheader:'Choose a ShortCode that visitors will use to get "in line."',
		warning:false
	};
	$scope.data= {};
	$scope.check = function(){
		console.log("I FRIRED");
		DFPfactory.shortCodeCheck($scope.data.shortcode).then(function(data){
			if (data.status === 201) {
			    	
			} else {
			    $scope.model.warning =true;
			}
				
		});
	};
}]);
app.controller('now-serving',['$scope','DFPfactory',function($scope,DFPfactory){
	$scope.model = {
		
	};	
	$scope.data = {
			shortcode:'ABCDE',
			string:''
	};
	
	
}]);

app.factory('DFPfactory',['$http', function($http) {
	var actions = {};
	actions = {
			shortCodeCheck:function(shortcode){
		  	var config = {
				method: 'POST',
				url: '/API/shortcode',
				data: {shortcode:shortcode}
			    };
			    
			    var promise = $http(config).then(function (response) {
					return response;
			    });
			    return promise;
			}						
	};
	return actions; 
}]);