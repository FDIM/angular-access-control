"use strict";
/**
 * Each module has a <moduleName>.module.js file.  This file contains the angular module declaration -
 * angular.module("moduleName", []);
 * The build system ensures that all the *.module.js files get included prior to any other .js files, which
 * ensures that all module declarations occur before any module references.
 */
(function (module) {
  var SEPARATOR_AND = ',';
  var SEPARATOR_OR = '|';
  // acl service used to validate resources.
  module.service('acl', ['$rootScope', function ($rootScope) {

    this.initialized = false;
    this.identity = {};
    this.init = function (identity) {
      this.initialized = true;
      this.rulesCache = {};
      this.identity = identity;
      if (!this.identity.resources) {
        this.identity.resources = {
          allowed: [],
          denied: []
        };
      }
      if (!this.identity.resources.allowed || !this.identity.resources.allowed) {
        throw new Error("resources must be an object with allowed and denied properties or unspecified at all");
      }
      $rootScope.$emit('acl.change', identity);
    };
    /**
     * Check if given rule matches resource
     * @param rule
     * @param resource
     * @return boolean
     */
    this.testRule = function (rule, resource) {
      // try most simple case
      if (rule === resource) {
        return true;
      }
      // otherwise do partial matching with wildcards
      var preparedRule;
      var preparedRes;
      // was this rule tested before?
      if (typeof (this.rulesCache[rule]) !== 'undefined') {
        preparedRule = this.rulesCache[rule];
      } else {
        preparedRule = this.rulesCache[rule] = rule.split(".");
      }
      // was this resource tested before?
      if (typeof (this.rulesCache[resource]) !== 'undefined') {
        preparedRes = this.rulesCache[resource];
      } else {
        preparedRes = this.rulesCache[resource] = resource.split(".");
      }
      //	check parts of the resource and rule to see if they match
      //	subj: user.config.edit
      //	rule: user.config.*	//ok
      //	rule: user.*		//not ok
      //	rule: user.**		//ok
      //	rule: **			//ok
      var res = false;
      for (var i = 0; i < preparedRes.length; i++) {
        // not enough segments, check if last part is a double wildcard, if its not - rule doesn't match resource
        if (typeof preparedRule[i] === 'undefined') {
          res = preparedRule[preparedRule.length - 1] === '**';
          break;
        }
        if (preparedRule[i] === preparedRes[i] || preparedRule[i] === '*' || preparedRule[i] == '**') {
          res = true;
        } else {
          // no partial match, rule doesn't match
          res = false;
          break;
        }
      }
      return res;
    };
    /**
     * Check if currently loggedin user has access to specified resource or resources
     * @param resource
     * @return boolean
     */
    this.isAllowed = function (resources) {
      var allowed = false;
      var parts;
      var oneIsEnough = true;
      // check if any resource in the list is allowed
      if (resources.indexOf(SEPARATOR_AND) !== -1) {
        parts = resources.split(SEPARATOR_AND);
        oneIsEnough = false;
      } else {
        parts = resources.split(SEPARATOR_OR);
      }
      for (var i = 0; i < parts.length; i++) {
        allowed = this.$isAllowed(parts[i]);
        if (oneIsEnough && allowed) {
          break;
        }
      }
      return allowed;
    };

    /**
     * Check if currently loggedin user has access to specified resource
     * @param resource
     * @return boolean
     */
    this.$isAllowed = function (resource) {
      var invert = false;
      if (resource.charAt(0) === '!') {
        invert = true;
        resource = resource.substring(1);
      }
      var allowed = false;
      if (resource == "loggedin") {
        allowed = this.identity && this.identity.isGuest === false;
      } else {
        // go through all allowed rules and figure out if resource is accessible
        for (var i = 0; i < this.identity.resources.allowed.length; i++) {
          allowed = this.testRule(this.identity.resources.allowed[i], resource);
          if (allowed) {
            break;
          }
        }
        if (allowed) {
          // go through all denied rules and figure out if resource is accessible
          for (i = 0; i < this.identity.resources.denied.length; i++) {
            allowed = !this.testRule(this.identity.resources.denied[i], resource);
            if (!allowed) {
              break;
            }
          }
        }
      }
      return invert ? !allowed : allowed;
    };
	}]);
  // The name of the module, followed by its dependencies (at the bottom to facilitate enclosure)
}(angular.module("ngAcl.services", [])));