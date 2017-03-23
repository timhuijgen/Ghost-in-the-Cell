import Factory from './Factory';

export default class Factories extends Array {
    push(entity, game) {
        var factory = this.byId(entity.id);

        factory
            ? factory.update(entity)
            : super.push(new Factory(entity, game));
    }

    handle () {
        this.mine().forEach(Factory => Factory.handle());
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
        return this.mine().filter(factory => {
            return factory.isDefending()
        });
    }

    enoughUnderway() {
        return this.filter(factory => {
            return factory.needsAttackingTroops() === false
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
        return this.mine().reduce((a, b) => {
                return (a.freeRobots() || 0) + (b.freeRobots() || 0)
            }, 0) > factory.reinforcementsNeeded()
    }

    checkIncrease (game) {
        if(game.turn % 10 !== 0) return;

        var candidate = this.mine()
            .filter(factory => {
                return factory.production !== 3 && factory.queued_for_increase === false
            })
            .byPriority()
            .first();

        if(candidate) candidate.increase();
    }

}