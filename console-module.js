//initialize console's html and css first
initConsole(); 

///DOM binds and constants
const consoleInput = document.getElementById("_console-input");
const consoleOutput = document.getElementById("_console-output");
const clearConsoleBtn = document.getElementById("_clear-console-btn");
const stopConsoleBtn = document.getElementById("_stop-console-btn");
const testConsoleBtn = document.getElementById("_test-console-btn");
const toggleConsoleInputTypeBtn = document.getElementById("_toggle-input-type-btn");
const consoleUpperBorder = document.getElementById("_upper-border");
const consoleDiv = document.getElementById("_console-div")
const consolePanel = document.getElementById("_console-panel");
const hideConsoleButton = document.getElementById("_hide-console-btn");
const restoreConsoleButton = document.getElementById("_restore-console-btn");
const consoleLog = console.log; //preserve actual console.log
const consoleError = console.error; //preserve actual console.error

//Bind console.log and console.error
console.log = interseptConsoleLog;
console.error = interseptConsoleError;

///States
let isConsoleScrolledDown = true;
let isConsoleLogging = true;
let isConsoleSingleLine = true;
let isConsoleSelecting = false; //когда текст не выделяется, фокус на _console-input; иначе без фокуса


///Functions
function interseptConsoleLog(msg) {
    consoleLog(msg);
    //split messages by \n and push them one by one
    const msgs = msg.split?.('\n') ?? [msg]; //if not a string, put all msg in array
    msgs.forEach((msg) => consoleOutput.insertAdjacentHTML('beforeend', `<p>${msg}</p>`));
    if (isConsoleScrolledDown) { // проскроллить вниз автоматически, если уже было внизу
        consoleOutput.scroll(consoleOutput.scrollLeft, consoleOutput.scrollHeight);
    }
}

//same as above, but for console.error with red colored text
function interseptConsoleError(msg) {
    consoleError(msg);
    const msgs = msg.split?.('\n') ?? [msg];
    msgs.forEach((msg) => consoleOutput.insertAdjacentHTML('beforeend', `<p style="color: red">${msg}</p>`));
    if (isConsoleScrolledDown) {
        consoleOutput.scroll(consoleOutput.scrollLeft, consoleOutput.scrollHeight);
    }
}

function executeConsoleCommand(event) {
    const cmd = event.currentTarget.value;
    event.currentTarget.value = "";
    try {
        eval(cmd);
    } catch(e) {
        console.error(e);
    }
}


///Arrow Functions
    //по нажатию Enter вызывает команду из input (для ивента keydown)
const enterPressed = (event) => {    
    if (event.key === "Enter") {
        event.preventDefault();     //не добавлять отступ в <textarea>
        executeConsoleCommand(event);
    }
};

    //если нажат Ctrl, добавляет listener нажатия Enter
const ctrlPressed = (event) => {    
    if (event.key === "Control") {
        event.currentTarget.addEventListener("keydown", enterPressed);
    }
};

//когда ctrl отпущен, удаляет listener нажатия Enter
const ctrlUnpressed = (event) => {    
    event.currentTarget.removeEventListener("keydown", enterPressed);
};

// callback для смены режима ввода (single-line, multi-line) 
const toggleInputMode = (event) => {   
    isConsoleSingleLine = !isConsoleSingleLine;
    const button = event.currentTarget;
    if (isConsoleSingleLine) {        //добавляет listener Enter, убирает Ctrl
        consoleInput.addEventListener("keydown", enterPressed);
        consoleInput.removeEventListener("keydown", ctrlPressed);
        consoleInput.removeEventListener("keyup", ctrlUnpressed);
        button.textContent = "multi-line";
        consoleInput.placeholder = "Enter";
    } else {        //добавляет listener Ctrl, убирает Enter 
        consoleInput.removeEventListener("keydown", enterPressed);
        consoleInput.addEventListener("keydown", ctrlPressed);
        consoleInput.addEventListener("keyup", ctrlUnpressed);
        button.textContent = "single-line";
        consoleInput.placeholder = "Ctrl + Enter";
    }
}


///Events
    // по-умолчанию запуск команды из input по нажатию Enter (передает в eval)
consoleInput.addEventListener("keydown", enterPressed);

    //кнопка меняет режим ввода
toggleConsoleInputTypeBtn.addEventListener("click", toggleInputMode);   


//во время прокрутки проверяет, прокручено ли сейчас до конца
//нужно для автопрокрутки во время вывода в консоль 
consoleOutput.addEventListener("scroll", (event) => {     
    const element = event.currentTarget;
    const posY = element.scrollHeight - (element.scrollTop + element.clientHeight);
    isConsoleScrolledDown = (posY <= 5);      //погрешность 5п на всякий
});


