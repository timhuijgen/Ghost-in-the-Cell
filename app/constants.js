global.TROOP = 'TROOP';
global.FACTORY = 'FACTORY';
global.BOMB = 'BOMB';
global.ME = 1;
global.ENEMY = -1;
global.FREE = 0;

global.getEntityProps = function (inputs) {
    var data = {
        id: parseInt(inputs[0]),
        type: inputs[1],
        owner: parseInt(inputs[2])
    };

    switch(data.type) {
        case TROOP:
            data['factory_id_from'] = parseInt(inputs[3]);
            data['factory_id_to'] = parseInt(inputs[4]);
            data['count'] = parseInt(inputs[5]);
            data['turns_for_arrival'] = parseInt(inputs[6]);
            break;
        case FACTORY:
            data['count'] = parseInt(inputs[3]);
            data['production'] = parseInt(inputs[4]);
            break;
        case BOMB:
            data['factory_id_from'] = parseInt(inputs[3]);
            data['factory_id_to'] = parseInt(inputs[4]);
            data['turns_for_arrival'] = parseInt(inputs[5]);
            break;
    }

    return data;
};
global.dump = function(a) {
    printErr(JSON.stringify(a));
};

global.flip = function(num) {
    return num *= -1;
};

Array.prototype.first = function() { return (this.length > 0) ? this[0] : false; };
Array.prototype.last = function() { return (this.length > 0) ? this[this.length - 1] : false; };