export default class Queue extends Array {

    constructor(game) {
        super();
        this.game = game;
    }

    handle() {
        this.forEach(item => this[item.action].call(this, item));

        this.clear();
    }

    attack() {

    }

    clear() {
        this.splice(0, this.length);
    }

    attackDirect(item) {
        var factory = this.game.factories.find(factory => {
            return factory.id === item.factory_id_to
        });

        var myFactory = this.game.factories.find(factory => {
            return factory.id === item.factory_id_from
        });

        this.game.moveDirect(myFactory, factory, myFactory.freeRobots());
    }

}