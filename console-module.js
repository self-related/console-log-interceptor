//initialize console's html and css first
initConsole(); 

///DOM binds and constants
const consoleInput = document.getElementById("_console-input");
const consoleOutput = document.getElementById("_console-output");
const clearConsoleBtn = document.getElementById("_clear-console-btn");
const stopConsoleBtn = document.getElementById("_stop-console-btn");
const testConsoleBtn = document.getElementById("_test-console-btn");
const toggleInputTypeBtn = document.getElementById("_toggle-input-type-btn");
const consoleLog = console.log; //preserve actual console.log
const consoleUpperBorder = document.getElementById("_upper-border");
const consoleDiv = document.getElementById("_console-div")
const consolePanel = document.getElementById("_console-panel");

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


///Arrow Functions
    //по нажатию Enter вызывает команду из input (для ивента keydown)
const enterPressed = (event) => {    
    if (event.key === "Enter") {
        event.preventDefault();     //не добавлять отступ в <textarea>
        execute(event);
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
const toggleInputType = (event) => {   
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
    // по-умолчанию запуск команды из input по нажатию Enter (передает в eval)
consoleInput.addEventListener("keydown", enterPressed);

    //кнопка меняет режим ввода
toggleInputTypeBtn.addEventListener("click", toggleInputType);   

//во время прокрутки проверяет, прокручено ли сейчас до конца
//нужно для автопрокрутки во время вывода в консоль 
consoleOutput.addEventListener("scroll", (event) => {     
    const element = event.currentTarget;
    const posY = element.scrollHeight - (element.scrollTop + element.clientHeight);
    consoleScrolledDown = (posY <= 5);      //погрешность 5п на всякий
});

//button to clean console 
clearConsoleBtn.addEventListener("click", () => {       
    consoleOutput.innerHTML = "";
    consoleInput.value = "";
});

//stop logging in console
stopConsoleBtn.addEventListener("click", () => {        
    isLogging = !isLogging;
    if (isLogging) {
        console.log = interseptConsoleLog;
        stopConsoleBtn.textContent = "stop logging";
    } else {
        console.log = consoleLog;
        stopConsoleBtn.textContent = "start logging";
    }

});


//при клике на экран консоли перемещает фокус на ввод
consoleOutput.addEventListener("mouseup", (e) => { 
    if (e.button === 2) {
        return;
    }
    if (!isSelecting) {
        consoleInput.focus();
    }
    isSelecting = false;
});

// предотвратить фокус на ввод, если начато выделение текста
consoleOutput.addEventListener("selectstart", (e) => { 
    isSelecting = true;
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
let preventSelection = (event) => event.preventDefault(); // callback to disable text selecting while moving

//make top border resizable
consoleUpperBorder.addEventListener("mousedown", (event) => {
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
    consoleDiv.addEventListener("selectstart", preventSelection); //prevent text selecting
} );
//remove listeners when mouse is unpressed
consoleUpperBorder.addEventListener("mouseup", (event) => {
    window.removeEventListener("mousemove", changeConsoleHeight);
    consoleDiv.removeEventListener("selectstart", preventSelection);
    event.stopImmediatePropagation();
});



// init console html and css
function initConsole() {
    const consoleDiv = document.createElement("div");
    consoleDiv.id = "_console-div";
    const consoleStyle = document.createElement("style");
    document.body.appendChild(consoleDiv);
    document.head.appendChild(consoleStyle);

    consoleDiv.innerHTML = `
    <div id="_upper-border"></div>
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
