(function () {
    angular.module('websiteApp').directive('championMasteries', function () {

        return {
            restrict: 'E',
            scope: {
                champion: '=',
                masteries: '=',
                readOnly: '='
            },
            templateUrl: 'app/directives/champion-masteries/champion-masteries.html',
            replace: true,
            controller: function ($scope) {
                console.log($scope);
            },
            controllerAs: "$ctrl",
        };
    });

}).apply(this);
