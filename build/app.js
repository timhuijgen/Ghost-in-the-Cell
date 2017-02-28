/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.l = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };

/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};

/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};

/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Factories__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__Factory__ = __webpack_require__(3);



class Game {

    constructor(links, factoryCount, linkCount, moveMap) {
        this.actions = [];
        this.factories = new __WEBPACK_IMPORTED_MODULE_0__Factories__["a" /* default */]();
        this.troops = [];
        this.bombs = [];
        this.links = links;
        this.turn = 0;
        this.bombs_left = 2;
        this.queue = [];
        this.moveMap = moveMap;
    }

    initTick() {
        var entityCount = parseInt(readline());

        this.turn ++;
        this.actions = [];
        this.factories = new __WEBPACK_IMPORTED_MODULE_0__Factories__["a" /* default */]();
        this.troops = [];
        this.bombs = [];

        for (var i = 0; i < entityCount; i++) {
            var inputs = readline().split(' ');
            var entity = getEntityProps(inputs);

            if(TROOP === entity.type) this.troops.push(entity);
            if(BOMB === entity.type) this.bombs.push(entity);
            if(FACTORY === entity.type) this.factories.push(new __WEBPACK_IMPORTED_MODULE_1__Factory__["a" /* default */](entity, this));
        }

        this.factories.init();
    }

    tick() {
        this.initTick();

        if(this.queue.length) {
            this.queue.forEach(item => {
                if(item.action === 'attack') {
                    var factory = this.factories.find(factory => {
                        return factory.id === item.factory_id_to
                    });

                    var myFactory = this.factories.find(factory => {
                        return factory.id === item.factory_id_from
                    });

                    this.move(myFactory, factory, myFactory.freeRobots());
                }
            });
            this.queue = [];
        }

        this.factories.attacking().forEach(factory => {

            this.factories.defending().forEach(defendingFactory => {

                dump(`Defending Factory [${defendingFactory.id}]`);

                var troops_needed = defendingFactory.reinforcementsNeeded();

                if(
                    troops_needed
                ) {
                    var sending = factory.freeRobots();
                    if(troops_needed < sending) sending = troops_needed;

                    defendingFactory.reinforcementsIncoming(sending)
                    this.move(factory, defendingFactory, sending );
                }
            });

            if(!factory.freeRobots()) return;

            this.factories.notMine('byThreat', factory).forEach(otherFactory => {

                var dist = factory.distanceTo(otherFactory),
                    troopCount = otherFactory.count + 1 + otherFactory.hasEnemyTroopsInbound() - otherFactory.hasMyTroopsInbound();

                if(otherFactory.isEnemy()) {
                    troopCount += dist * otherFactory.production;
                }

                if(
                    troopCount + 1 < factory.freeRobots()
                ) {
                    this.move(factory, otherFactory, troopCount + 1);
                }

            });


        });

        if(this.canBomb()) {
            var enemy = this.factories.enemy().filter(factory => {
                return factory.production >= 2 && factory.count >= 8
            }).sort((a, b) => {
                return b.threat() - a.threat();
            }).first();

            var factory;
            if (enemy) {
                if (factory = enemy.closestEnemyFactory()) {
                    this.bomb(factory, enemy);
                    this.queue.push({
                        action: 'attack',
                        factory_id_to: enemy.id,
                        factory_id_from: factory.id
                    });
                }
            }
        }


        this.execute();
    }


    move(from_factory, to_factory, count) {
        if(count < 1) return;

        from_factory.reserveForAttack(count);

        var newTarget = this.moveMap[from_factory.id][to_factory.id];

        var action = 'MOVE ' + from_factory.id + ' ' + newTarget + ' ' + count;
        this.actions.push(action);
    }

    message(message) {
        this.actions.push('MSG ' + message);
    }

    bomb(from_factory, to_factory) {
        var action = 'BOMB ' + from_factory.id + ' ' + to_factory.id;

        this.bombs_left--;
        this.actions.push(action);
    }

    canBomb() {
        return this.bombs_left > 0;
    }

