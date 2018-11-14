const Player = require('./Player');
const Table = require('./Table');

let Player1 = new Player("DEFAEF134","bob415","abc");
let Player2 = new Player("GGEMMEF454","sam415","abc");

let table1 = new Table("123",[Player1,Player2])
table1.dealStartingCards();
table1.dealPromptCard();

let Player1PlaysCard = table1.handCards[Player1.uniqueId][0]
let Player2PlaysCard = table1.handCards[Player2.uniqueId][0]

table1.playCard(Player1,Player1PlaysCard);
table1.playCard(Player2,Player2PlaysCard);

console.log(table1);

//let table = new Table()