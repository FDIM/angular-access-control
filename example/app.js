"use strict";
/**
 * Each module has a <moduleName>.module.js file.  This file contains the angular module declaration -
 * angular.module("moduleName", []);
 * The build system ensures that all the *.module.js files get included prior to any other .js files, which
 * ensures that all module declarations occur before any module references.
 */
(function (app) {
    app.controller("AppController", ['$scope', '$rootScope', '$timeout', 'acl', function ($scope, $rootScope, $timeout, acl) {
        var adminIdentity = {
            isGuest: false,
            resources: {
                allowed: ["**"],
                denied: []
            }
        };
        var userIdentity = {
            isGuest: false,
            resources: {
                allowed: ["**"],
                denied: ["admin.**", 'user.account']
            }
        };
        var guestIdentity = {
            isGuest: true,
            resources: {
                allowed: [],
                denied: []
            }
        };
        var identities = [guestIdentity, userIdentity, adminIdentity];
        var index = 0;

        function doWork() {
            acl.init(identities[index]);
            index++;
            if (index > identities.length - 1) {
                index = 0;
            }
            $timeout(doWork, 2000);

        }
        doWork();
    }]);

    // The name of the module, followed by its dependencies (at the bottom to facilitate enclosure)
}(angular.module("app", ['ngAcl', 'ui.router'])));