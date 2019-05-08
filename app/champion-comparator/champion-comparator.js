(function () {
    angular.module("websiteApp").controller("ChampionComparatorCtrl", function ($scope, $location, $filter, GoogleAnalytics, Champions, $q) {

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

        function setDefaultCmpStats() {
            $scope.cmpStats = ["rarity", "rating.overall"];
        }

        function setupStep() {
            var obj = $location.search();
            if (obj.champions && obj.champions !== "") {
                var champions = obj.champions.split(",");
                champions.forEach(function (name) {
                    $scope.cmpList.push($scope.championsByName[name]);
                });
            }
            if (obj.stats && obj.stats !== "") {
                var stats = obj.stats.split(",");
                $scope.cmpStats = [];
                stats.forEach(function (stat) {
                    if (!$scope.allowedStats[stat]) { return; }
                    $scope.cmpStats.push(stat);
                });
            }
            if ($scope.cmpStats.length === 0) {
                setDefaultCmpStatus();
            }
            refreshLoc();
        }

        function loadChampions() {
            var deferred = $q.defer();
            Champions.all().then(function (res) {
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
                GoogleAnalytics.event("ChampionComparator", "AddChampion", champion, $scope.cmpList.length);
            }
        };

        $scope.removeFromCompareList = function (champion) {
            var index = $scope.cmpList.indexOf(champion);
            if (index > -1) {
                $scope.cmpList.splice(index, 1);
                refreshLoc();
                GoogleAnalytics.event("ChampionComparator", "RemoveChampion", champion, $scope.cmpList.length);
            }
        };

        function refreshLoc() {
            var str = [];
            $scope.cmpList.forEach(function (champion) {
                str.push(champion.name);
                GoogleAnalytics.event("ChampionComparator", "Champion", champion.name, $scope.cmpList.length);
            });
            var obj = {};
            $scope.cmpStats.forEach(function (stat) {
                GoogleAnalytics.event("ChampionComparator", "Stat", stat, $scope.cmpStats.length);
            });
            if ($scope.cmpStats.length > 0) {
                obj.stats = $scope.cmpStats.join(",");
            }
            if (str.length > 0) {
                obj.champions = str.join(",");
            }
            $location.search(obj);
        }

        $scope.getChampionAttr = function (champion, attr) {
            var data = attr.split(".");
            var value = champion;
            data.forEach(function (data_attr) {
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
                GoogleAnalytics.event("ChampionComparator", "RemoveStat", stat, $scope.cmpStats.length);
            } else {
                $scope.cmpStats.push(stat);
                GoogleAnalytics.event("ChampionComparator", "AddStat", stat, $scope.cmpStats.length);
            }
            refreshLoc();
        };

        init();


    });

}).apply(this);
