import Factories from './Factories';
import Factory from './Factory';
import FloydWarshall from './FloydWarshall';

export default class Game {

    constructor(params) {
        this.actions = [];
        this.factories = new Factories();
        this.troops = [];
        this.bombs = [];
        this.turn = 0;
        this.bombs_left = 2;
        this.queue = [];
        this.distances = params.distances;
        this.moveMap = FloydWarshall(params.distances);
    }

    initTick() {
        var entityCount = parseInt(readline());

        this.turn ++;
        this.actions = [];
        this.factories = new Factories();
        this.troops = [];
        this.bombs = [];

        for (var i = 0; i < entityCount; i++) {
            var inputs = readline().split(' ');
            var entity = getEntityProps(inputs);

            if(TROOP === entity.type) this.troops.push(entity);
            if(BOMB === entity.type) this.bombs.push(entity);
            if(FACTORY === entity.type) this.factories.push(new Factory(entity, this));
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

                    this.moveDirect(myFactory, factory, myFactory.freeRobots());
                }
            });
            this.queue = [];
        }

        this.factories.attacking().forEach(factory => {

            this.factories.defending().forEach(defendingFactory => {

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

        if(!from_factory.isMine()) return;

        from_factory.reserveForAttack(count);

        var newTarget = this.moveMap[from_factory.id][to_factory.id];

        var action = 'MOVE ' + from_factory.id + ' ' + newTarget + ' ' + count;
        this.actions.push(action);
    }

    moveDirect(from_factory, to_factory, count) {
        if(count < 1) return;

        if(!from_factory.isMine()) return;

        from_factory.reserveForAttack(count);

        var action = 'MOVE ' + from_factory.id + ' ' + to_factory.id + ' ' + count;
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