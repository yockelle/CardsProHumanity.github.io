// let AllPlayers = {DEDFAEX : {
//     username: 'Joe_Schmoe',
//     password: "abc",
//     unquieID: "DEDFAEX",
//     gameSession: {
//         1 : {
//             numberOfCards : 3,
//             userhand: [Cards[0] , Cards[1] , Cards[2]],
//             promptCard: promptCards[0],
//         }
//     },
// },

module.exports = class Player {
    constructor(uniqueId,username,password) {
        this.username = username;
        this.password = password;
        this.uniqueId = uniqueId;

        this.socketId;
        this.connected;

        this.gameSessions = [];
    }
  }