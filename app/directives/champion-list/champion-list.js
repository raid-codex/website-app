(function () {
    angular.module("websiteApp").directive("championList", function () {

        return {
            restrict: 'E',
            scope: {
                showFilters: "=",
                filters: "=",
                showIcons: "=",
                allowAds: "=",
                replaceLoc: "=",
                ratingKey: "="
            },

            controller: function ($scope, $location, $filter, GoogleAnalytics, Champions, $q, Factions, StatusEffects) {

                var self = this;

                var canHaveLoc = false;
                self.filterData = {};
                var allowedFilters = {
                    "name": true,
                    "buff": true,
                    "debuff": true,
                    "type": true,
                    "element": true,
                    "faction": true,
                    "battle_enhancement": true,
                    "rating": false,
                };

                function init() {
                    if (typeof $scope.ratingKey === "undefined") {
                        self.ratingKey = "overall";
                    } else {
                        self.ratingKey = $scope.ratingKey;
                    }
                    if ($scope.allowAds === true) {
                        self.allowAds = true;
                    }
                    if ($scope.showFilters === true) {
                        self.showFilters = true;
                    } else if (typeof $scope.showFilters === "object") {
                        self.showFilters = true;
                        allowedFilters = $scope.showFilters;
                    } else {
                        self.showFilters = false;
                    }
                    self.showIcons = $scope.showIcons || [];
                    if ($scope.filters) {
                        canHaveLoc = false;
                        Object.keys($scope.filters).forEach(function (k) {
                            self.filterData[k] = $scope.filters[k];
                        });
                        console.log(self.filterData);
                    } else {
                        canHaveLoc = true;
                        var current = $location.search();
                        if (current.filter) {
                            try {
                                self.filterData = JSON.parse(atob(current.filter));
                                if (self.filterData.battle_enhancements && !self.filterData.battle_enhancement) {
                                    self.filterData.battle_enhancement = self.filterData.battle_enhancements;
                                }
                            } catch (e) {
                                console.error(e);
                                self.filterData = {};
                            }
                        }
                    }
                    if ($scope.replaceLoc === false) {
                        canHaveLoc = false;
                    }
                    $q.all([
                        loadChampions(),
                        loadFactions(),
                        loadStatusEffects(),
                    ]).then(function () {
                        self.loaded = true;
                    });
                    $scope.$watch(function () {
                        return JSON.stringify(self.filterData);
                    }, function () {
                        refreshLoc();
                    });
                }

                self.isFilterAllowed = function (filterName) {
                    var allowed = allowedFilters[filterName] === true;
                    return allowed;
                };

                self.effectFilterSelected = function (slug) {
                    var type = self.effectsBySlug[slug].type;
                    return ((self.filterData.battle_enhancement && self.filterData.battle_enhancement.indexOf(type) !== -1) ||
                        (self.filterData.buff && self.filterData.buff.indexOf(type) !== -1) ||
                        (self.filterData.debuff && self.filterData.debuff.indexOf(type) !== -1));
                };

                function loadStatusEffects() {
                    var deferred = $q.defer();
                    StatusEffects.all().then(function (res) {
                        self.statusEffects = res.data;
                        self.effectsSlugByType = {};
                        self.effectsBySlug = {};
                        var imgSlugs = [];
                        self.statusEffects.forEach(function (effect) {
                            if (!self.effectsSlugByType[effect.type]) {
                                self.effectsSlugByType[effect.type] = [];
                            }
                            if (effect.effect_type === "buff" || effect.effect_type === "debuff") {
                                imgSlugs.push(effect.slug);
                            }
                            self.effectsBySlug[effect.slug] = effect;
                            self.effectsSlugByType[effect.type].push(effect.slug);
                        });
                        if (self.showIcons === true) {
                            // convert catch all
                            self.showIcons = imgSlugs;
                        }
                        deferred.resolve();
                    }, function (err) {
                        console.error(err);
                        deferred.reject();
                    });
                    return deferred.promise;
                }

                function loadFactions() {
                    var deferred = $q.defer();
                    Factions.all().then(function (res) {
                        self.factions = res.data;
                        deferred.resolve();
                    }, function (err) {
                        console.error(err);
                        deferred.reject();
                    });
                    return deferred.promise;
                }

                function loadChampions() {
                    var deferred = $q.defer();
                    Champions.all(true).then(function (res) {
                        self.champions = res.data;
                        self.championsByName = {};
                        self.champions.forEach(function (champion) {
                            self.championsByName[champion.name] = champion;
                        });
                        deferred.resolve();
                    }, function (err) {
                        console.error(err);
                        deferred.reject();
                    });
                    return deferred.promise;
                }

                function refreshLoc() {
                    if (!canHaveLoc) {
                        return;
                    }
                    $location.search("filter", btoa(JSON.stringify(self.filterData)));
                }

                this.filterChampions = function (value, index, array) {
                    if (self.filterData.name && self.filterData.name !== "") {
                        if (value.name.toLowerCase().indexOf(self.filterData.name.toLowerCase()) === -1) {
                            return false;
                        }
                    }
                    if (self.filterData.faction && self.filterData.faction.length > 0) {
                        if (self.filterData.faction.indexOf(value.faction_slug) === -1) {
                            return false;
                        }
                    }
                    if (!filterStatusEffect("buff", value)) {
                        return false;
                    }
                    if (!filterStatusEffect("debuff", value)) {
                        return false;
                    }
                    if (!filterStatusEffect("battle_enhancement", value)) {
                        return false;
                    }
                    if (self.filterData.type && self.filterData.type.length > 0) {
                        if (self.filterData.type.indexOf(value.type) === -1) {
                            return false;
                        }
                    }
                    if (self.filterData.element && self.filterData.element.length > 0) {
                        if (self.filterData.element.indexOf(value.element) === -1) {
                            return false;
                        }
                    }
                    if (self.filterData.tag && self.filterData.tag.length > 0 && value.tags) {
                        if (value.tags.length == 0) {
                            // no tags means no match
                            return false;
                        }
                        for (var i = 0; i < value.tags.length; i++) {
                            if (self.filterData.tag.indexOf(value.tags[i]) === -1) {
                                return false;
                            }
                        }
                    }
                    if (self.filterData.rating && Object.keys(self.filterData.rating).length > 0) {
                        for (var k in self.filterData.rating) {
                            if (value.rating[k] !== self.filterData.rating[k]) {
                                return false;
                            }
                        }
                    }
                    return true;
                };

                var championEffectCache = {};

                self.championHasEffect = function (champion, effectSlug) {
                    var key = champion.slug + "-" + effectSlug;
                    if (typeof championEffectCache[key] === typeof undefined) {
                        var res = championHasEffect(champion, effectSlug);
                        championEffectCache[key] = res;
                    }
                    return championEffectCache[key];
                };

                function championHasEffect(champion, effectSlug) {
                    for (var i = 0; i < champion.skills.length; i++) {
                        var j;
                        for (j = 0; j < champion.skills[i].effects.length; j++) {
                            if (champion.skills[i].effects[j].slug == effectSlug) {
                                return true;
                            }
                        }
                        for (j = 0; champion.skills[i].upgrades && j < champion.skills[i].upgrades.length; j++) {
                            for (var k = 0; k < champion.skills[i].upgrades[j].effects.length; k++) {
                                if (champion.skills[i].upgrades[j].effects[k].slug === effectSlug) {
                                    return true;
                                }
                            }
                        }
                    }
                    return false;
                }

                function filterStatusEffect(key, value) {
                    if (self.filterData[key] && self.filterData[key].length > 0) {
                        var slugs = [];
                        self.filterData[key].forEach(function (type) {
                            slugs = slugs.concat(self.effectsSlugByType[type]);
                        });
                        for (var i = 0; i < value.skills.length; i++) {
                            var j;
                            for (j = 0; j < value.skills[i].effects.length; j++) {
                                if (slugs && slugs.indexOf(value.skills[i].effects[j].slug) !== -1) {
                                    return true;
                                }
                            }
                            for (j = 0; j < value.skills[i].upgrades.length; j++) {
                                for (var k = 0; k < value.skills[i].upgrades[j].effects.length; k++) {
                                    if (slugs && slugs.indexOf(value.skills[i].upgrades[j].effects[k].slug) !== -1) {
                                        return true;
                                    }
                                }
                            }
                        }
                        return false;
                    }
                    return true;
                }

                this.emptySelect = function (v) {
                    if (v) {
                        v.splice(0, v.length);
                    }
                };

                init();


            },
            controllerAs: "$ctrl",
            //bindToController: true,
            templateUrl: "app/directives/champion-list/champion-list.html",
        };

    });

}).apply(this);
