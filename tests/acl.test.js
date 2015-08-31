"use strict";

/**
 * Tests sit right alongside the file they are testing, which is more intuitive
 * and portable than separating `src` and `test` directories. Additionally, the
 * build process will exclude all `.spec.js` files from the build
 * automatically.
 */
describe('acl', function () {
  beforeEach(module('ngAcl.services'));
  beforeEach(module('ngAcl.directives'));
  var acl,
    $compile,
    $rootScope;
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
  beforeEach(inject(function (_$compile_, _$rootScope_, _acl_) {
    // The injector unwraps the underscores (_) from around the parameter names when matching
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    acl = _acl_;
  }));

  it("should not fail with empty identity", function () {
    var identity = {
      name: "user"
    };
    acl.init(identity);
    expect(acl.identity).toBe(identity);
    expect(acl.identity.resources).toBeDefined();
    expect(acl.identity.resources.allowed).toBeDefined();
    expect(acl.identity.resources.denied).toBeDefined();

  });
  it("should fail with identity without resources", function () {
    expect(function () {
      acl.init({
        resources: {}
      });
    }).toThrow(new Error("resources must be an object with allowed and denied properties or unspecified at all"));
  });
  var allowed = function (r) {
    it("should have access to " + r, function () {
      expect(acl.isAllowed(r)).toBe(true);
    });
  };
  var notAllowed = function (r) {
    it("should not have access to " + r, function () {
      expect(acl.isAllowed(r)).toBe(false);
    });
  };
  describe("admin", function () {
    beforeEach(function () {
      acl.init(adminIdentity);
    });
    it("should be loggedin", function () {
      expect(acl.isAllowed("loggedin")).toBe(true);
    });
        ['user.profile', 'user'].forEach(allowed);
        ['admin.orders.summary', 'admin.users'].forEach(allowed);
    allowed("loggedin,admin");

  });
  describe("user", function () {
    beforeEach(function () {
      acl.init(userIdentity);
    });
    it("should be loggedin", function () {
      expect(acl.isAllowed("loggedin")).toBe(true);
    });
        ['user.profile', 'user.test'].forEach(allowed);
        ['admin.orders.summary', 'admin', 'admin.chat', 'user.account'].forEach(notAllowed);
    notAllowed("loggedin,admin");
  });
  describe("guest", function () {
    beforeEach(function () {
      acl.init(guestIdentity);
    });
    it("should not be loggedin", function () {
      expect(acl.isAllowed("loggedin")).toBe(false);
    });
        ['admin.orders.summary', 'user.profile', 'booking'].forEach(notAllowed);
  });

  describe("directive", function () {
    var template = [
            '<div>hello ',
                '<span rr="!loggedin">guest</span>',
                '<span rr="admin">super </span>',
                '<span rr="loggedin">user</span>',
            '</div>'].join('');
    var template2 = [
            '<div>',
                '<span rr="loggedin,admin">loggedin and an admin</span>',
            '</div>'].join('');
    var template3 = [
            '<div>',
                '<span rr="user.account|user.profile">profile or account</span>',
            '</div>'].join('');
    it("should say hello guest for guestsIdentity", function () {
      acl.init(guestIdentity);
      var element = $compile(template)($rootScope);
      $rootScope.$digest(); // process all directives
      expect(element.text()).toEqual("hello guest");
    });
    it("should say hello guest for guestsIdentity and hello user later on", function () {
      acl.init(guestIdentity);
      var element = $compile(template)($rootScope);
      $rootScope.$digest(); // process all directives
      expect(element.text()).toEqual("hello guest");
      // change acl
      acl.init(userIdentity);
      $rootScope.$digest(); // process all directives
      expect(element.text()).toEqual("hello user");
    });
    it("should not say loggedin and an admin for guestsIdentity", function () {
      acl.init(guestIdentity);
      var element = $compile(template2)($rootScope);
      $rootScope.$digest(); // process all directives
      expect(element.text()).not.toEqual("loggedin and an admin");
    });
    it("should not say profile or account for guestsIdentity", function () {
      acl.init(guestIdentity);
      var element = $compile(template3)($rootScope);
      $rootScope.$digest(); // process all directives
      expect(element.text()).not.toEqual("profile or account");
    });
    it("should say hello user for userIdentity", function () {
      acl.init(userIdentity);
      var element = $compile(template)($rootScope);
      $rootScope.$digest(); // process all directives
      expect(element.text()).toEqual("hello user");
    });
    it("should not say loggedin and an admin for userIdentity", function () {
      acl.init(userIdentity);
      var element = $compile(template2)($rootScope);
      $rootScope.$digest(); // process all directives
      expect(element.text()).not.toEqual("loggedin and an admin");
    });
    it("should say profile or account for userIdentity", function () {
      acl.init(userIdentity);
      var element = $compile(template3)($rootScope);
      $rootScope.$digest(); // process all directives
      expect(element.text()).toEqual("profile or account");
    });
    it("should say hello super user for adminIdentity", function () {
      acl.init(adminIdentity);
      var element = $compile(template)($rootScope);
      $rootScope.$digest(); // process all directives
      expect(element.text()).toEqual("hello super user");
    });
    it("should say loggedin and an admin for adminIdentity", function () {
      acl.init(adminIdentity);
      var element = $compile(template2)($rootScope);
      $rootScope.$digest(); // process all directives
      expect(element.text()).toEqual("loggedin and an admin");
    });
    it("should say profile or account for adminIdentity", function () {
      acl.init(adminIdentity);
      var element = $compile(template3)($rootScope);
      $rootScope.$digest(); // process all directives
      expect(element.text()).toEqual("profile or account");
    });
  });
});