var inquirer = require("inquirer");
var availableItems = [];
var mysql = require("mysql");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "MySQL2016",
    database: "great_bay_db"
});

connection.connect(function(err) {
    if (err) throw err;

    console.log("connection as id " + connection.threadId);
});

inquirer.prompt([{
    type: "list",
    name: "action",
    message: "Do you want to bid on or post an item?",
    choices: ["bid", "post"]
}]).then(function(answer) {
    console.log(answer.action);
    if (answer.action === "post") {
        inquirer.prompt([{
            type: "input",
            name: "itemName",
            message: "What item would you like to post?"
        }, {
            type: "input",
            name: "price",
            message: "Set your minimum price."
        }, {
            type: "list",
            name: "quality",
            message: "Choose the condition for your item.",
            choices: ["new", "gently used", "used"]
        }]).then(function(answer) {
            console.log(answer.itemName + " | " + answer.price + " | " + answer.quality);
            connection.query("INSERT INTO items SET ?", { itemName: answer.itemName, price: answer.price, quality: answer.quality }, function(err, res) {
                if (err) throw err;
            });
        })
    } else {
        connection.query('SELECT * FROM items WHERE sold=?', [false], function(err, response) {
            console.log("====================================================");
            console.log("Here are all the available items:");
            for (var i = 0; i < response.length; i++) {
                console.log(response[i].itemName + " | " + response[i].quality);
                console.log("================================================");
                availableItems.push(response[i].itemName);
            }
            inquirer.prompt([{
                type: "list",
                name: "bid",
                message: "Which item would you like to bid on?",
                choices: availableItems
            }]).then(function(answer) {
                inquirer.prompt([{
                    type: "input",
                    name: "bidPrice",
                    message: "How much would you like to bid?",
                }]).then(function(answer) {
                    connection.query('SELECT * FROM items WHERE itemName=?', [], function(err, response) {
                        for (var i = 0; i < response.length; i++) {
                            console.log(response[i].title + " | " + response[i].id + " | " + response[i].artist + " | " + response[i].genre);
                            console.log("================================================");
                        }
                    });
                })
            })

        });
    }
})
