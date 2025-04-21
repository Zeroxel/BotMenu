```js
// Bot menu server (Bot) -> Bot Menu Clinet
function sendCommands(commands, mppID) { 
  let isGlobal = !mppID || mppID.length === 0;
  let target = isGlobal ? { mode: "subscribed" } : { mode: "id", id: mppID };

  let response = {
      m: "custom",
      data: {
          m: "BotMenu",
          version: botmenuversion,
          mode: "CSC", //Commands Sending Classic (support: Bot Menu version 5.0 +) 
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
```

