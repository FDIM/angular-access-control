# ng-acl (angular access control)
[![Build Status](https://secure.travis-ci.org/FDIM/ng-acl.png?branch=master)](https://travis-ci.org/FDIM/ng-acl)
[![Coverage Status](https://coveralls.io/repos/FDIM/ng-acl/badge.svg?branch=master&service=github)](https://coveralls.io/r/FDIM/ng-acl/?branch=master)

Undocumented version is available for use. It does not include roles, as the list of resources is merged on server side.
## usage
When user logges in you have to initialize service with the identity (an object with resources that either grants access or denies it).

JS:

	app.config(function ($stateProvider) {
		$stateProvider.state('home', {
			url: '/home',
			views: {
				"main": {
					controller: 'HomeController as model',
					templateUrl: 'home/home.tpl.html'
				}
			},
			data: {
				pageTitle: 'Home',
				resource: 'home' // if access to this resource is not granted, state change will cancelled and 'acl.stateChangeDenied' event emitted with all available arguments. Case when identity is retrieved via ajax is also handled, state change (that requires access to a resource) will be blocked untill acl service is initialized.
			}
		});
	});
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
		$rootScope.$emit('acl.change', identity);
		$rootScope.$on('acl.stateChangeDenied', function (event, data) {
			console.info([event.name, data]);
			$state.go('home'); // data has all arguments that stateChangeStart gets
		});
	});

HTML:

    <* rr="home"></*>
    <* rr="user.profile.edit"></*>

Element will be removed from DOM when user doesn't have access to the resource and reinserted back when he gets it.

## the idea
Make a standard service and a directive to control access to certain parts of the application based on resources you have access to. 
Each user can belog to multiple roles (or just one if you get them from backend) that includes multiple resources - once you have this list you can control:
* which routes should be accesible
* which elements should be removed from templates

Resources will probably look like this:
* home
* home.newsfeed
* home.newsfeed.edit
* home.newsfeed.create

Each role would have a list of rules that would either grant or deny access to a specific resource.
For example: 
* 'home' would grant access to home resource, but not to home.newsfeed.
* 'home.*' would grant access to home and to home.newsfeed
* 'home.**' would grant access to all 'home' resources disregarding the level. 

Some kind of pattern matching algorithm would be in place, which could be invoked via service or availabe via multiple directives. E.g. rr="home.newsfeed.edit" (require-resource), if not granted remove element.
