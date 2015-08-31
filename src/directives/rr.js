"use strict";
/**
 * Each module has a <moduleName>.module.js file.  This file contains the angular module declaration -
 * angular.module("moduleName", []);
 * The build system ensures that all the *.module.js files get included prior to any other .js files, which
 * ensures that all module declarations occur before any module references.
 */
(function (module) {
  // directive used to adjust html based on acl resource.
  module.directive('rr', ['acl', '$rootScope', function (acl, $rootScope) {
    var list = {};


    $rootScope.$on("acl.change", function (event, identity) {
      for (var resources in list) {
        var allowed = acl.isAllowed(resources);
        for (var i = 0; i < list[resources].length; i++) {
          if (allowed) {
            list[resources][i].placeholder.parentNode.insertBefore(list[resources][i].element[0], list[resources][i].placeholder);
          } else {
            list[resources][i].element.detach();
          }
        }
      }
    });
    return {
      restrict: 'A',
      terminal: true,
      link: function (scope, element, attrs) {
        if (typeof list[attrs.rr] === 'undefined') {
          list[attrs.rr] = [];
        }
        var comment = document.createComment("rr=" + attrs.rr);
        element[0].parentNode.insertBefore(comment, element[0]);
        element.detach();
        // remember the data to be able to reconstruct view
        list[attrs.rr].push({
          element: element,
          placeholder: comment
        });
        if (acl.initialized && acl.isAllowed(attrs.rr)) {
          comment.parentNode.insertBefore(element[0], comment);
          //element.insertAfter(comment);
        }
      }
    };
	}]);
  // The name of the module, followed by its dependencies (at the bottom to facilitate enclosure)
}(angular.module("ngAcl.directives", ['ngAcl.services'])));