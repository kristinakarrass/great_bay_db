//require needed npm packages
var inquirer = require("inquirer");
var mysql = require("mysql");

//variables needed
var availableItems = [];
var bidItem = "";
var bidPrice = 0;
var itemPrice = 0;

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

function startBay() {
    inquirer.prompt([{
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices: ["bid", "post", "quit"]
    }]).then(function(answer) {
        if (answer.action === "post") {
            postItem();
        } else if (answer.action === "bid") {
            bidOnItem();
        } else {
            return;
        }
    });
}

function postItem() {
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
        console.log("You have successfully posted your item.");
        console.log(answer.itemName + " | " + answer.price + " | " + answer.quality);
        connection.query("INSERT INTO items SET ?", { itemName: answer.itemName, price: answer.price, quality: answer.quality }, function(err, res) {
            if (err) throw err;
            startBay();
        });
    });


};

function bidOnItem() {
    //get information from MySQL database (only items that have not been sold yet)
    connection.query('SELECT * FROM items WHERE sold=?', [false], function(err, response) {
        console.log("====================================================");
        console.log("Here are all the available items:");
        //list all available items
        for (var i = 0; i < response.length; i++) {
            console.log(response[i].itemName + " | " + response[i].quality);
            console.log("================================================");
            //push them into an array which will be used for inquirer prompt
            availableItems.push(response[i].itemName);
        }
        inquirer.prompt([{
            type: "list",
            name: "bid",
            message: "Which item would you like to bid on?",
            choices: availableItems
        }]).then(function(answer) {
            bidItem = answer.bid;
            console.log(answer.bid);
            inquirer.prompt([{
                type: "input",
                name: "bidPrice",
                message: "How much would you like to bid?",
            }]).then(function(answer) {
                bidPrice = parseInt(answer.bidPrice);
                console.log(bidPrice);
                connection.query('SELECT * FROM items WHERE itemName=?', [bidItem], function(err, response) {
                    itemPrice = parseInt(response[0].price);
                    itemKey = response[0].id;
                    if (bidPrice > itemPrice) {
                        console.log("Congratulations! You are the highest bidder!");
                        connection.query("UPDATE items SET ? WHERE ?", [{price: bidPrice}, {id: itemKey}], function(err, response) {});
                        startBay();
                    } else {
                        console.log("Sorry, try a higher bid next time.");
                        startBay();
                    }
                });
            })
        })
    });
};

startBay();
