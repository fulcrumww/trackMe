
angular.module('starter.controllers')
.factory('connectServer',['$http', function($http){
//return {
            connectServer.getResponse = function (url,methodtype,param) {
            return  $http({
                          url: url,
                          dataType: "json",
                          contentType: "application/json",
                          method: methodtype,
                          params: param
                          
                          });
            };
        // }
            }]);
