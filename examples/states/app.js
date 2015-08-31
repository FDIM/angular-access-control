"use strict";
/**
 * Each module has a <moduleName>.module.js file.  This file contains the angular module declaration -
 * angular.module("moduleName", []);
 * The build system ensures that all the *.module.js files get included prior to any other .js files, which
 * ensures that all module declarations occur before any module references.
 */
(function (app) {
  app.config(function ($stateProvider, $urlRouterProvider) {
    //
    // For any unmatched url, redirect to /state1
    $urlRouterProvider.otherwise("/state1");
    //
    // Now set up the states
    $stateProvider
      .state('state1', {
        url: "/state1",
        template: "partials/state1.html"
      })
      .state('state2', {
        url: "/state2",
        data: {
          resource: 'user.account'
        },
        template: "partials/state2.html"
      }).state('state3', {
        url: "/state3",
        template: "partials/state3.html"
      });
  });
  app.controller("AppController", ['$scope', '$rootScope', '$timeout', 'acl', function ($scope, $rootScope, $timeout, acl) {
    $scope.message = false;
    var cleanup = $rootScope.$on('$stateChangeStart', function (event) {
      if (!event.defaultPrevented) {
        $scope.message = "";
      }
    });
    var cleanup2 = $rootScope.$on('acl.stateChangeDenied', function () {
      $scope.message = "State change not authorized";
    });
    $scope.$on('$destroy', function () {
      cleanup();
      cleanup2();
    });
    var userIdentity = {
      isGuest: false,
      resources: {
        allowed: ["**"],
        denied: ["admin.**", 'user.account']
      }
    };

    acl.init(userIdentity);
  }]);

  // The name of the module, followed by its dependencies (at the bottom to facilitate enclosure)
}(angular.module("app", ['ngAcl', 'ngAcl.states'])));