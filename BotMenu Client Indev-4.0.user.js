// ==UserScript==
// @name         BotMenu Client Indev
// @namespace    http://tampermonkey.net/
// @version      4.0
// @description  Интерфейс для управления командами ботов с поддержкой категорий и сортировки
// @author       gtnntg
// @match        *://multiplayerpiano.net/*
// @license      MIT
// @grant        none
// ==/UserScript==

/*global MPP*/
(function () {
    'use strict';

    const botsData = {}; // Хранение данных ботов { botId: { name, categories } }

    // Создаём контейнер для вкладок и кнопок
    const container = document.createElement('div');
    container.id = 'bot-menu';
    container.style.position = 'fixed';
    container.style.bottom = '20px';
    container.style.right = '10px';
    container.style.width = '300px';
    container.style.maxHeight = '500px';
    container.style.minHeight = '50px';
    container.style.backgroundColor = '#121212';
    container.style.color = '#fff';
    container.style.border = '1px solid #333';
    container.style.borderRadius = '8px';
    container.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.5)';
    container.style.padding = '10px';
    container.style.overflowY = 'auto';
    container.style.zIndex = '10000';
    container.style.display = 'block';
    document.body.appendChild(container);

    // Кнопка сворачивания
    const toggleButton = document.createElement('button');
    toggleButton.innerText = '⮝';
    toggleButton.style.alignSelf = 'flex-end';
    toggleButton.style.backgroundColor = '#333';
    toggleButton.style.color = '#fff';
    toggleButton.style.border = 'none';
    toggleButton.style.borderRadius = '4px';
    toggleButton.style.cursor = 'pointer';
    toggleButton.style.marginBottom = '10px';
    toggleButton.onclick = toggleContainer;
    container.appendChild(toggleButton);

    const QButton = document.createElement('button');
    QButton.innerText = 'Запросить команды';
    QButton.style.alignSelf = 'flex';
    QButton.style.backgroundColor = '#333';
    QButton.style.color = '#fff';
    QButton.style.border = 'none';
    QButton.style.borderRadius = '4px';
    QButton.style.marginLeft = '10px';
    QButton.style.cursor = 'pointer';
    QButton.style.marginBottom = '10px';
    QButton.onclick = Requestcommands;
    container.appendChild(QButton);

    const tabs = document.createElement('div'); // Контейнер для вкладок
    tabs.id = 'bot-tabs';
    tabs.style.display = 'flex';
    tabs.style.flexWrap = 'wrap';
    tabs.style.marginBottom = '10px';
    container.appendChild(tabs);

    const commandsContainer = document.createElement('div'); // Контейнер для кнопок команд
    commandsContainer.id = 'commands-container';
    commandsContainer.style.display = 'none';
    commandsContainer.style.padding = '10px';
    commandsContainer.style.borderTop = '1px solid #555';
    commandsContainer.style.marginTop = '10px';
    container.appendChild(commandsContainer);

    let isCollapsed = false;

    // Сворачивание/разворачивание контейнера
    function toggleContainer() {
        isCollapsed = !isCollapsed;
        if (isCollapsed) {
            tabs.style.display = 'none';
            commandsContainer.style.display = 'none';
            toggleButton.innerText = '⮟';
            container.style.maxHeight = '50px';
        } else {
            tabs.style.display = 'flex';
            toggleButton.innerText = '⮝';
            container.style.maxHeight = '500px';
        }
    }

    function Requestcommands(botId) {
      MPP.client.sendArray([{
          m: "custom",
          data: {
              m: "BotMenuClient",
              language: localStorage.getItem('language'),
              type: "Requestcommands"
          },
          target: { mode: "subscribed" },
      }]);
      sendmsg('Запрос на команды был отправлен всем ботам находящиеся в данной комнате','Bot Menu Client','Bot Menu Client','#0066ff')
    }

    function sendmsg(msg,name,id,color) {
      MPP.chat.receive({
                    "m": "a",
                    "t": Date.now(),
                    "a": msg,
                    "p": {
                        "_id": id,
                        "name": name,
                        "color": color,
                        "id": id
                    }
                });
    }

    // Функция для добавления новой вкладки
    function addTab(botId, botName) {
        const tab = document.createElement('button');
        tab.innerText = botName;
        tab.style.padding = '5px 10px';
        tab.style.margin = '5px 5px 0 0';
        tab.style.border = '1px solid #444';
        tab.style.borderRadius = '5px';
        tab.style.backgroundColor = '#2e2e2e';
        tab.style.color = '#fff';
        tab.style.cursor = 'pointer';
        tab.style.flex = '1 0 auto';
        tab.setAttribute('data-id', botId); // Присваиваем data-id для идентификации
        tab.onclick = () => showCommands(botId);
        tabs.appendChild(tab);
    }

    // Функция для отображения команд
    function showCommands(botId) {
    commandsContainer.innerHTML = ''; // Очищаем контейнер команд
    commandsContainer.style.display = 'block'; // Показываем контейнер

    const botData = botsData[botId];
    if (!botData) return; // Если данных нет, выходим

   /* const title = document.createElement('h3');
    title.innerText = `${botData.name}`;
    title.style.marginBottom = '10px';
    commandsContainer.appendChild(title);*/

    // Сортируем категории по позиции
    botData.categories.sort((a, b) => a.position - b.position);

    // Обрабатываем каждую категорию
    botData.categories.forEach((category) => {
        const categoryTitle = document.createElement('h4');
        categoryTitle.innerText = category.name; // Название категории
        categoryTitle.style.marginTop = '10px';
        categoryTitle.style.color = category.categoryColor ? category.categoryColor : '#aaa';
        commandsContainer.appendChild(categoryTitle);

        // Обрабатываем команды внутри категории
        category.commands.forEach((cmd) => {
            const commandBlock = document.createElement('div'); // Блок для команды
            commandBlock.style.display = 'flex';
            commandBlock.style.flexDirection = 'column';
            commandBlock.style.marginBottom = '10px';

            const btn = document.createElement('button'); // Кнопка команды
            btn.innerText = cmd.label;
            btn.title = cmd.description;
            btn.style.padding = '8px';
            btn.style.border = '1px solid #ccc';
            btn.style.borderRadius = '5px';
            btn.style.backgroundColor = '#e0e0e0';
            btn.style.cursor = 'pointer';

            const inputs = []; // Массив для хранения полей ввода

            // Если команда имеет параметры, создаем поля ввода
            if (cmd.parameters && cmd.parameters.length > 0) {
                cmd.parameters.forEach(param => {
                    const Input = document.createElement('input');
                    Input.type = 'text';
                    Input.placeholder = `Введите ${param}`;
                    Input.style.marginBottom = '5px';
                    Input.style.backgroundColor = '#333';
                    Input.style.color = '#fff';
                    Input.style.borderRadius = '4px';
                    commandBlock.appendChild(Input);
                    inputs.push(Input); // Добавляем поле в массив
                });
            }

            // Обработчик нажатия на кнопку
            btn.onclick = () => {
                let finalCommand = cmd.command; // Изначальная команда

                // Проверяем, заполнены ли все параметры
                for (let i = 0; i < inputs.length; i++) {
                    const value = inputs[i].value.trim();
                    if (!value) {
                        sendmsg(`Параметр "${cmd.parameters[i]}" не может быть пустым!`,'Bot Menu Client (Error)','Bot Menu Client','#0066ff')
                        return; // Отменяем выполнение, если параметр пуст
                    }
                    finalCommand = finalCommand.replace(`[${cmd.parameters[i]}]`, value); // Заменяем параметр
                }

                // Вставляем готовую команду в чат
                const chatInput = document.querySelector('#chat-input');
                if (chatInput) {
                    chatInput.value = finalCommand;
                    chatInput.focus(); // Устанавливаем фокус на чат
                } else {
                    console.error('Chat input not found!');
                }
            };

            commandBlock.appendChild(btn); // Добавляем кнопку в блок команды
            commandsContainer.appendChild(commandBlock); // Добавляем блок команды в контейнер
        });
    });
}
    /* Поле поиска
const searchInput = document.createElement('input');
searchInput.type = 'text';
searchInput.marginBottom = '10px';
searchInput.placeholder = 'Поиск команд';
searchInput.style.marginBottom = '10px';
searchInput.style.backgroundColor = '#333';
searchInput.style.color = '#fff';
searchInput.style.borderRadius = '4px';
searchInput.oninput = filterCommands;
container.appendChild(searchInput);

function filterCommands() {
    const query = searchInput.value.toLowerCase();
    Array.from(commandsContainer.children).forEach(child => {
        if (child.innerText.toLowerCase().includes(query)) {
            child.style.display = 'block';
        } else {
            child.style.display = 'none';
        }
    });
}*/

    // Делает контейнер перетаскиваемым
    class BotChatPanel {
    constructor() {
        this.createPanel();
    }

    createPanel() {
        this.panel = document.createElement("div");
        this.panel.id = "bot-chat-panel";
        this.panel.style.position = "fixed";
        this.panel.style.bottom = "20px";
        this.panel.style.right = "20px";
        this.panel.style.width = "300px";
        this.panel.style.height = "400px";
        this.panel.style.background = "#222";
        this.panel.style.color = "#fff";
        this.panel.style.borderRadius = "10px";
        this.panel.style.padding = "10px";
        this.panel.style.overflowY = "auto";
        this.panel.style.display = "none";
        this.panel.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";

        const closeButton = document.createElement("button");
        closeButton.innerText = "✖";
        closeButton.style.position = "absolute";
        closeButton.style.top = "5px";
        closeButton.style.right = "5px";
        closeButton.style.background = "transparent";
        closeButton.style.color = "#fff";
        closeButton.style.border = "none";
        closeButton.style.cursor = "pointer";
        closeButton.onclick = () => this.panel.style.display = "none";
        this.panel.appendChild(closeButton);
        document.body.appendChild(this.panel);
    }

    showMessage(botName, botColor, message) {
        const messageDiv = document.createElement("div");
        messageDiv.style.padding = "5px";
        messageDiv.style.borderBottom = "1px solid #444";

        const botLabel = document.createElement("span");
        botLabel.innerText = `[${botName}] `;
        botLabel.style.color = botColor;
        botLabel.style.fontWeight = "bold";

        const textSpan = document.createElement("span");
        textSpan.innerText = message;

        messageDiv.appendChild(botLabel);
        messageDiv.appendChild(textSpan);
        this.panel.appendChild(messageDiv);

        this.panel.style.display = "block";
    }
}

// Создаем панель
const botChat = new BotChatPanel();

// Функция для обработки сообщений с directsend
function handleCommandResponse(response) {
    if (response.directsend === "true") {
        botChat.showMessage(response.botName, response.botColor, response.message);
    } else {
        console.log("Обычный ответ в чат", response.message);
    }
}

    function makeDraggable(element) {
        let offsetX = 0, offsetY = 0, mouseDown = false;

        element.addEventListener('mousedown', (e) => {
            mouseDown = true;
            offsetX = e.clientX - element.offsetLeft;
            offsetY = e.clientY - element.offsetTop;
        });

        document.addEventListener('mousemove', (e) => {
            if (!mouseDown) return;
            element.style.left = `${e.clientX - offsetX}px`;
            element.style.top = `${e.clientY - offsetY}px`;
        });

        document.addEventListener('mouseup', () => {
            mouseDown = false;
        });
    }

    makeDraggable(container);

    // Обработчик входящих сообщений
    MPP.client.on('custom', (data) => {
        if (!data.data || data.data.m !== 'BotMenu') return;

        const { botName, categories } = data.data;
        const botId = data.p;

        if (!botId || !botName || !Array.isArray(categories)) {
            console.debug('Invalid bot data received:', data.data);
            return;
        }

        // Проверяем, есть ли данные для бота
        if (!botsData[botId]) {
            botsData[botId] = { name: botName, categories: [] };

            // Обрабатываем категории
            categories.forEach((category) => {
                const { categoryName, position, commands } = category;

                botsData[botId].categories.push({
                    name: categoryName,
                    position,
                    commands,
                });
            });

            addTab(botId, botName); // Добавляем вкладку для бота
            sendmsg(`Данные были получены с ${botName}`,'Bot Menu Client','Bot Menu Client','#0066ff')
        } else {
            // Обновляем существующие данные
            botsData[botId].categories = categories.map((category) => ({
                name: category.categoryName,
                position: category.position,
                commands: category.commands,
            }));
            sendmsg(`Данные бота ${botName} были обновлены`,'Bot Menu Client','Bot Menu Client','#0066ff');
        }
    });
    if (localStorage.getItem('language') === null){
        const tryi18nextLng = confirm("try i18nextLng for language?")
        if (tryi18nextLng === true){
            localStorage.setItem('language', localStorage.getItem('i18nextLng'));
            alert('successfully')
        }else{

        }
    }
    // При подключении отправляем +custom
    MPP.client.on('hi', () => {
        const language = localStorage.getItem('language');
        MPP.client.sendArray([{ m: '+custom' }]);
    });
})();