    execute() {
        if(this.actions.length) {
            return print(this.actions.join(';'));
        }

        return print('WAIT');
    }

}
/* harmony export (immutable) */ __webpack_exports__["a"] = Game;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {global.TROOP = 'TROOP';
global.FACTORY = 'FACTORY';
global.BOMB = 'BOMB';
global.ME = 1;
global.ENEMY = -1;
global.FREE = 0;

global.getEntityProps = function (inputs) {
    var data = {
        id: parseInt(inputs[0]),
        type: inputs[1],
        owner: parseInt(inputs[2])
    };

    switch(data.type) {
        case TROOP:
            data['factory_id_from'] = parseInt(inputs[3]);
            data['factory_id_to'] = parseInt(inputs[4]);
            data['count'] = parseInt(inputs[5]);
            data['turns_for_arrival'] = parseInt(inputs[6]);
            break;
        case FACTORY:
            data['count'] = parseInt(inputs[3]);
            data['production'] = parseInt(inputs[4]);
            break;
        case BOMB:
            data['factory_id_from'] = parseInt(inputs[3]);
            data['factory_id_to'] = parseInt(inputs[4]);
            data['turns_for_arrival'] = parseInt(inputs[5]);
            break;
    }

    return data;
};
global.dump = function(a) {
    printErr(JSON.stringify(a));
};

global.flip = function(num) {
    return num *= -1;
};

Array.prototype.first = function() { return (this.length > 0) ? this[0] : false; };
Array.prototype.last = function() { return (this.length > 0) ? this[this.length - 1] : false; };
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4)))

/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
class Factories extends Array {
    init() {
        this.mine().forEach(Factory => Factory.defend());
    }

    all(sort = 'byRobotCount') {
        return this[sort];
    }

    mine(sort = 'byRobotCount') {
        return this.filter(factory => {
            return factory.owner === ME
        }).sort(this[sort]);
    }
    free(sort = 'byThreat', scope = null) {
        return this.filter(factory => {
            return factory.owner === FREE
        }).sort(this[sort].bind(scope));
    }
    notMine(sort = 'byThreat', scope = null) {
        return this.filter(factory => {
            return factory.owner !== ME
        }).sort(this[sort].bind(scope));
    }
    enemy(sort = 'byThreat') {
        return this.filter(factory => {
            return factory.owner === ENEMY
        }).sort(this[sort]);
    }

    defending(sort = 'byProduction') {
        return this.filter(factory => {
            return factory.isDefending() && factory.owner === ME && factory.production > 1
        }).sort(this[sort]);
    }

    attacking(sort = 'byRobotCount', scope = null) {
        return this.filter(factory => {
            return !factory.isDefending() && factory.owner === ME
        }).sort(this[sort].bind(scope));
    }

    clear() {

    }

    byRobotCount(a, b) {
        return b.count - a.count;
    }

    byProduction(a, b) {
        return b.production - a.production;
    }

    byThreat(a, b) {
        return b.threat(this) - a.threat(this);
    }

    canDefend(factory) {
        return this.reduce((a, b) => {
                return (a.freeRobots() || 0) + (b.freeRobots() || 0)
            }, 0) > factory.reinforcementsNeeded()
    }

}
/* harmony export (immutable) */ __webpack_exports__["a"] = Factories;


/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
class Factory {

    constructor (factory, game) {
        this.game = game;
        this.id = factory.id;
        this.owner = factory.owner;
        this.count = factory.count;
        this.production = factory.production;

        this.keep_for_defence = 0;
        this.away_on_attack = 0;
        this.incoming_for_defence = 0;
        this.defendTable = {};
    }

    update(factory) {
        this.owner = factory.owner;
        this.count = factory.count;
        this.production = factory.production;
        this.defendTable = {};

    }

    isMine() {
        return this.owner === ME;
    }

    isEnemy() {
        return this.owner === ENEMY;
    }

    hasEnemyTroopsInbound() {
        return this.incomingEnemyTroops()
            .reduce((a, b) => {
                return (a.count || 0) + (b.count || 0)
            }, 0);
    }

    hasMyTroopsInbound() {
        return this.incomingDefendingTroops()
            .reduce((a, b) => {
                return (a.count || 0) + (b.count || 0)
            }, 0);
    }

    incomingEnemyTroops() {
        return this.game.troops.filter(troop => {
            return troop.factory_id_to === this.id && troop.owner === ENEMY
        }).sort((a, b) => { return a.turns_for_arrival - b.turns_for_arrival});
    }

    incomingDefendingTroops() {
        return this.game.troops.filter(troop => {
            return troop.factory_id_to === this.id && troop.owner === ME
        }).sort((a, b) => { return a.turns_for_arrival - b.turns_for_arrival});
    }

    distanceTo(factory) {
        return this.game.links.find(link => {
            return ((
                link.factory_1_id === factory.id &&
                link.factory_2_id === this.id
            )
            ||
            (
                link.factory_1_id === this.id &&
                link.factory_2_id === factory.id
            ));
        }).distance;
    }

