(function () {
    angular.module("websiteApp", []);

    angular.module("websiteApp").filter('capitalize', function () {
        function startCase(str) {
            var split = str.split(" ");
            var data = [];
            split.forEach(function (sp) {
                data.push(sp.charAt(0).toUpperCase() + sp.slice(1));
            });
            return data.join(" ");
        }

        return function (input) {
            return (!!input) ? startCase(input.toLowerCase()) : '';
        };
    });

    angular.module("websiteApp").run(function ($rootScope) {
        $rootScope.websiteUrl = "https://raid-codex.com";
        $rootScope.apiUrl = "https://raid-codex.github.io/data/";
    });

    angular.module("websiteApp").factory("GoogleAnalytics", function () {

        this.ga = function (p1, p2) {
            if (typeof ga === "function") {
                ga(p1, p2);
            }
        };

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

    angular.module("websiteApp").factory("Champions", function ($http, $q, $rootScope) {

        this.all = function () {
            var deferred = $q.defer();
            $http({
                method: "GET",
                url: $rootScope.apiUrl + "/champions/current/index.json",
            }).then(deferred.resolve, deferred.reject);
            return deferred.promise;
        };

        return this;

    });

    angular.module("websiteApp").factory("Factions", function ($http, $q, $rootScope) {

        this.all = function () {
            var deferred = $q.defer();
            $http({
                method: "GET",
                url: $rootScope.apiUrl + "/factions/current/index.json",
            }).then(deferred.resolve, deferred.reject);
            return deferred.promise;
        };

        return this;

    });

    angular.module("websiteApp").factory("StatusEffects", function ($http, $q, $rootScope) {

        this.all = function () {
            var deferred = $q.defer();
            $http({
                method: "GET",
                url: $rootScope.apiUrl + "/status-effects/current/index.json",
            }).then(deferred.resolve, deferred.reject);
            return deferred.promise;
        };

        return this;

    });

}).apply(this);
