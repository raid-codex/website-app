(function () {
    angular.module("websiteApp", []);

    angular.module("websiteApp").filter('capitalize', function () {
        return function (input) {
            return (!!input) ? _.startCase(_.toLower(input)) : '';
        };
    });

    angular.module("websiteApp").run(function ($rootScope) {
        $rootScope.websiteUrl = "https://raid-codex.com";
    });

    angular.module("websiteApp").factory("GoogleAnalytics", function () {

        if (typeof ga === "function") {
            this.ga = ga;
        } else {
            this.ga = function () {
                console.log("ga", this.arguments);
            };
        }

        this.event = function (category, action, label, value) {
            this.ga("send", {
                hitType: "event",
                eventCategory: category,
                eventAction: action,
                eventLabel: label,
                eventValue: value,
            });
        };

        return this;
    });

    angular.module("websiteApp").factory("Champions", function ($http, $q) {

        this.all = function () {
            var deferred = $q.defer();
            $http({
                method: "GET",
                url: "https://raid-codex.github.io/champions/export/current/index.json",
            }).then(deferred.resolve, deferred.reject);
            return deferred.promise;
        };

        return this;

    });

}).apply(this);
