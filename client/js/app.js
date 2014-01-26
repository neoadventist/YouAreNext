var app = angular.module('DigitalFastPass', ['ngRoute']).
  config(['$routeProvider', function($routeProvider) {
  $routeProvider.
	when('/home', {templateUrl: 'views/home.html',   controller: 'home'}).
	when('/now-serving', {templateUrl: 'views/now-serving.html',   controller: 'now-serving'}).
	otherwise({redirectTo: '/home'});
}]);
app.controller('home',['$scope','DFPfactory','$location',function($scope,DFPfactory,$location){
	$scope.model = {
		header:"Digital Fast Pass",
		subheader:'Choose a ShortCode that visitors will use to get "in line."',
		warning:false
	};
	$scope.data= {};
	$scope.check = function(){
		DFPfactory.shortCodeCheck($scope.data.shortcode).then(function(data){
			if (data.status === 201) {
				$scope.model.warning=false;
				DFPfactory.registerVender(data.data.shortcodeId).then(function(d){
					console.log(d.data);
					
					if(d.status===201){
						$location.path('/now-serving');
					}
				});
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
			shortcode:'',
			string:'',
			servingNumber:0
	};
	
	setInterval(
	function(){
		DFPfactory.getVenderInfo().then(function(data){
			console.log(data);
			$scope.data.servingNumber= data.currentlySeen;
			$scope.data.shortcode = data.shortcode;
		});
	},3000	);
	$scope.next = function(){
		DFPfactory.nextPerson().then(function(data){
			
		});	
	};
}]);

app.factory('DFPfactory',['$http', function($http) {
	var data = {vendorId:null,shortcode:null};
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
			},
			registerVender:function(shortcodeId){
			  	var config = {
			  			method: 'POST',
						url: '/API/vendor',
						data: {shortcodeId:shortcodeId}
				};
					    
					    var promise = $http(config).then(function (response) {
					    	console.log(response.data);
					    	data.vendorId=response.data.vendorId;
							return response;
					    });
					    return promise;				
				
			},
			getVenderInfo:function(){
			  	var config = {
			  			method: 'GET',
						url: '/API/vendor/'+data.vendorId
				};
					    
					    var promise = $http(config).then(function (response) {
					    	data.shortcode = response.data.shortcode; 
							return response.data;
					    });
					    return promise;				
				
			},
			nextPerson:function(visitorId){
			  	var config = {
					method: 'POST',
					url: '/API/done',
					data: {visitorId:visitorId}
				    };
				    
				    var promise = $http(config).then(function (response) {
						return response;
				    });
				    return promise;
				}
	};
	return actions; 
}]);