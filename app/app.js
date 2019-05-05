(function () {
    angular.module("websiteApp", ["templates"]);

    angular.module("websiteApp").filter('capitalize', function () {
        return function (input) {
            return (!!input) ? _.startCase(_.toLower(input)) : '';
        };
    });

    angular.module("websiteApp").run(function ($rootScope) {
        $rootScope.websiteUrl = "https://raid-codex.com";
    });

}).apply(this);
