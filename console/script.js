///DOM binds and constants
const consoleInput = document.getElementById("console-input");
const consoleOutput = document.getElementById("console-output");
const clearConsoleBtn = document.getElementById("clear-console-btn");
const stopConsoleBtn = document.getElementById("stop-console-btn");
const testConsoleBtn = document.getElementById("test-console-btn");
const toggleInputTypeBtn = document.getElementById("toggle-input-type-btn");
const consoleLog = console.log; //preserve actual console.log

//Bind console.log
console.log = interseptConsoleLog;

///States
let consoleScrolledDown = true;
let isLogging = true;
let isSingleLine = true;
let isSelecting = false; //когда текст не выделяется, фокус на console-input; иначе без фокуса


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