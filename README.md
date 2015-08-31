# ng-acl (angular access control)
[![Build Status](https://secure.travis-ci.org/FDIM/ng-acl.png?branch=master)](https://travis-ci.org/FDIM/ng-acl)
[![Coverage Status](https://coveralls.io/repos/FDIM/ng-acl/badge.svg?branch=master&service=github)](https://coveralls.io/github/FDIM/ng-acl?branch=master)

Angular Access Control List module that enables granular control of ui elements, controller logic or states based on current user's resources. A directive and a service exists for this purpose. Optional sub-module exists for angular ui router to be used together with various states.

## idea
Each role have a list of rules that would either grant or deny access to a specific resource. This module does not handle multiple roles, as it expects backend to give finalized list of resources.

Resources look like this:
* home
* home.newsfeed
* home.newsfeed.edit
* home.newsfeed.create

Rules look like this: 
* 'home' would grant access to home resource, but not to home.newsfeed.
* 'home.*' would grant access to home and to home.newsfeed but not home.newsfeed.edit
* 'home.**' would grant access to all 'home' resources disregarding the level. 

## installation
As simple as "bower install ng-acl" :)

## usage
During bootstrap or at any later point in time you have to initialize service with the identity that includes associated resources. Up until then, acl service will hide all elements that rr directive is bound to, state change to a protected state will be delayed until service is initialized. Identity object must include isGuest property.

JS:

	app.run(function ($rootScope, acl, $state) {
		$rootScope.identity = {
			isGuest: false, // can be used with ng-if to toggle other content if user is logged in or not
			id: 0,
			name: 'Test',
			resources:{
				allowed:['home', 'user.**'],
				denied:['user.profile.edit']
			}
		};
		acl.init($rootScope.identity);
		$rootScope.$on('acl.stateChangeDenied', function (event, data) {
			console.info([event.name, data]);
			$state.go('home'); // data has all arguments that stateChangeStart gets
		});
	});

HTML:

    <* rr="home"></*>
    <* rr="user.profile.edit"></*>

Element will be detached from DOM when user doesn't have access to the resource and reinserted back when he gets it. It is perfectly fine to reinitialize acl service with new identity as this will trigger validation of each element that rr directive is bound to.

Have a look at examples to see this module in action.
