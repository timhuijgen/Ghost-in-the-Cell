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

        var defending = this.factories.defending().byPriority().slice(0, 1);
        var targets = this.factories.notMine().byPriority();
        var carrier = this.factories.mine().byPriority().first();
        var actions = defending.concat(targets).sort((a, b) => {
            return b.priority(carrier) - a.priority(carrier);
        });

        this.factories.available().forEach(factory => {

            actions.forEach(actionFactory => {

                dump(actionFactory.dump());
                dump(actionFactory.priority(carrier));

                if(!factory.freeRobots()) return;

                actionFactory.isMine()
                    ? factory.defend(actionFactory)
                    : factory.attack(actionFactory);
            });
        });

        this.factories.checkIncrease();

        this.execute();
    }


    move(from_factory, to_factory, count) {
        var newTarget = this.moveMap[from_factory.id][to_factory.id];
        this._move(from_factory, newTarget, count);
    }

    moveDirect(from_factory, to_factory, count) {
        this._move(from_factory, to_factory, count);
    }

    _move(from_factory, to_factory, count) {
        if(count < 1) return;

        if(!from_factory.isMine()) return;

        from_factory.reserveForAttack(count);
        to_factory.reinforcementsIncoming(count);

        var action = 'MOVE ' + from_factory.id + ' ' + to_factory.id + ' ' + count;
        this.actions.push(action);
    }

    increase(factory) {
        this.actions.push('INC ' + factory.id);
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