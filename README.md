# angular access control (acl)
Undocumented version is available for use. It does not include roles, as the list of resources is merged on server side.
## usage
When user logges in you have to initialize service with the identity (an object with resources that either grants access ot denies it).
Example:

    $rootScope.$on("auth.change", function (event, identity) {
	  		  acl.init(identity);
	  		  $rootScope.identity = identity;
	  	  	// notify that acl resources have changed
	    		$rootScope.$emit('acl.change', identity);
    });

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