    closestEnemyFactory() {
        return this.game.factories.filter(f => {
            return f.owner === flip(this.owner)
        })
            .sort((a, b) => { return a.distanceTo(this) - b.distanceTo(this); })
            .first();
    }

    closestAllyFactory() {
        return this.game.factories.filter(f => {
            return f.owner === this.owner && f.id !== this.id
        })
            .sort((a, b) => { return a.distanceTo(this) - b.distanceTo(this); })
            .first();
    }


    threat(factory = false) {
        if(this.production === 0) return 0;

        var threat_count = 0;

        if(factory) {
            threat_count += (20 - this.distanceTo(factory)) * 4;
        }

        threat_count += this.production * 10;

        threat_count -= this.count / 2;

        return threat_count;
    }

    defend() {
        this.incomingEnemyTroops().forEach(troop => {
            if(this.freeRobots() + (this.production * troop.turns_for_arrival) < troop.count) {
                if(this.production === 0) {
                    this.abandonSHIP();
                } else {

                    this.reserveForDefence(this.count);

                    if(!this.defendTable.hasOwnProperty(this.game.turn + troop.turns_for_arrival)) {
                        this.defendTable[this.game.turn + troop.turns_for_arrival] = 0;
                    }
                    this.defendTable[
                        this.game.turn + troop.turns_for_arrival
                    ] += troop.count - (this.count + (this.production * troop.turns_for_arrival));

                }
            } else {
                this.reserveForDefence(troop.count);
            }
        });
    }

    isDefending() {
        return this.freeRobots() < 0;
    }

    reinforcementsNeeded() {
        var defending = this.hasMyTroopsInbound() + this.count + this.incoming_for_defence;
        var attacking = this.hasEnemyTroopsInbound();

        return (attacking - defending > 0) ? attacking - defending : 0;
    }

    freeRobots() {
        return this.count - this.away_on_attack - this.keep_for_defence;
    }

    reserveForDefence(amount) {
        this.keep_for_defence += amount;

        if(this.freeRobots() < 0) {
            this.keep_for_defence = this.count;
            return false;
        }

        return true;
    }

    reserveForAttack(amount) {
        this.away_on_attack += amount;
    }

    reinforcementsIncoming(amount) {
        this.incoming_for_defence += amount;
    }

    abandonSHIP() {
        this.game.move(this, this.closestAllyFactory(), this.count);
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Factory;


/***/ }),
/* 4 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__constants__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__constants___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__constants__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__Game__ = __webpack_require__(0);
/*
 | Author: Tim Huijgen
 | Date Created: 25 Februari 2017
 |
 | Ghost in the CELL
 */




/**
 *
 * Next steps
 *
 * Implement minimum robot counts
 *
 * Code to overtake factory after enemy takeover
 *
 * Fix threat calculations & sorting
 *
 * Send robots after bombs
 *
 */




var factoryCount = parseInt(readline()); // the number of factories
var linkCount = parseInt(readline()); // the number of links between factories

var links = [];
var distances = [];
var moveMap = [];

for (var i = 0; i < linkCount; i++) {
    var inputs = readline().split(' ');
    var factory1 = parseInt(inputs[0]);
    var factory2 = parseInt(inputs[1]);
    var distance = parseInt(inputs[2]);

    if(!distances[factory1]) {
        distances[factory1] = [];
    }

    if(!distances[factory2]) {
        distances[factory2] = [];
    }

    distances[factory1][factory2] = distance;
    distances[factory2][factory1] = distance;

    links.push({
        'factory_1_id': factory1,
        'factory_2_id': factory2,
        'distance': distance
    });
}

function initializeMoveMap(dist) {
    var size = dist.length;

    for(var l = 0; l < size; l += 1) {
        for(var m = 0; m < size; m += 1) {
            if ( !moveMap[ l ] ) {
                moveMap[ l ] = [];
            }
            moveMap[ l ].push( m );
        }
    }

    for (var k = 0; k < size; k += 1) {
        for (var i = 0; i < size; i += 1) {
            for (var j = 0; j < size; j += 1) {
                if (dist[i][j] > dist[i][k] + dist[k][j]) {
                    dist[i][j] = dist[i][k] + dist[k][j];
                    moveMap[i][j] = k;
                }
            }
        }
    }
    return dist;
}

initializeMoveMap(distances);

var game = new __WEBPACK_IMPORTED_MODULE_1__Game__["a" /* default */](links, factoryCount, linkCount, moveMap);

while(true) {
    game.tick();
}

/***/ })
/******/ ]);