/// DOM binds and constants
const consoleInput = document.getElementById("console-input");
const consoleOutput = document.getElementById("console-output");
const clearConsoleBtn = document.getElementById("clear-console-btn");
const stopConsoleBtn = document.getElementById("stop-console-btn");
const testConsoleBtn = document.getElementById("test-console-btn");
const toggleConsoleMultiline = document.getElementById("toggle-console-multiline-btn");
const consoleLog = console.log;

//bind console.log
console.log = interseptConsoleLog;

/// states
let consoleScrolledDown = true;
let isLogging = true;
let isMultiline = false; //сделать isSingleLine
let isSelecting = false; //когда текст не выделяется, фокус на console-input

/// functions
function interseptConsoleLog(msg) {
    consoleLog(msg);
    consoleOutput.innerHTML += `<p>${msg}</p>`;
    if (consoleScrolledDown) { // проскроллить вниз автоматически, если уже было внизу
        consoleOutput.scroll(consoleOutput.scrollLeft, consoleOutput.scrollHeight);
    }
}

function execute (event) {
    const cmd = event.currentTarget.value;
    event.currentTarget.value = "";
    try {
        eval(cmd);
    } catch(e) {
        console.log(e);
    }
}


/// events
//чек когда прокручено вниз
consoleOutput.addEventListener("scroll", (e) => {
    const element = e.currentTarget;
    const posY = element.scrollHeight - (element.scrollTop + element.clientHeight);
    consoleScrolledDown = (posY <= 5); // погрешность 5п на всякий
});

//get message from main window 
//переделать на экспорт функции модуля
//div вместо iframe, менять размер, сохраниение позиции
window.addEventListener("message", (event) => {
    interseptConsoleLog(event.data);
});

// super bad idea
// вместо этого добавлять и убирать listeners с разными лямбдами?
let ctrlPressed = false;
let enterPressed = false;

consoleInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter" && isMultiline) {
        enterPressed = true;
    }
    
    if (ctrlPressed && enterPressed) {
        execute(event);
        ctrlPressed = false;
        enterPressed = false;
        event.currentTarget.value = "";
    }

    ctrlPressed = false;
    enterPressed = false;
});

consoleInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !isMultiline) {
        event.preventDefault();
        //изменить, чтобы передавать сразу строку
        execute(event);
        return;
    }
    if (event.key === "Control") {
        ctrlPressed = true;
    }
    
});

toggleConsoleMultiline.addEventListener("click", () => {
    if (isMultiline) {
        isMultiline = false;
        toggleConsoleMultiline.textContent = "multiline input";
        consoleInput.placeholder = "Enter";
    } else if (!isMultiline) {
        isMultiline = true;
        toggleConsoleMultiline.textContent = "single line input";
        consoleInput.placeholder = "Ctrl + Enter";
    }
    
});

//clean console
clearConsoleBtn.addEventListener("click", () => {
    consoleOutput.innerHTML = "";
    consoleInput.value = "";
});

//actually pauses console output
stopConsoleBtn.addEventListener("click", () => {
    if (isLogging) {
        console.log = consoleLog;
        stopConsoleBtn.textContent = "start logging";
        isLogging = false;
    } else {
        console.log = interseptConsoleLog;
        stopConsoleBtn.textContent = "stop logging";
        isLogging = true;
    }

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

// предотвратить фокус, если начинается выделение текста в консоли
consoleOutput.addEventListener("selectstart", (_) => {
    isSelecting = true;
});

consoleOutput.addEventListener("mouseup", (_) => {
    if (!isSelecting) {
        consoleInput.focus();
    }
    isSelecting = false;

});
