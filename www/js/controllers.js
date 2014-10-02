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

.controller('loginCtrl',['$scope','$state','$http','$rootScope','$ionicLoading', '$ionicPopup', function($scope,$state,  $http, $rootScope,$ionicLoading, $ionicPopup ) {
     $scope.user = {username: null,password: null};
     $rootScope.showAlert = function(msg) {
     var alertPopup = $ionicPopup.alert({title: 'MESSAGE',template: msg});
     alertPopup.then(function(res) {});
     };
     $rootScope.page="login";
     $scope.login=function(){
     $ionicLoading.show({template: 'Loading...'});
     var url="http://123.63.36.182:8084/roster_app/api/v1/user/login";
      var param={"json":{"username" : "FWIN01112", "password" : "fulcrum#1"}};
     //var param={"json":{"username" : $scope.user.username, "password" : $scope.user.password}};
     if($scope.user.username!=null && $scope.user.password !=null){
             
   /*  connectServer.getResponse(url,"POST",param).success(function (data) {
      alert(JSON.stringify(data));
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
               $rootScope.showAlert('Unable to log in. Please try again');
               $ionicLoading.hide();
    });*/
     $http({
           url: url,
           dataType: "json",
           contentType: "application/json",
           method: "POST",
           timeout:50000,
           data:param
           
           }).success(function (data, status, headers, config) {
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
              }).error(function (data, status, headers, config) {
                $rootScope.showAlert('Unable to log in. Please try again');
                       $ionicLoading.hide();
                       });
     }else{
            $ionicLoading.hide();
            $rootScope.showAlert('Please enter username/ password');
     }
    }
 }])

