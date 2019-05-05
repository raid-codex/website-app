(function () {
    angular.module("websiteApp").controller("ChampionComparatorCtrl", function ($scope, $http, $location, $q, $filter) {

        $scope.allowedStats = {
            "rarity": {},
            "element": {},
            "type": {},
            "rating.overall": { header: "Rating (overall)", },
            "rating.campaign": { header: "Rating (campaign)", },
            "rating.clan_boss_without_giant_slayer": { header: "Rating (clan boss no GS)", },
            "rating.clan_boss_with_giant_slayer": { header: "Rating (clan boss with GS)", },
            "rating.arena_offense": { header: "Rating (arena)", },
            "rating.arena_defense": { header: "Rating (defense arena)", },
            "rating.ice_guardian": { header: "Rating (Ice Golem's Peak)", },
            "rating.dragon": { header: "Rating (Draong's Lair)", },
            "rating.spider": { header: "Rating (Spider's Den)", },
            "rating.fire_knight": { header: "Rating (Fire Knight's Castle)", },
            "rating.minotaur": { header: "Rating (Minotaur's Labyrinth)", },
            "rating.force_dungeon": { header: "Rating (Force Keep)", },
            "rating.spirit_dungeon": { header: "Rating (Spirit Keep)", },
            "rating.void_dungeon": { header: "Rating (Void Keep)", },
            "rating.magic_dungeon": { header: "Rating (Magic Keep)", },
        };

        function init() {
            $scope.cmpList = [];
            setDefaultCmpStats();
            loadChampions().then(function () {
                setupStep();
            });
        }

        function setDefault() {
            $location.search({});
        }

        function setDefaultCmpStats() {
            $scope.cmpStats = ["rarity", "rating.overall"];
        }

        function setupStep() {
            var obj = $location.search();
            if (obj.champions !== "") {
                var champions = obj.champions.split(",");
                champions.forEach(function (name) {
                    $scope.cmpList.push($scope.championsByName[name]);
                });
            }
            var stats = obj.stats.split(",");
            $scope.cmpStats = [];
            stats.forEach(function (stat) {
                if (!$scope.allowedStats[stat]) { return; }
                $scope.cmpStats.push(stat);
            });
            if ($scope.cmpStats.length === 0) {
                setDefaultCmpStatus();
            }
        }

        function loadChampions() {
            var deferred = $q.defer();
            $http({
                method: "GET",
                url: "https://raid-codex.github.io/champions/export/current/index.json",
            }).then(function (res) {
                $scope.champions = res.data;
                $scope.championsByName = {};
                $scope.champions.forEach(function (champion) {
                    $scope.championsByName[champion.name] = champion;
                });
                deferred.resolve();
            }, function (err) {
                console.error(err);
                deferred.reject();
            });
            return deferred.promise;
        }

        $scope.addToCompareList = function (champion) {
            if ($scope.cmpList.indexOf(champion) === -1) {
                $scope.cmpList.push(champion);
                $scope.search.name = "";
                refreshLoc();
            }
        };

        $scope.removeFromCompareList = function (champion) {
            var index = $scope.cmpList.indexOf(champion);
            if (index > -1) {
                $scope.cmpList.splice(index, 1);
                refreshLoc();
            }
        };

        function refreshLoc() {
            var str = [];
            $scope.cmpList.forEach(function (champion) {
                str.push(champion.name);
            });
            $location.search({ "champions": str.join(","), "step": "compare", "stats": $scope.cmpStats.join(",") });
        }

        $scope.getChampionAttr = function (champion, attr) {
            var data = attr.split(".");
            var value = champion;
            _.forEach(data, function (data_attr) {
                value = value[data_attr];
            });
            return value;
        };

        $scope.getHeader = function (attr) {
            if ($scope.allowedStats[attr] && $scope.allowedStats[attr].header) {
                return $scope.allowedStats[attr].header;
            }
            return $filter("capitalize")(attr);
        };

        $scope.statClick = function (stat) {
            var index = $scope.cmpStats.indexOf(stat);
            if (index > -1) {
                $scope.cmpStats.splice(index, 1);
            } else {
                $scope.cmpStats.push(stat);
            }
        };

        init();


    });

}).apply(this);
