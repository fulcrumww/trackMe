angular.module('starter.controllers', [])
.service("ContactsService", ['$q', function($q) {
                             
     var formatContact = function(contact) {
     
     return {
     "displayName"   : contact.name.formatted || contact.name.givenName + " " + contact.name.familyName || "Mystery Person",
     "phones"        : contact.phoneNumbers || []
     };
     
     };
     
     var pickContact = function() {
     
     var deferred = $q.defer();
     
     if(navigator && navigator.contacts) {
     
     navigator.contacts.pickContact(function(contact){deferred.resolve( formatContact(contact) );});
     
     } else {
     deferred.reject("Bummer.  No contacts in desktop browser");
     }
     
     return deferred.promise;
     };
     
     return {
     pickContact : pickContact
     };
     }])
     .factory('connectServer',['$http', function($http){
        var service={};
        service.getResponse = function (url,methodtype,param) {
          return  $http({
            url: url,
            dataType: "json",
            contentType: "application/json",
            method: methodtype,
            timeout:15000,
            data: param
            
            });
          };
        return service;
  }])
    .factory('connectServerToGet',['$http', function($http){
        var service={};
        service.getResponse = function (url,methodtype,param) {
            return  $http({
                url: url,
                dataType: "json",
                contentType: "application/json",
                method: methodtype,
                timeout:15000,
                params: param

            });
        };
        return service;
    }])


    .controller('AppCtrl', function($scope, $ionicModal, $timeout, $state) {
            $scope.logOut=function(){
            clearInterval(stop);
            stop="undefined";
            sessionStorage.setItem('userId',null);
            sessionStorage.setItem('sessionId',null);
            sessionStorage.setItem('shiftTimmings',null);
            sessionStorage.setItem('pickUpPoint',null);
              $state.go('app.login');
            }
            $scope.profile=function(){
              $state.go('app.profile');
            }
            $scope.dashboard=function(){
              $state.go('app.dashboard');
            }
            $scope.emergencyDetails = function(){
               $state.go('app.emergencydetails',null, { reload: true });
            }
    })

.controller('loginCtrl',['$scope','$state','$http','$rootScope','$ionicLoading', '$ionicPopup','connectServer', function($scope,$state,  $http, $rootScope,$ionicLoading, $ionicPopup,connectServer ) {
     $scope.user = {username: null,password: null};
     timeInterval=null;
                         
     $rootScope.showAlert = function(msg) {
     var alertPopup = $ionicPopup.alert({title: 'MESSAGE',template: msg});
     alertPopup.then(function(res) {});
     };
     $rootScope.page="login";
                         
     // Login using credientials
     $scope.login=function(){
         $ionicLoading.show({template: 'Loading...'});
         var url="http://123.63.36.182:8084/roster_app/api/v1/user/login";
         // var param={"json":{"username" : "FWIN01112", "password" : "fulcrum#1"}};
         var param={"json":{"username" : $scope.user.username, "password" : $scope.user.password}};
         if($scope.user.username!=null && $scope.user.password !=null){
                 
        connectServer.getResponse(url,"POST",param).success(function (data) {
          $ionicLoading.hide();
          var obj = data.data;
          sessionStorage.setItem('userId',obj.userId);
          sessionStorage.setItem('sessionId',obj.sessionId);
          sessionStorage.setItem('shiftTimmings',obj.shiftTimmings);
          sessionStorage.setItem('pickUpPoint',obj.pickUpPoint);
          if(obj.pickUpPoint !=null  && obj.pickUpPoint !=""){
             $state.go('app.dashboard');
          }
          else{
             $state.go('app.profile');
          }
          }).error(function (data) {
            $rootScope.showAlert(data.message);
            $ionicLoading.hide();
        });

     }else{
            $ionicLoading.hide();
            $rootScope.showAlert('Please enter username/ password');
     }
    }
 }])