.controller('profileCtrl', function($scope, $state ,$http, $rootScope, $ionicLoading, $ionicPopup) {
           $ionicLoading.show({template: 'Loading...'});
            $scope.routes=[];
            $scope.user={userId : null, homelocation : null, shifttiming : null , mobile : null, pickuppoint: null,empId : null , email : null };
            $scope.myRoute={ id : null};
            var userId= sessionStorage.userId;
            var sessionId=  sessionStorage.sessionId;
             var params = {"sessionId":sessionId,"userId":userId};
            var url="http://123.63.36.182:8084/roster_app/api/v1/routes/list";
            $http({
                  url: url,
                  dataType: "json",
                  contentType: "application/json",
                  method: "GET",
                  timeout:50000,
                  params: params
                  
                  }).success(function (data, status, headers, config) {
                     //alert(" success for Registration: "+JSON.stringify(data));
                     $scope.routes=data.data;
                     //Get And display
                     var url="http://123.63.36.182:8084/roster_app/api/v1/user/profile";
                     $http({
                           url: url,
                           dataType: "json",
                           contentType: "application/json",
                           method: "GET",
                           timeout:50000,
                           params: params
                           
                 }).success(function (data, status, headers, config) {
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
        $http({
              url: url,
              headers:{
              'Access-Control-Allow-Origin': 'Origin, X-Requested-With, Content-Type, Accept',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With',
              'X-Random-Shit':'123123123'
              },
              method: "PUT",
              timeout:50000,
              data : param
        }).success(function (data, status, headers, config) {
                         
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


.controller('dashboardCtrl',['$scope','$state','$http',  '$interval' ,'$rootScope', '$ionicLoading', '$ionicPopup' , function($scope, $state, $http ,$interval, $rootScope, $ionicLoading , $ionicPopup ,geolocation) {
                             
                         
    var userId= sessionStorage.userId;
    var sessionId=  sessionStorage.sessionId;
    $rootScope.page="dashboard";
    $scope.stopTracking=function(){
      $rootScope.showAlert('Tracking stopped!!!');
      clearInterval(stop);
      stop="undefined";
    }
                        
    $scope.viewRoute=function(){
      $state.go('app.currentlocation');
    }
                             
     $scope.sendSMS=function(){
        var currentAddress =null;
         var number=[];
         var emergencyDetails=  window.localStorage.emergencyContacts;
         for(var i=0; i<3 ; i++){
             number = emergencyDetails.phones[0].value;
         }

        currentAddress =sessionStorage.address;
         if(currentAddress!= "undefined" && currentAddress !=null){
            sms.send(number, currentAddress , intent, success, error);
         }else{
             sms.send(number, "Testing App!!!" , intent, success, error);
         }
        
     }
     var success = function () { alert('Message sent successfully'); };
     var error = function (e) { alert('Message Failed:' + e); };
    $scope.startTracking=function(){
       /*  var flag_Tracking_Started=false;
           var param = {"sessionId":sessionId,"userId":userId};
           var url="http://123.63.36.182:8084/roster_app/api/v1/routes/travel-history/list/"+parseInt(sessionStorage.pickUpPoint)+"/"+sessionStorage.shiftTimmings;
           $http({
               url: url,
               dataType: "json",
               contentType: "application/json",
               method: "GET",
               timeout:50000,
               params: param
               
           }).success(function (data, status, headers, config) {
              //alert("GET successs: "+JSON.stringify(data));
              $ionicLoading.hide();
              flag_Tracking_Started=true;
              $rootScope.showAlert('Tracking started already');
              $state.go('app.currentlocation', null, { reload: true });
            }).error(function (data, status, headers, config) {
              flag_Tracking_Started=false;
                                   
            });
        setTimeout(function(){
        if (flag_Tracking_Started == false ) {
         */
         try {
        $ionicLoading.show({template: 'Loading...'});
        if(navigator.geolocation){
          navigator.geolocation.getCurrentPosition(geolocationSuccess,geolocationError,{ enableHighAccuracy: true });
        }
        }catch(err) {
          $rootScope.showAlert(err.message);
        }
        stop= setInterval(function(){ navigator.geolocation.getCurrentPosition(geolocationSuccess,geolocationError,{ enableHighAccuracy: true });}, 50000);
       //     }
       //  },2000);
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
                                         $http({
                                               url: url,
                                               dataType: "json",
                                               contentType: "application/json",
                                               method: "POST",
                                               timeout:50000,
                                               data: param
                                               
                                               }).success(function (data, status, headers, config) {
                                                           $ionicLoading.hide();
                                                          $state.go('app.currentlocation', null, { reload: true });
                                                          }).error(function (data, status, headers, config) {
                                                                    $ionicLoading.hide();
                                                                   $rootScope.showAlert('Error in sending updates to service');
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

.controller('currenLocationCtrl',['$scope','$state','$http','$rootScope', '$ionicLoading', '$ionicPopup' ,  function($scope, $state, $http ,$rootScope,  $ionicLoading, $ionicPopup , geolocation) {
                                  $scope.currentLocation=[];
                                  $scope.refresh=function(){
                                  $ionicLoading.show({template: 'Loading...'});
                                  var userId= sessionStorage.userId;
                                  var sessionId=  sessionStorage.sessionId;
                           
                                  var param = {"sessionId":sessionId,"userId":userId};
                                  var url="http://123.63.36.182:8084/roster_app/api/v1/routes/travel-history/list/"+parseInt(sessionStorage.pickUpPoint)+"/"+sessionStorage.shiftTimmings;
                                  $http({
                                        url: url,
                                        dataType: "json",
                                        contentType: "application/json",
                                        method: "GET",
                                        timeout:50000,
                                        params: param
                                        
                                        }).success(function (data, status, headers, config) {
                                                   // alert("GET successs: "+JSON.stringify(data));
                                                   $ionicLoading.hide();

                                                   $scope.currentLocation=data.data;
                                                   
                                                   }).error(function (data, status, headers, config) {
                                                            $ionicLoading.hide();

                                                            $rootScope.showAlert('Unable to reach server. Please try again');
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
            
            
            
            $scope.pickContact = function() { alert('in here');
            
            ContactsService.pickContact().then(
               function(contact) { alert('in 2');
               
               if($scope.data.selectedContacts.length < 3) {
               var found = JSON.stringify($filter('filter')($scope.data.selectedContacts, contact));
               if (found.length > 2) {
               alert('Contact Already Exists');
               } else {
               $scope.data.selectedContacts.push(contact);
               
               }
               }else{
               alert('Only three emergency contacts allowed');
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

            };
            
            $scope.removeContact = function(contact){ //alert(JSON.stringify(contact));
            //var index = $scope.bdays.indexOf(contact);alert(index);
            var confirmPopup = $ionicPopup.confirm({
                                                   title: 'Emergency Contact',
                                                   template: 'Are you sure you want to delete contact?'
                                                   });
            confirmPopup.then(function(res) {
                              if(res) {
                              console.log('Contact deleted');
                              $scope.data.selectedContacts.splice(contact,1);
                              window.localStorage.setItem('emergencyContacts', JSON.stringify($scope.data.selectedContacts));
                              } else {
                              console.log('cancelled');
                              }
                              });
            
            
            }
            });




