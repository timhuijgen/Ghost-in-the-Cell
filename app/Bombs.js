export default class Bombs {

    constructor(game) {
        this.game = game;
        this.bombs_left = 2;
        this.bombs = [];
        this.timeout = 0;
    }

    update(entity) {

    }

    bomb(from_factory, to_factory) {
        var action = 'BOMB ' + from_factory.id + ' ' + to_factory.id;

        this.bombs_left--;
        this.game.actions.push(action);
    }

    available() {
        return this.bombs_left > 0 && this.timeout === 0;
    }

    lowerTimeout() {
        if(this.timeout !== 0) {
            this.timeout--;
        }
    }

    handle() {
        this.lowerTimeout();

        if(!this.available()) {
            return;
        }

        var enemy = this.game.factories.enemy().filter(factory => {
            return factory.production >= 2
        }).sort((a, b) => {
            return b.priority() - a.priority();
        }).first();

        if (enemy) {
            var factory = enemy.closestEnemyFactory();
            if (factory) {
                this.game.message('Here; have a bomb :)');
                this.bomb(factory, enemy);
                this.timeout = 10;
                // Queue an attack for next turn
                this.game.queue.add(this.game.turn + 1, {
                    action: 'attackDirect',
                    factory_id_to: enemy.id,
                    factory_id_from: factory.id
                });
            }
        }
    }

}