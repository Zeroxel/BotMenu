const botName = "Bot | /help";
const botId = "id";
let x = `/`;
  const CommandsPack = [
    {
        categoryName: "General",
        requiredRank: "0",// rank number 0 - user
        position: 1, // Категория располагается на первом месте
        commands: [
            { label: "Help", command: `${x}help` },
            { label: "Help Bot", command: `${x}help BOT` }
        ]
    },
    {
        categoryName: "Admin/Owner",
        requiredRank: "2",// rank number 2 - admin
        categoryColor: "#fff",
        position: 2, // Категория располагается на втором месте
        commands: [
            { label: "LRanks", command: ``, message:`LoadRanks`, description: "Загружает Ранги"},
            { label: "Get My Rank", command: ``, message:`GetMyRank`, description: "получить свой ранг"},
            { label: "Kick", command: `${x}kick [id]`, description: "Исключить пользователя по id", parameters: ["id"]},
            { label: "Give Crown to ID", command: `${x}crown [id]`, description: "Дать корону по id", parameters: ["id"]},
            { label: "Give me Crown", command: `${x}mecrown`, description: "Дать корону себе"},
        ]
    },
    {
      categoryName: "Midiplayer",
      requiredRank: "0",
      position: 3, 
      commands: [
          { label: "Midi List", command: `${x}midis` },
          { label: "Play", command: `${x}play` },
          { label: "Stop", command: `${x}stop` },
      ]
  }
];

mppClient.on("custom", (data) => {
      if (data.data.m == 'BotMenuClient') {
        let userId = data.p
        const { type } = data.data;
      
        if (type === "Requestcommands") {
          BotMenuLog('Request commands', userId)
          sendCommands(
            CommandsPack,
            data.p
          )
        } else if (type === "msg") {
          if (data.data.message) {
            let message = data.data.message
            if (message === 'LoadRanks' && isOwner(userId)){
              loadData()
              console.log("Загружены Ранги")
            }
            if (message === 'GetMyRank'){
              let UserRank = getUserRank(userId)
              sendChat(`@${userId} : ${UserRank}`)
            }
          }
        }
      
    }
  }

// Bot menu server (Bot) -> Bot Menu Clinet
function sendCommands(commands, mppID) { 
  let isGlobal = !mppID || mppID.length === 0;
  let target = isGlobal ? { mode: "subscribed" } : { mode: "id", id: mppID };

  let response = {
      m: "custom",
      data: {
          m: "BotMenu",
          botName: botName,
          botColor: botColor,
          categories: commands
      },
      target: target
  };

  if (!isGlobal) {
      response.data.userRank = ranknumber(mppID);
  }

  mppClient.sendArray([response]);
}

