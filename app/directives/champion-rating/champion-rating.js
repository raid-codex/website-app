(function () {
    angular.module('websiteApp').directive('championRating', function () {

        return {
            restrict: 'E',
            scope: {
                rating: '='
            },

            controller: function ($scope) {
                $scope.faForPosition = function (pos) {
                    switch (pos) {
                        case 1:
                            return ["C", "B", "A", "S", "SS"].indexOf($scope.rating) === -1 ? "far" : "fas";
                        case 2:
                            return ["B", "A", "S", "SS"].indexOf($scope.rating) === -1 ? "far" : "fas";
                        case 3:
                            return ["A", "S", "SS"].indexOf($scope.rating) === -1 ? "far" : "fas";
                        case 4:
                            return ["S", "SS"].indexOf($scope.rating) === -1 ? "far" : "fas";
                        case 5:
                            return ["SS"].indexOf($scope.rating) === -1 ? "far" : "fas";
                    }
                };
            },

            templateUrl: 'app/directives/champion-rating/champion-rating.html',

            replace: true,
        };
    });
}).apply(this);