.controller('profileCtrl', function($scope, $state ,$http, $rootScope, $ionicLoading, $ionicPopup ,connectServer,connectServerToGet) {
           $ionicLoading.show({template: 'Loading...'});
            $scope.routes=[];
            $scope.user={userId : null, homelocation : null, shifttiming : null , mobile : null, pickuppoint: null,empId : null , email : null };
            $scope.myRoute={ id : null};
            var userId= sessionStorage.userId;
            var sessionId=  sessionStorage.sessionId;
             var params = {"sessionId":sessionId,"userId":userId};
            var url="http://123.63.36.182:8084/roster_app/api/v1/routes/list";
            connectServerToGet.getResponse(url,"GET",params).success(function (data) {
        
            $scope.routes=data.data;
            //Get And display
            var url="http://123.63.36.182:8084/roster_app/api/v1/user/profile";
            connectServerToGet.getResponse(url,"GET",params).success(function (data) {

                  $ionicLoading.hide();
                  var response=data.data;
                  $scope.user.name=response.displayName;
                  $scope.user.email=response.email;
                  
                  $scope.user.mobile=response.mobile;
                  $scope.user.homelocation= response.homeLocation;
                  $scope.user.empId= response.empId;
                  $scope.user.shifttiming=response.shiftTimmings;
                  $scope.routeArray=response.routes;
                                                                
                  if(JSON.stringify(response.routes) != null && JSON.stringify(response.routes) !="[]"){
                    $scope.myRoute = $scope.routes[response.routes.routesId - 1];
                  }else{
                  }
                  
                  sessionStorage.setItem('shiftTimmings',response.shiftTimmings);
                  sessionStorage.setItem('pickUpPoint',response.pickUpPoint);
                          
                            
                  }).error(function (data, status, headers, config) {
                           $rootScope.showAlert('status ='+ status + ' ' + headers);
                           $ionicLoading.hide();
                           });
             }).error(function (data, status, headers, config) {
                    $rootScope.showAlert('status ='+ status + ' ' + headers);
                    $ionicLoading.hide();
        });
                       
            
        $scope.getSelectedShift=function(shiftTiming){
        $scope.user.shifttiming= shiftTiming;
        }
       
      // POst Data to service
        $scope.getSelectedRoute=function(myRoute){
           $scope.myRoute=myRoute;
        }
      
        $scope.goBack=function(){
        if($rootScope.page == "dashboard"){
           $state.go('app.dashboard');
        }else{
          $state.go('app.login');
        }
        }
        $scope.submit=function(){
        $ionicLoading.show({template: 'Updating...'});
        var url="http://123.63.36.182:8084/roster_app/api/v1/user/update?sessionId="+sessionId+"&userId="+userId;
        var param={"json":{"userId" : userId, "homeLocation" : $scope.user.homelocation, "shiftTimmings" :  $scope.user.shifttiming , "mobile" :parseInt($scope.user.mobile) , "pickUpPoint" :$scope.myRoute.id}};
        if($scope.user.homelocation != null && $scope.user.mobile !=null && $scope.myRoute.id !=null){
        connectServer.getResponse(url,"PUT",param).success(function (data) {
                         
             $rootScope.showAlert('Profile updated successfully!!!');
             $ionicLoading.hide();
             $state.go('app.login');
        }).error(function (data, status, headers, config) {
              //alert('Please fill up all details');
               $rootScope.showAlert('Please fill up all details');
              $ionicLoading.hide();
            });
        }
        else{
         $ionicLoading.hide();
         $rootScope.showAlert('Please fill up all details');
        }
        }
        })


