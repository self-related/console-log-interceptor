initConsole(); //initialize console's html and css first

///DOM binds and constants
const consoleInput = document.getElementById("_console-input");
const consoleOutput = document.getElementById("_console-output");
const clearConsoleBtn = document.getElementById("_clear-console-btn");
const stopConsoleBtn = document.getElementById("_stop-console-btn");
const testConsoleBtn = document.getElementById("_test-console-btn");
const toggleInputTypeBtn = document.getElementById("_toggle-input-type-btn");
const consoleLog = console.log; //preserve actual console.log

//Bind console.log
console.log = interseptConsoleLog;

///States
let consoleScrolledDown = true;
let isLogging = true;
let isSingleLine = true;
let isSelecting = false; //когда текст не выделяется, фокус на _console-input; иначе без фокуса


///Functions
function interseptConsoleLog(msg) {
    consoleLog(msg);
    consoleOutput.insertAdjacentHTML('beforeend', `<p>${msg}</p>`);
    if (consoleScrolledDown) { // проскроллить вниз автоматически, если уже было внизу
        consoleOutput.scroll(consoleOutput.scrollLeft, consoleOutput.scrollHeight);
    }
}

function execute(event) {
    const cmd = event.currentTarget.value;
    event.currentTarget.value = "";
    try {
        eval(cmd);
    } catch(e) {
        console.log(e);
    }
}


///Lambdas
const enterPressed = (event) => {    //по нажатию Enter вызывает команду (для ивента keydown)
    if (event.key === "Enter") {
        event.preventDefault();
        execute(event);
    }
};

const ctrlPressed = (event) => {    //если нажат Ctrl, добавляет listener нажатия Enter
    if (event.key === "Control") {
        event.currentTarget.addEventListener("keydown", enterPressed);
    }
};

const ctrlUnpressed = (event) => {    //когда ctrl отпущен, убирает listener нажатия Enter
    event.currentTarget.removeEventListener("keydown", enterPressed);
};

const toggleInputType = (event) => {   //меняет режим ввода
    isSingleLine = !isSingleLine;
    const button = event.currentTarget;
    if (isSingleLine) {        //добавляет listener Enter, убирает Ctrl
        consoleInput.addEventListener("keydown", enterPressed);
        consoleInput.removeEventListener("keydown", ctrlPressed);
        consoleInput.removeEventListener("keyup", ctrlUnpressed);
        button.textContent = "multi-line";
    } else {        //добавляет listener Ctrl, убирает Enter 
        consoleInput.removeEventListener("keydown", enterPressed);
        consoleInput.addEventListener("keydown", ctrlPressed);
        consoleInput.addEventListener("keyup", ctrlUnpressed);
        button.textContent = "single-line";
    }
}


///Events
consoleInput.addEventListener("keydown", enterPressed);          //слушает Enter по-умолчанию

toggleInputTypeBtn.addEventListener("click", toggleInputType);   //кнопка меняет режим ввода

    //get message from main window 
    //переделать на экспорт функции модуля
    //div вместо iframe, менять размер, сохраниение позиции
    window.addEventListener("message", (event) => {
        interseptConsoleLog(event.data);
    });

consoleOutput.addEventListener("scroll", (e) => {     //чек когда уже прокручено вниз
    const element = e.currentTarget;
    const posY = element.scrollHeight - (element.scrollTop + element.clientHeight);
    consoleScrolledDown = (posY <= 5);      //погрешность 5п на всякий
});


clearConsoleBtn.addEventListener("click", () => {       //clean console button
    consoleOutput.innerHTML = "";
    consoleInput.value = "";
});

stopConsoleBtn.addEventListener("click", () => {        //actually pauses console logging
    isLogging = !isLogging;
    if (isLogging) {
        console.log = interseptConsoleLog;
        stopConsoleBtn.textContent = "stop logging";
    } else {
        console.log = consoleLog;
        stopConsoleBtn.textContent = "start logging";
    }

});

consoleOutput.addEventListener("selectstart", (e) => { // предотвратить фокус на вводе при выделении текста в консоли
    isSelecting = true;
});

consoleOutput.addEventListener("mouseup", (e) => { //фокус на вводе при клике
    if (e.button === 2) {
        return;
    }
    if (!isSelecting) {
        consoleInput.focus();
    }
    isSelecting = false;
});

testConsoleBtn.onclick = async () => {      //simple counter for console output
    testConsoleBtn.disabled = true;
    for (let i = 0; i < 30; i++) {
        console.log(i + "_".repeat(40) + ` ${i}` + "_".repeat(200));
        await new Promise((resolve) => setInterval(resolve, 200));
    }
    testConsoleBtn.disabled = false;
};


// init console html and css
function initConsole() {
    const consoleDiv = document.createElement("div");
    consoleDiv.id = "console-div";
    const consoleStyle = document.createElement("style");
    document.body.appendChild(consoleDiv);
    document.head.appendChild(consoleStyle);

    consoleDiv.innerHTML = `
    <div class="console-panel" id="console-panel">
        <button id="_clear-console-btn" class="button">clear</button>
        <button id="_stop-console-btn" class="button">stop logging</button>
        <button id="_test-console-btn" class="button">test output</button>
        <button id="_toggle-input-type-btn" class="button">multi-line</button>
    </div>
    <div id="_console-output"></div>
    <textarea id="_console-input" placeholder="Enter"></textarea>
    `;

    consoleStyle.innerHTML = `
        .button {
            border: 0;
            margin-left: 5px;
            margin-top: 5px;
            border-radius: 3px;
            background: linear-gradient( rgb(255, 98, 0) 45%, rgb(205, 55, 55) 65%, rgb(255, 98, 0) 100%);
            color: white;
            text-shadow: 1px 0px 2px black;
        }
        .button:hover{
            background: red;
        }
        .button:active {
            background: rgb(253, 158, 5);
        }

        #console-div {
            z-index: 100;
            width: 90%;
            height: 250px;
            position: fixed;
            bottom: 0;
            left: 0;
            display: flex;
            flex-direction: column;
            background-color: black;    
            color: white;
            box-sizing: border-box;
        }

        #console-panel {
            background-color: black;
            height: 10%;
            max-height: 15vh;
            border-radius: 10px;

        }


        #_console-output {
            margin-top: 2px;
            height: 75%;
            overflow-y: scroll;
            margin-bottom: 1px;
            text-wrap: nowrap;
        }

        #_console-input {
            background-color: black;    
            border: none;
            color: white;
            height: 10%;
            width: 97%;
            position: absolute;
            bottom: 0;
            resize: none;
        }
        #_console-input:focus {
            outline: 0;
        }

        #_console-output p {
            margin: 6px;
        }
    `;
}
