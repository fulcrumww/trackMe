angular.module('starter.controllers', [])
.constant("$config", {
    "serviceUrl": "http://123.63.36.182:8084/roster_app/api/v1"
})
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
.controller('AppCtrl', function($scope, $ionicModal, $timeout, $state,$rootScope) {
          $scope.logOut=function(){
            clearInterval(stop);
            stop="undefined";
            $rootScope.page="menu";
            $rootScope.timeInterval=false;
            localStorage.setItem('userId',null);
            localStorage.setItem('sessionId',null);
            sessionStorage.setItem('shiftTimmings',null);
            sessionStorage.setItem('pickUpPoint',null);
              $rootScope.count = 0;
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

.controller('loginCtrl',['$config','$scope','$state','$http','$rootScope','$ionicLoading', '$ionicPopup','connectServer', function($config,$scope,$state,  $http, $rootScope,$ionicLoading, $ionicPopup,connectServer ) {
     $scope.user = {username: null,password: null, remember:false};
     timeInterval=null;
                         
        var  username= localStorage.username;
        var  pwd= localStorage.pwd;
        if(username != "undefined" && pwd !="undefined" && username != null && pwd != null && username != '' && pwd != ''){
            $scope.user.username = username;
            $scope.user.password = pwd;
            $scope.user.remember=true;
         }else{
            $scope.user.remember=false;
         }
     $rootScope.count = 0;
     $rootScope.showAlert = function(msg) {
     var alertPopup = $ionicPopup.alert({title: 'MESSAGE',template: msg});
        alertPopup.then(function(res) {});
     };
     $rootScope.page="login";
                         
     // Login using credientials
     $scope.login=function(){
         $ionicLoading.show({template: 'Loading...'});
         var url= $config.serviceUrl + "/user/login";
         // var param={"json":{"username" : "FWIN01112", "password" : "fulcrum#1"}};
         var param={"json":{"username" : $scope.user.username, "password" : $scope.user.password}};
         if($scope.user.username!=null && $scope.user.password !=null){
             if($scope.user.remember){
                 localStorage.setItem('username',$scope.user.username);
                 localStorage.setItem('pwd',$scope.user.password);

             }else{
                 localStorage.setItem('username','');
                 localStorage.setItem('pwd','');
                 $scope.user.remember=false;
             }
            connectServer.getResponse(url,"POST",param).success(function (data) {
                $ionicLoading.hide();
                var obj = data.data;
                localStorage.setItem('userId',obj.userId);
                localStorage.setItem('sessionId',obj.sessionId);
                sessionStorage.setItem('shiftTimmings',obj.shiftTimmings);
                sessionStorage.setItem('pickUpPoint',obj.pickUpPoint);
                $rootScope.count = 1;
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

.controller('profileCtrl', function($config,$scope, $state ,$http, $rootScope, $ionicLoading, $ionicPopup ,connectServer,connectServerToGet) {
            $ionicLoading.show({template: 'Loading...'});
            $scope.routes=[];
            $rootScope.page="profile";
            $scope.user={userId : null, homelocation : null, shifttiming : null , mobile : null, pickuppoint: null,empId : null , email : null };
            $scope.myRoute={ id : null};
            var userId= localStorage.userId;
            var sessionId=  localStorage.sessionId;
            var params = {"sessionId":sessionId,"userId":userId};
            var url= $config.serviceUrl + "/routes/list";
            connectServerToGet.getResponse(url,"GET",params).success(function (data) {
        
            $scope.routes=data.data;
            //Get And display
            var url= $config.serviceUrl + "/user/profile";
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
            var url= $config.serviceUrl + "/user/update?sessionId="+sessionId+"&userId="+userId;
            var param={"json":{"userId" : userId, "homeLocation" : $scope.user.homelocation, "shiftTimmings" :  $scope.user.shifttiming , "mobile" :parseInt($scope.user.mobile) , "pickUpPoint" :$scope.myRoute.id}};
            if($scope.user.homelocation != null && $scope.user.mobile !=null && $scope.myRoute.id !=null){
                connectServer.getResponse(url,"PUT",param).success(function (data) {
                    sessionStorage.setItem('shiftTimmings',$scope.user.shifttiming);
                    sessionStorage.setItem('pickUpPoint',$scope.myRoute.id);
                    $rootScope.showAlert('Profile updated successfully!!!');
                    $ionicLoading.hide();
                    $state.go('app.dashboard');
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
.controller('dashboardCtrl',['$config','$scope','$state','$http',  '$interval' ,'$rootScope', '$ionicLoading', '$ionicPopup','connectServer','$q','connectServerToGet' , function($config,$scope, $state, $http ,$interval, $rootScope, $ionicLoading , $ionicPopup ,connectServer,$q,connectServerToGet , geolocation) {

    var userId= localStorage.userId;
    var sessionId=  localStorage.sessionId;
    $rootScope.page="dashboard";
    $scope.stopTracking=function(){

        if( timeInterval != null && timeInterval != "" && timeInterval != "undefined"){

            var confirmPopup = $ionicPopup.confirm({title: 'CONFIRMATION',template: 'Are you sure you want to stop tracking?'});
            confirmPopup.then(function(res) {
                if(res) {
                    $rootScope.showAlert('Tracking stopped successfully');
                    timeInterval=null;
                    clearInterval(stop);
                    stop="undefined";
                    $rootScope.timeInterval=false;
                } else {
                    console.log('cancelled');
                }
            });

        }else{
            $rootScope.showAlert('Tracking not started from your device');
            timeInterval=null;
            clearInterval(stop);
            stop="undefined";
            $rootScope.timeInterval=false;
        }

    }
                        
    $scope.viewRoute=function(){
      $state.go('app.currentlocation');
    }
                             
     $scope.sendSMS=function(){
         var currentAddress =null;

         $scope.number=[];
         var emergencyDetails=JSON.parse(window.localStorage.getItem('emergencyContacts'));
         if(emergencyDetails !=null && localStorage.emergencyContacts != "[]"){
             getUserLastLocation().then(
                 function (result){
                     currentAddress = result;
                     for(var i=0; i<3 ; i++){
                         try{
                             if((emergencyDetails[i].phones[0].type !="home fax" && emergencyDetails[i].phones[0].type !="work fax" && emergencyDetails[i].phones[0].type !="pager" ) || (emergencyDetails[i].phones[0].type !="HOME FAX" && emergencyDetails[i].phones[0].type !="WORK FAX" && emergencyDetails[i].phones[0].type !="PAGER" ) ){
                                 $scope.number.push(emergencyDetails[i].phones[0].value);
                             }
                         }catch(err){
                             i++;
                         }
                     }

                     var numberString ="'"+$scope.number.toString()+"'";
                     if(currentAddress!= "undefined" && currentAddress !=null){
                         window.plugins.socialsharing.shareViaSMS('I am currently @  '+currentAddress, numberString, function(msg) {console.log('ok: ' + msg)}, function(msg) {alert('error: ' + msg)});
                     }else{
                         window.plugins.socialsharing.shareViaSMS('Location not traceable!!!', numberString, function(msg) {console.log('ok: ' + msg)}, function(msg) {alert('error: ' + msg)});
                     }
                     $ionicLoading.hide();
                 },function(error){
                     $ionicLoading.hide();
                     currentAddress = error;
                 }
             );

        }else{
            $rootScope.showAlert("Please add 'Emergency contacts' ");

        }
                            
}
    function getUserLastLocation (){
        $ionicLoading.show({template: 'processing...'});
        var geocoder;
        var address = "";
        var deferred = $q.defer();
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position){
                $scope.$apply(function(){ //alert('here2');
                    geocoder = new google.maps.Geocoder();
                    var lat = position.coords.latitude;
                    var lng = position.coords.longitude;
                    console.log(lat + 'coords' + lng);
                    var latlng = new google.maps.LatLng(lat, lng);
                    geocoder.geocode({'latLng': latlng}, function(results, status)
                    {   console.log('coords' + latlng);
                        if (status == google.maps.GeocoderStatus.OK)
                        {
                            if (results[1])
                            {
                                var smallAddress= results[1].formatted_address.split(",");
                                var  redefinedAddress=smallAddress[0]+","+smallAddress[1];
                                console.log(redefinedAddress);
                                deferred.resolve(redefinedAddress);
                            }else{
                                deferred.reject("Not able to get location.");
                            }

                        }
                    });

                });


            },geolocationError,{ enableHighAccuracy: true ,timeout: 5000 });

        }
        return deferred.promise;
    }
    
        $scope.track=function(){
             
             timeInterval=180000;
             try {
             $ionicLoading.show({template: 'Loading...'});
             if(navigator.geolocation){
             navigator.geolocation.getCurrentPosition(geolocationSuccess,geolocationError,{ enableHighAccuracy: true ,timeout: 5000 });
             $rootScope.timeInterval= false;
             }
             }catch(err) {
             $rootScope.showAlert(err.message);
             }
             stop= setInterval(function(){ navigator.geolocation.getCurrentPosition(geolocationSuccess,geolocationError,{ enableHighAccuracy: true ,timeout: 5000}); $ionicLoading.hide(); $rootScope.timeInterval=true;}, timeInterval);
        }
                       
    $scope.startTracking=function(){
        document.getElementById("startTracking").disabled = true;
        var param = {"sessionId":sessionId,"userId":userId};
        var url= $config.serviceUrl + "/routes/travel-history/check/"+parseInt(sessionStorage.pickUpPoint)+"/"+sessionStorage.shiftTimmings;
        
        connectServerToGet.getResponse(url,"GET",param).success(function (data) { 
            $ionicLoading.hide();
            var response=data.data;
           // alert('Success: '+JSON.stringify(response.interval));

         if(parseInt(response.interval) > 420){
            $scope.track();
          }else{
            document.getElementById("startTracking").disabled = false;
            $state.go('app.currentlocation', null, {  });
          }
                                                                    
        }).error(function (data, status, headers, config) {
                $ionicLoading.hide();
                 document.getElementById("startTracking").disabled = false;
                 if(data.message.toLowerCase() == "pickup has not yet started"){
                   $scope.track();
                 }
            });
             
                             
    }
                  
         
    var geolocationSuccess = function(position) {
         var networkState=null;
         var deviceOS= device.platform;
         if(deviceOS.toLowerCase() == "ios"){
           networkState = Connection.CELL;
         }else{
           networkState = navigator.connection.type;
         }
         var states = {};
         states[Connection.UNKNOWN]  = 'Unknown connection';
         states[Connection.ETHERNET] = 'Ethernet connection';
         states[Connection.WIFI]     = 'WiFi connection';
         states[Connection.CELL_2G]  = 'Cell 2G connection';
         states[Connection.CELL_3G]  = 'Cell 3G connection';
         states[Connection.CELL_4G]  = 'Cell 4G connection';
         states[Connection.CELL]     = 'Cell generic connection';
         states[Connection.NONE]     = 'No network connection';
         if( states[networkState] =="No network connection"){
            $ionicLoading.hide();
         }else{
            codeLatLng(position.coords.latitude ,position.coords.longitude );
         }
    }
    function geolocationError(error) {
       
        if($rootScope.count == 1){
        $rootScope.showAlert('Skipped finding current location. Please make sure you have turn ON location services');
            $rootScope.count=$rootScope.count+1;
        }

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

                  var userId= localStorage.userId;
                  var sessionId=  localStorage.sessionId;
                  var param={"json":{"routesId" : parseInt(sessionStorage.pickUpPoint), "shiftTimmings" : sessionStorage.shiftTimmings , "currentLocation" : redefinedAddress}};

                  var url= $config.serviceUrl + "/routes/travel-history?sessionId="+sessionId+"&userId="+userId;

                    connectServer.getResponse(url,"POST",param).success(function (data) {
                        $ionicLoading.hide();

                        if( $rootScope.timeInterval== false){
                             $rootScope.showAlert('Tracking started successfully');
                             $state.go('app.currentlocation', null, {  });
                         }else{
                            $state.go($state.current, {}, {reload: true});
                        }
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
                if($rootScope.count == 1){
                     $rootScope.showAlert('Please check your network connection and/ location services settings');
                          $rootScope.count=$rootScope.count+1;
                }
            }
              
         });
     }
         
}])
.controller('currenLocationCtrl',['$config','$scope','$state','$http','$rootScope', '$ionicLoading', '$ionicPopup','connectServerToGet','$ionicScrollDelegate',  function($config,$scope, $state, $http ,$rootScope,  $ionicLoading, $ionicPopup ,connectServerToGet, $ionicScrollDelegate,  geolocation) {
          $scope.currentLocation=[];
          $rootScope.page="currentLocation";
          $scope.refresh=function(){
              $ionicLoading.show({template: 'Loading...'});
              var userId= localStorage.userId;
              var sessionId=  localStorage.sessionId;

              var param = {"sessionId":sessionId,"userId":userId};
              var url= $config.serviceUrl + "/routes/travel-history/list/"+parseInt(sessionStorage.pickUpPoint)+"/"+sessionStorage.shiftTimmings;
              //alert(JSON.stringify(param)+ " url: "+url);
              connectServerToGet.getResponse(url,"GET",param).success(function (data) {
                  $ionicLoading.hide();
                  // Make the chat window scroll to the bottom
                  $ionicScrollDelegate.scrollBottom();
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

.controller('nonetworkCtrl', function($scope,$rootScope,$http,$state,ContactsService,$filter,$ionicPopup,geolocation) {
       $rootScope.page="nonetwork";
            
})

.controller('EmergDetailsCtrl', function($scope,$rootScope,$http,$state,ContactsService,$filter,$ionicPopup) {
            console.log('In emergency details');
            $rootScope.page="emergencyDetails";
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