.controller('dashboardCtrl',['$scope','$state','$http',  '$interval' ,'$rootScope', '$ionicLoading', '$ionicPopup','connectServer' , function($scope, $state, $http ,$interval, $rootScope, $ionicLoading , $ionicPopup ,connectServer,geolocation) {

    var userId= sessionStorage.userId;
    var sessionId=  sessionStorage.sessionId;
    $rootScope.page="dashboard";
    $scope.stopTracking=function(){

        if( timeInterval != null){
            $rootScope.showAlert('Tracking stopped successfully');
            timeInterval=null;
        }else{
            $rootScope.showAlert('Tracking is not started');
            timeInterval=null;
        }

        clearInterval(stop);
        stop="undefined";
    }
                        
    $scope.viewRoute=function(){
      $state.go('app.currentlocation');
    }
                             
     $scope.sendSMS=function(){
      var currentAddress =null;
       $scope.number=[];
       var emergencyDetails=JSON.parse(window.localStorage.getItem('emergencyContacts'));
        //alert(localStorage.emergencyContacts);
    if(emergencyDetails !=null && localStorage.emergencyContacts != "[]"){
     for(var i=0; i<3 ; i++){
     try{
       if((emergencyDetails[i].phones[0].type !="home fax" && emergencyDetails[i].phones[0].type !="work fax" && emergencyDetails[i].phones[0].type !="pager" ) || (emergencyDetails[i].phones[0].type !="HOME FAX" && emergencyDetails[i].phones[0].type !="WORK FAX" && emergencyDetails[i].phones[0].type !="PAGER" ) ){
          $scope.number.push(emergencyDetails[i].phones[0].value);
         
         }
        }catch(err){
           i++;
        }
     }

       
      currentAddress =sessionStorage.address;
      var numberString ="'"+$scope.number.toString()+"'";
                            
     if(currentAddress!= "undefined" && currentAddress !=null){
      window.plugins.socialsharing.shareViaSMS('I am currently @  '+currentAddress, numberString, function(msg) {console.log('ok: ' + msg)}, function(msg) {alert('error: ' + msg)});
                             
     }else{
                             
        window.plugins.socialsharing.shareViaSMS('Testing Application!!!', numberString, function(msg) {console.log('ok: ' + msg)}, function(msg) {alert('error: ' + msg)});
    }
    }else{
     $rootScope.showAlert("Please add 'Emergency contacts' first");

     }
                            
}
    
                             
                       
    $scope.startTracking=function(){
            timeInterval=50000;
               try {
        $ionicLoading.show({template: 'Loading...'});
        if(navigator.geolocation){
          navigator.geolocation.getCurrentPosition(geolocationSuccess,geolocationError,{ enableHighAccuracy: true ,timeout: 5000 });
        }
        }catch(err) {
          $rootScope.showAlert(err.message);
        }
        stop= setInterval(function(){ navigator.geolocation.getCurrentPosition(geolocationSuccess,geolocationError,{ enableHighAccuracy: true ,timeout: 5000});}, timeInterval);
       
    }
                  
         
    var geolocationSuccess = function(position) {
    codeLatLng(position.coords.latitude ,position.coords.longitude );
    }
    function geolocationError(error) {
    $rootScope.showAlert('Please make sure you have turn ON location services');
    $ionicLoading.hide();
    }
    
    function initialize() {
    geocoder = new google.maps.Geocoder();
    }
    
     function codeLatLng(lat, lng) {
         var geocoder;
         var address = "";
         geocoder = new google.maps.Geocoder();
         var latlng = new google.maps.LatLng(lat, lng);
         geocoder.geocode({
                      'latLng': latlng
                      }, function (results, status) {
                      
          if (status == google.maps.GeocoderStatus.OK) {
          // console.log(status);
          
          if (results[1]) {
          //loop through components
          for (var i = 0; i < results[0].address_components.length; i++) {
          //loop through types
          for (var b = 0; b < results[0].address_components[i].types.length; b++) {
          address= (results[1].formatted_address);
          }
          }
          sessionStorage.setItem('address',address);
          // $rootScope.showAlert('Current Address: '+address);
          
          var smallAddress= address.split(",");
          var  redefinedAddress=smallAddress[0]+","+smallAddress[1];
          if(address !=null){
          
          var userId= sessionStorage.userId;
          var sessionId=  sessionStorage.sessionId;
          var param={"json":{"routesId" : parseInt(sessionStorage.pickUpPoint), "shiftTimmings" : sessionStorage.shiftTimmings , "currentLocation" : redefinedAddress}};
          
          var url="http://123.63.36.182:8084/roster_app/api/v1/routes/travel-history?sessionId="+sessionId+"&userId="+userId;
             
             connectServer.getResponse(url,"POST",param).success(function (data) {
                           $ionicLoading.hide();
                           $state.go('app.currentlocation', null, { reload: true });
                    }).error(function (data, status, headers, config) {
                        $ionicLoading.hide();
                        //$rootScope.showAlert('Error in sending updates to service');
                    });
              }
              } else {
              $ionicLoading.hide();
              }
              } else {
              $ionicLoading.hide();
              $rootScope.showAlert('Please turn on location services');
              }
              
              });
         }
         
         }])
