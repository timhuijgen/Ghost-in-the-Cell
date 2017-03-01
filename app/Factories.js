export default class Factories extends Array {
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
    free(sort = 'byPriority', scope = null) {
        return this.filter(factory => {
            return factory.owner === FREE
        }).sort(this[sort].bind(scope));
    }
    notMine(sort = 'byPriority', scope = null) {
        return this.filter(factory => {
            return factory.owner !== ME
        }).sort(this[sort].bind(scope));
    }
    enemy(sort = 'byPriority') {
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

    byId(id) {
        return this.find(factory => {
            return factory.id === id
        });
    }

    clear() {

    }

    byRobotCount(a, b) {
        return b.count - a.count;
    }

    byProduction(a, b) {
        return b.production - a.production;
    }

    byPriority(a, b) {
        return b.priority(this) - a.priority(this);
    }

    canDefend(factory) {
        return this.reduce((a, b) => {
                return (a.freeRobots() || 0) + (b.freeRobots() || 0)
            }, 0) > factory.reinforcementsNeeded()
    }

}