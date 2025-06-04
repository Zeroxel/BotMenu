```js
  const botName = `M-Botix`;
  const botId = `832423cc0e1322ec82480403`;
  const botColor = `#ffffff`;
  const botmenuVersion = `5.1`;

// Bot menu server (Bot) -> Bot Menu Clinet
const botmenu = {
      send: {
        cmd(commandsPack, mppID) {
          const rank = ranknumber(mppID);
          const userRank = typeof rank === "number" ? rank : 0;
          const isGlobal = !mppID || mppID.length === 0;

          const filteredCommands = commandsPack
            .filter((cat) => {
              // если есть requiredRanks как массив
              if (Array.isArray(cat.requiredRanks)) {
                return cat.requiredRanks.includes(userRank);
              }

              // если есть requiredRank как число
              if (typeof cat.requiredRank === "number") {
                return userRank >= cat.requiredRank;
              }

              // если ни то, ни другое — пропускаем категорию
              return false;
            })
            .map((cat) => ({
              ...cat,
              commands: cat.commands,
            }));

          const target = isGlobal
            ? { mode: "subscribed" }
            : { mode: "id", id: mppID };

          const response = {
            m: "custom",
            data: {
              m: "BotMenu",
              mode: "CSC",
              version: botmenuVersion,
              botName: botName,
              botColor: botColor,
              categories: filteredCommands,
            },
            target: target,
          };

          if (!isGlobal) {
            response.data.userRank = userRank;
          }

          mppClient.sendArray([response]);
        },

        msg(message, mppID) {
          const isGlobal = !mppID || mppID.length === 0;
          const target = isGlobal
            ? { mode: "subscribed" }
            : { mode: "id", id: mppID };

          const response = {
            m: "custom",
            data: {
              m: "BotMenu",
              mode: "MSG",
              version: botmenuVersion,
              botName: botName,
              botColor: botColor,
              message: message,
            },
            target: target,
          };

          mppClient.sendArray([response]);
        },
      },
    };
    mppClient.on("custom", (d) => {
       if (d.data.m === "BotMenuClient") {
        let userId = d.p;
        let now = new Date();
        const { type } = d.data;

        if (type === "Requestcommands") {
          console.log(`${userId}: Request commands`);
          botmenu.send.cmd(CommandsPack, userId);
        } else if (type === "msg") {
          if (d.data.message) {
            /* обработка сообщений от клиента (если нужно)
               processing of messages from the client (if necessary)
            */
          }
        }
      }
    });

    /**
     * ru: Получает числовой ранг пользователя по его MPP ID из базы данных.
     * eng: Gets the numeric rank of a user by their MPP ID from the database.
     *
     * @param {string} mppID - Идентификатор пользователя в MPP. | The user ID of the user in the MPP.
     * @returns {number|null} Числовой ранг, если найден, иначе null. | Numeric rank if found, otherwise null.
     */
    function ranknumber(mppID) {
      try {
        const db = JSON.parse(fs.readFileSync("./JSON/db.json", "utf-8"));

        if (!Array.isArray(db.users) || !db.users[0]) return null;

        const usersObj = db.users[0];

        if (usersObj[mppID] && usersObj[mppID].ranknumber !== undefined)
          return Number(usersObj[mppID].ranknumber);

        return null;
      } catch (err) {
        console.error("Error during reading JSON: ", err);
        return null;
      }
    }
```
это просто демонстрация Того как вставить бот меню в серверную часть это не является гайдаром как сделать бота в MPP.