//button to clean console 
clearConsoleBtn.addEventListener("click", () => {       
    consoleOutput.innerHTML = "";
    consoleInput.value = "";
});


//stop logging in console
stopConsoleBtn.addEventListener("click", () => {        
    isConsoleLogging = !isConsoleLogging;
    if (isConsoleLogging) {
        console.log = interseptConsoleLog;
        console.error = interseptConsoleError;
        stopConsoleBtn.textContent = "stop logging";
    } else {
        console.log = consoleLog;
        console.error = consoleError;
        stopConsoleBtn.textContent = "start logging";
    }

});


//при клике на экран консоли перемещает фокус на ввод
consoleOutput.addEventListener("mouseup", (e) => { 
    if (e.button === 2) {
        return;
    }
    if (!isConsoleSelecting) {
        consoleInput.focus();
    }
    isConsoleSelecting = false;
});
// предотвратить фокус на ввод, если начато выделение текста
consoleOutput.addEventListener("selectstart", (e) => { 
    isConsoleSelecting = true;
});


//simple counter for console output
testConsoleBtn.onclick = async () => {      
    testConsoleBtn.disabled = true;
    for (let i = 0; i < 30; i++) {
        console.log(i + "_".repeat(40) + ` ${i}` + "_".repeat(200));
        await new Promise((resolve) => setInterval(resolve, 200));
    }
    testConsoleBtn.disabled = false;
};


//callback for changing console's height, outer variable to add and remove the exact listener later
let changeConsoleHeight;    
let preventConsoleSelection = (event) => event.preventDefault(); // callback to disable text selecting while moving

//make top border resizable
consoleUpperBorder.addEventListener("mousedown", (event) => {
    window.removeEventListener("mousemove", changeConsoleHeight); // по клику прекращает бесконечный ресайз
    //get current Y on click and console's height
    let yOnClick = event.screenY;
    let currentHeight = consoleDiv.clientHeight;
    
    //changes console's height:
    changeConsoleHeight = (event) => {
        let yOnMove = event.screenY
        let heightOffset = yOnClick - yOnMove;
        consoleDiv.style.height = (currentHeight + heightOffset) + "px";
        };
    //add listener to window which calculates Y on every mouse move
    window.addEventListener("mousemove", changeConsoleHeight);
    consoleDiv.addEventListener("selectstart", preventConsoleSelection); //prevent text selecting
} );
//remove listeners when mouse is unpressed
consoleUpperBorder.addEventListener("mouseup", (event) => {
    window.removeEventListener("mousemove", changeConsoleHeight);
    consoleDiv.removeEventListener("selectstart", preventConsoleSelection);
    event.stopImmediatePropagation();
});

//hide and restore console
const hideRestoreConsole = () => {
    consoleDiv.classList.toggle("hide");
    restoreConsoleButton.classList.toggle("hide");
};
hideConsoleButton.onclick = hideRestoreConsole;
restoreConsoleButton.onclick = hideRestoreConsole;


// init console html and css
function initConsole() {
    const consoleDiv = document.createElement("div");
    consoleDiv.id = "_console-div";
    const consoleStyle = document.createElement("style");
    
    const restoreConsoleButton = document.createElement("button");
    restoreConsoleButton.className = "button hide";
    restoreConsoleButton.id = "_restore-console-btn"
    restoreConsoleButton.textContent = "▲";

    document.body.appendChild(consoleDiv);
    document.body.appendChild(restoreConsoleButton);
    document.head.appendChild(consoleStyle);

    consoleDiv.innerHTML = `
    <div id="_upper-border"></div>
    <div class="console-panel" id="console-panel">
        <button id="_hide-console-btn" class="button">▼</button>
        <button id="_clear-console-btn" class="button">clear</button>
        <button id="_stop-console-btn" class="button">stop logging</button>
        <button id="_test-console-btn" class="button">test output</button>
        <button id="_toggle-input-type-btn" class="button">multi-line</button>
    </div>
    <div id="_console-output"></div>
    <textarea id="_console-input" placeholder="Enter"></textarea>
    `;

    consoleStyle.innerHTML = `
        #_restore-console-btn {
            width: 20px;
            height: 20px;
            font-size: 15px;
            position: absolute;
            bottom: 10px;
            left: 10px;
            z-index: 99;
        }
        .hide {
            visibility: hidden;
        }
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

        #_console-div {
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
            border-top-left-radius: 7px;
            border-top-right-radius: 7px;
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
            padding-left: 5px;
        }
        #_console-input:focus {
            outline: 0;
        }

        #_console-output p {
            margin: 6px;
        }
        #_upper-border {
            width: 100%;
            height: 7px;
            background-color: #404040;
            border-top-left-radius: 15px;
            border-top-right-radius: 15px;
            cursor: ns-resize;
        }
    `;
}
