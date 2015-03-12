/**
 * Each module has a <moduleName>.module.js file.  This file contains the angular module declaration -
 * angular.module("moduleName", []);
 * The build system ensures that all the *.module.js files get included prior to any other .js files, which
 * ensures that all module declarations occur before any module references.
 */
(function (module) {
	// handle state change events
	module.run(function ($rootScope, $state, $timeout, acl) {
		$rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
			// check if resource is required to access the page
			if (!toState || !toState.data || !toState.data.resource) {
				return;
			}
			//delay state change untill acl is initialized
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
	});

	// acl service used to validate resources.
	module.service('acl', function () {

		this.initialized = false;
		this.resources = {
			allowed: [],
			denied: []
		};
		this.init = function (identity) {
			this.initialized = true;
			this.rulesCache = {};
			this.resources = identity.resources;
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
		 * Check if currently loggedin user has access to specified resource
		 * @param resource
		 * @return boolean
		 */
		this.isAllowed = function (resource) {
			var allowed = false;
			// go through all allowed rules and figure out if resource is accessible
			for (var i = 0; i < this.resources.allowed.length; i++) {
				allowed = this.testRule(this.resources.allowed[i], resource);
				if (allowed) {
					break;
				}
			}
			if (allowed) {
				// go through all denied rules and figure out if resource is accessible
				for (i = 0; i < this.resources.denied.length; i++) {
					allowed = !this.testRule(this.resources.denied[i], resource);
					if (!allowed) {
						break;
					}
				}
			}
			return allowed;
		};
	});
	// directive used to adjust html based on acl resource.
	module.directive('rr', function (acl, $rootScope) {
		var list = {};

		function validateAccess(resources) {
			var allowed = false;
			// check if any resource in the list is allowed
			var parts = resources.split(',');
			for (var i = 0; i < parts.length; i++) {
				allowed = acl.isAllowed(parts[i]);
				if (allowed) {
					break;
				}
			}
			return allowed;
		}
		$rootScope.$on("acl.change", function (event, identity) {
			for (var resources in list) {
				var allowed = validateAccess(resources);
				for (var i = 0; i < list[resources].length; i++) {
					if (allowed) {
						list[resources][i].element.insertAfter(list[resources][i].placeholder);
					} else {
						list[resources][i].element.detach();
					}
				}
			}
		});
		return {
			restrict: 'A',
			link: function (scope, element, attrs) {
				if (typeof list[attrs.rr] === 'undefined') {
					list[attrs.rr] = [];
				}
				var comment = $(document.createComment("rr=" + attrs.rr));
				comment.insertBefore(element);
				element.detach();
				// remember the data to be able to reconstruct view
				list[attrs.rr].push({
					element: element,
					placeholder: comment
				});
				if (acl.initialized && validateAccess(attrs.rr)) {
					element.insertAfter(comment);
				}
			}
		};
	});
	// The name of the module, followed by its dependencies (at the bottom to facilitate enclosure)
}(angular.module("acl", [])));