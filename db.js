var knex = require("knex")({
    client:'mysql',
    connection:{
        host: 'localhost',
        user:'nodejs',
        password: 'nodejs',
        database: 'fightdb'
    }
    //,pool:{min:0, max: 7}
});
var bookshelf = require("bookshelf")(knex);



var user = bookshelf.Model.extend({
    tableName: 'users',
    idAttribute: 'userId'
});

var fight = bookshelf.Model.extend({
    tableName: 'fights',
    idAttribute: 'fightId'
});

module.exports = {
    user:user,
    fight:fight
};