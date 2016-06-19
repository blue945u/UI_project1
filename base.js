var fdApp = angular.module('fdApp', []);

// Service for retrieving a response nicely.
fdApp.factory('handPickService', function($http) {
  var promise;
  var handPickService = {
    async: function(url) {
      if (!promise) {
        promise = $http.get(url).then(function (response) {
          return response.data;
        });
      }
      return promise;
    },
    getData: function(url, callBack) {
      handPickService.async(url).then(callBack);
    }
  };
  return handPickService;
});

// Dummy controller for using the handPickService
fdApp.controller('itemController', function(handPickService, $scope) {
  $scope.getData = function(url, callBack) {
    handPickService.async(url).then(callBack);
  };
  $scope.callBack = function(data) {
    $scope.data = data.payload[0];
  }
  $scope.beer_id_list = ['154803', '209702', '658102',
                         '223301', '669702', '614601'];
  var api_cred = 'svetor';
  var url = 'http://pub.jamaica-inn.net/fpdb/api.php?username=' + api_cred + '&password=' + api_cred + '&action=inventory_get';
  $scope.getData(url, $scope.callBack);
  //$scope.$apply();
  //END
});
