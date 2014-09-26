
angular.module('starter', ['ionic', 'starter.controllers'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
    window.plugin.backgroundMode.enable();
  });
})

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
    });
    
// if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/login');
});

