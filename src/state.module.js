"use strict";
/**
 * Each module has a <moduleName>.module.js file.  This file contains the angular module declaration -
 * angular.module("moduleName", []);
 * The build system ensures that all the *.module.js files get included prior to any other .js files, which
 * ensures that all module declarations occur before any module references.
 */
(function (module) {
  // handle state change events
  module.run(['$rootScope', '$state', '$timeout', 'acl', function ($rootScope, $state, $timeout, acl) {
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
      // check if resource is required to access the page
      if (!toState || !toState.data || !toState.data.resource) {
        return;
      }
      //delay state change until acl is initialized
      if (!acl.initialized) {
        event.preventDefault();
        $timeout(function () {
          $state.go(toState, toParams);
        }, 50);
        return;
      }
      if (!acl.isAllowed(toState.data.resource)) {
        event.preventDefault();
        // notify if someone is interested
        $rootScope.$emit('acl.stateChangeDenied', {
          event: event,
          toState: toState,
          toParams: toParams,
          fromState: fromState,
          fromParams: fromParams
        });
        return;
      }
    });
  }]);
  // The name of the module, followed by its dependencies (at the bottom to facilitate enclosure)
}(angular.module("ngAcl.states", ['ngAcl', 'ui.router'])));