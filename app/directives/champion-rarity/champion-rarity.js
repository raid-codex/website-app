(function () {
    angular.module('websiteApp').directive('championRarity', function () {

        return {
            restrict: 'E',
            scope: {
                champion: '='
            },

            templateUrl: 'app/directives/champion-rarity/champion-rarity.html',

            replace: true,
        };
    });
}).apply(this);
