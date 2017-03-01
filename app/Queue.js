export default class Queue {

    constructor(game) {
        this.game = game;
        this.queue = {};
    }

    handle() {
        if(!this.queue[this.game.turn]) return;

        this.queue[this.game.turn].forEach(item => this[item.action].call(this, item));
    }

    attack() {

    }

    add(turn, action) {
        if(!this.queue[turn]) {
            this.queue[turn] = [];
        }
        this.queue[turn].push(action);
    }

    attackDirect(item) {
        var factory = this.game.factories.byId(item.factory_id_to);
        var myFactory = this.game.factories.byId(item.factory_id_from);

        this.game.moveDirect(myFactory, factory, myFactory.freeRobots());
    }

}