.controller('currenLocationCtrl',['$scope','$state','$http','$rootScope', '$ionicLoading', '$ionicPopup','connectServerToGet',  function($scope, $state, $http ,$rootScope,  $ionicLoading, $ionicPopup ,connectServerToGet, geolocation) {
                  $scope.currentLocation=[];
                  $scope.refresh=function(){
                  $ionicLoading.show({template: 'Loading...'});
                  var userId= sessionStorage.userId;
                  var sessionId=  sessionStorage.sessionId;
           
                  var param = {"sessionId":sessionId,"userId":userId};
                  var url="http://123.63.36.182:8084/roster_app/api/v1/routes/travel-history/list/"+parseInt(sessionStorage.pickUpPoint)+"/"+sessionStorage.shiftTimmings;
                  //alert(JSON.stringify(param)+ " url: "+url);
                  connectServerToGet.getResponse(url,"GET",param).success(function (data) {

                           $ionicLoading.hide();
                           $scope.currentLocation=data.data;
                        }).error(function (data, status, headers, config) {
                            $ionicLoading.hide();
                            $rootScope.showAlert(JSON.stringify(data.message));
                        });
                  }
                  $scope.refresh();
                  $scope.goBack=function(){
                   $state.go('app.dashboard');
                  }
                                  
        }])

.controller('EmergDetailsCtrl', function($scope,$rootScope,$http,$state,ContactsService,$filter,$ionicPopup) {
            console.log('In emergency details');
            var savedEmgrContact = null;
            if(window.localStorage.getItem('emergencyContacts') != null) {
            savedEmgrContact = JSON.parse(window.localStorage.getItem('emergencyContacts'));
            $scope.data = {
            selectedContacts : savedEmgrContact
            };
            }else{
            $scope.data = {
            selectedContacts : []
            };
            }
            console.log('localstorageitem'+ JSON.stringify(savedEmgrContact));
            //alert(JSON.stringify(window.localStorage.getItem('emergencyContacts')));
            //$scope.data.selectedContacts = savedEmgrContact;
            
            
            
            $scope.pickContact = function() { 
            
            ContactsService.pickContact().then(
               function(contact) { 
               
               if($scope.data.selectedContacts.length < 3) {
               var found = JSON.stringify($filter('filter')($scope.data.selectedContacts, contact));
               if (found.length > 2) {
               $rootScope.showAlert('Contact already exists');
               } else {
               $scope.data.selectedContacts.push(contact);
               
               }
               }else{
               $rootScope.showAlert('Only three emergency contacts allowed');
               }
               console.log("Selected contacts=");
               console.log($scope.data.selectedContacts);
               },
               function(failure) {
               console.log("Bummer.  Failed to pick a contact");
               }
               );
            
            };
            
            $scope.updateEmgrDetails = function(){
            //alert(JSON.stringify($scope.data));
            window.localStorage.setItem('emergencyContacts', JSON.stringify($scope.data.selectedContacts));
            $rootScope.showAlert("Emergency contacts added successfully");
            $state.go('app.dashboard');

            };
            
            $scope.removeContact = function(contact){ //alert(JSON.stringify(contact));
            //var index = $scope.bdays.indexOf(contact);alert(index);
            var confirmPopup = $ionicPopup.confirm({title: 'Emergency Contact',template: 'Are you sure you want to remove contact?'});
            confirmPopup.then(function(res) {
                              if(res) {
                              console.log('Contact deleted');
                              var index = $scope.data.selectedContacts.indexOf(contact);
                              $scope.data.selectedContacts.splice(index,1);
                              window.localStorage.setItem('emergencyContacts', JSON.stringify($scope.data.selectedContacts));
                              } else {
                              console.log('cancelled');
                              }
                              });
                        }
            });




