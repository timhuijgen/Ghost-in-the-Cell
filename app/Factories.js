export default class Factories extends Array {
    init () {
        this.mine().forEach(Factory => Factory.shouldDefend());
    }

    all () {
        return this;
    }

    mine () {
        return this.filter(factory => {
            return factory.owner === ME
        });
    }

    free () {
        return this.filter(factory => {
            return factory.owner === FREE
        });
    }

    notMine () {
        return this.filter(factory => {
            return factory.owner !== ME
        });
    }

    enemy () {
        return this.filter(factory => {
            return factory.owner === ENEMY
        });
    }

    defending () {
        return this.mine().hasProduction().filter(factory => {
            return factory.isDefending()
        });
    }

    hasProduction () {
        return this.filter(factory => {
            return factory.production !== 0
        });
    }

    available () {
        return this.mine().filter(factory => {
            return factory.available()
        });
    }

    byId (id) {
        return this.find(factory => {
            return factory.id === id
        });
    }

    clear () {

    }

    byRobotCount () {
        return this.sort((a, b) => {
            return b.count - a.count;
        });
    }

    byProduction () {
        return this.sort((a, b) => {
            return b.production - a.production;
        });
    }

    byPriority () {
        return this.sort((a, b) => {
            return b.priority() - a.priority();
        });
    }

    byDistanceTo(factory) {
        return this.sort((a, b) => {
            return a.distanceTo(factory) - b.distanceTo(factory);
        });
    }

    canDefend (factory) {
        return this.reduce((a, b) => {
                return (a.freeRobots() || 0) + (b.freeRobots() || 0)
            }, 0) > factory.reinforcementsNeeded()
    }

    checkIncrease () {
        this.filter(factory => {
            return factory.freeRobots() > 40 && factory.production !== 3;
        }).forEach(factory => this.game.increase(factory));
    }

}