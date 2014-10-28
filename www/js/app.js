
angular.module('starter', ['ionic', 'starter.controllers'])

.run(function($ionicPlatform, $window, $rootScope,$n, $state) {
        document.addEventListener("offline", $n.onOffline, false);
        document.addEventListener("online", $n.onOnline, false);

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
      navigator.splashscreen.hide();
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
    window.plugin.backgroundMode.enable();

  });
        $ionicPlatform.registerBackButtonAction(function () {
          //alert('ifff: '+$rootScope.page);
          if($rootScope.page != "dashboard" && $rootScope.page != "login"){
             
              $state.go('app.dashboard');
          }else{
           // alert('else: '+$rootScope.page);
            navigator.Backbutton.goHome(function() {
                     alert('success');
                }, function() {
                     alert('fail');
                });
          }
        }, 1000);
  
})

.service("$n", ["$config", "$location", "$window", "$state", "$rootScope",
    function($config, $location, $window, $state, $root){
        var $n = {

            connected : true,

            onOffline : function(){
                $root.$apply(function(){
                    $n.connected = false;
                    $state.go('app.nonetwork');
                });
            },

            onOnline : function(){
                $root.$apply(function(){
                    $n.connected = true;
                    $window.history.back();
                   // $state.go('app.dashboard');
                });

            }
        };
        return $n;
    }])

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('app', {
      url: "/app",
      abstract: true,
      templateUrl: "templates/menu.html",
      controller: 'AppCtrl'
    })
    
    .state('app.login', {
           url: "/login",
            views: {
            'menuContent' :{
            templateUrl: "templates/login.html",
            controller: 'loginCtrl'
            }
           }
    })
        
    .state('app.profile', {
        url: "/profile",
        views: {
        'menuContent' :{
        templateUrl: "templates/profile.html",
        controller: 'profileCtrl'
        }
      }
    })
    .state('app.dashboard', {
        url: "/dashboard",
        views: {
        'menuContent' :{
        templateUrl: "templates/dashboard.html",
        controller: 'dashboardCtrl'
        }
      }
    })
        
    .state('app.currentlocation', {
        url: "/currentlocation",
        views: {
        'menuContent' :{
        templateUrl: "templates/currentlocation.html",
        controller: 'currenLocationCtrl'
        }
      }
    })
    .state('app.emergencydetails', {
       url: "/emergencydetails",
       views: {
       'menuContent' :{
       templateUrl: "templates/emergencydetails.html",
       controller: 'EmergDetailsCtrl'
       }
        }
    })
    .state('app.nonetwork', {
       url: "/nonetwork",
       views: {
       'menuContent' :{
         templateUrl: "templates/nonetwork.html",
         controller: 'nonetworkCtrl'
        }
     }
    });
    
// if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/login');
});

