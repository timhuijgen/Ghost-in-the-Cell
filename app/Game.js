import Factories from './Factories';
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
        this.troops = [];

        for (var i = 0; i < entityCount; i++) {
            var inputs = readline().split(' ');
            var entity = getEntityProps(inputs);

            if(TROOP === entity.type) this.troops.push(entity);
            if(BOMB === entity.type) this.bombs.update(entity);
            if(FACTORY === entity.type) this.factories.push(entity, this);
        }
    }

    tick() {
        this.initTick();

        this.factories.handle();

        this.queue.handle();

        this.bombs.handle();

        while(this.getActions().length && this.factories.available().length) {

            //dump(this.getActions().length, this.factories.available().length);

            var actionFactory = this.getActions();

            dump('handling action factory ' + actionFactory.id + ' available ' + this.factories.available().length);

            this.factories.available().forEach(factory => {
                //dump(actionFactory.priority() + ' ' + actionFactory.dump().id + ' ' + actionFactory.dump().owner);

                actionFactory.isMine()
                    ? factory.defend(actionFactory)
                    : factory.attack(actionFactory);
            });
        }

        //this.factories.available().forEach(factory => {
        //
        //    actions.forEach(actionFactory => {
        //
        //        dump(actionFactory.priority(carrier) + ' ' + actionFactory.dump().id + ' ' + actionFactory.dump().owner);
        //
        //        actionFactory.isMine()
        //            ? factory.defend(actionFactory)
        //            : factory.attack(actionFactory);
        //    });
        //});

        this.factories.checkIncrease(this);

        this.execute();
    }

    getActions() {
        var defending = this.factories.defending().byPriority(); //.first();
        var targets = this.factories.notMine().enoughUnderway().byPriority();
        var carrier = this.factories.mine().byPriority().first();

        var actions = defending.length
            ? defending.concat(targets)
            : targets;

        actions.sort((a, b) => {
            return b.priority(carrier) - a.priority(carrier);
        });

        return actions;
    }

    move(from_factory, to_factory, count) {
        this._move(from_factory, to_factory, count);
    }

    moveDirect(from_factory, to_factory, count) {
        this._move(from_factory, to_factory, count, true);
    }

    _move(from_factory, to_factory, count, direct = false) {
        if(count < 1) return;

        if(!from_factory.isMine()) return;

        from_factory.reserveForAttack(count);
        if(to_factory.isMine()) {
            to_factory.reinforcementsIncoming(count);
        } else {
            to_factory.attackIncoming(count);
        }

        if(this.turn < 2) direct = true;

        var target = direct
            ? to_factory.id
            : this.moveMap[from_factory.id][to_factory.id];

        var action = ['MOVE', from_factory.id, target, count];
        this.actions.push(action.join(' '));
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