import Factories from './Factories';
import Factory from './Factory';
import Bombs from './Bombs';
import Queue from './Queue';
import FloydWarshall from './FloydWarshall';

export default class Game {

    constructor(params) {
        this.actions = [];
        this.factories = new Factories();
        this.bombs = new Bombs(this);
        this.queue = new Queue(this);
        this.troops = [];
        this.turn = 0;
        this.distances = params.distances;
        this.moveMap = FloydWarshall(params.distances);
    }

    initTick() {
        var entityCount = parseInt(readline());

        this.turn ++;
        this.actions = [];
        this.factories = new Factories();
        this.troops = [];

        for (var i = 0; i < entityCount; i++) {
            var inputs = readline().split(' ');
            var entity = getEntityProps(inputs);

            if(TROOP === entity.type) this.troops.push(entity);
            if(BOMB === entity.type) this.bombs.update(entity);
            if(FACTORY === entity.type) this.factories.push(new Factory(entity, this));
        }

        this.factories.init();
    }

    tick() {
        this.initTick();

        this.queue.handle();

        this.bombs.handle();

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

    execute() {
        if(this.actions.length) {
            return print(this.actions.join(';'));
        }

        return print('WAIT');
    }

}