/// DOM binds and constants
const consoleOutput = document.getElementById("console-output");
const clearConsoleBtn = document.getElementById("clear-console-btn");
const stopConsoleBtn = document.getElementById("stop-console-btn");
const testConsoleBtn = document.getElementById("test-console-btn");
const consoleInput = document.getElementById("console-input");
const toggleConsoleMultiline = document.getElementById("toggle-console-multiline-btn");
const consoleLog = console.log;


/// states
// все убрать и сделать по-другому
let isMultiline = false;
let isLogging = true;
let scrollSwitch = false;


/// functions

function interseptConsoleLog(msg) {
    //скролл поменять
    let isScrolledDown = getScrollingState(); // сразу, чтобы знать, что прокручено до конца
    consoleLog(msg);
    consoleOutput.innerHTML += `<p>${msg}</p>`;
    scroll(isScrolledDown);
}
console.log = interseptConsoleLog;

function bindConsole(console) {
    console.log = interseptConsoleLog;
};

function test() {
    console.log("test console");
    return "test";
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

//поменять на listener
function scroll(isScrolledDown) {
    const scrollTop = isScrolledDown 
    ? consoleOutput.scrollHeight
    : consoleOutput.scrollTop;
    const scrollLeft = consoleOutput.scrollLeft;
    consoleOutput.scroll(scrollLeft, scrollTop);
}

function getScrollingState() {
    return (consoleOutput.scrollHeight - (consoleOutput.scrollTop + consoleOutput.clientHeight) ) <= 2;
}


/// events

//get message from main window 
//переделать на экспорт функции модуля
//div вместо iframe, менять размер, сохраниение позиции
window.addEventListener("message", (event) => {
    interseptConsoleLog(event.data);
});

// super bad idea
// вместо этого добавлять и убирать listeners с разными лямбдами
let ctrlPressed = false;
let enterPressed = false;
//
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
//
consoleInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !isMultiline) {
        event.preventDefault();
        //передавать сразу строку
        execute(event);
        return;
    }
    if (event.key === "Control") {
        ctrlPressed = true;
    }
    
});

// clean console
clearConsoleBtn.addEventListener("click", () => {
    consoleOutput.innerHTML = "";
    consoleInput.value = "";
});

// actually pauses console output
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

testConsoleBtn.onclick = async () => {
    testConsoleBtn.disabled = true;
    for (let i = 0; i < 30; i++) {
        console.log(i + "_".repeat(40) + ` ${i}` + "_".repeat(200));
        await new Promise((resolve) => setInterval(resolve, 200));
    }
    testConsoleBtn.disabled = false;
};


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

// change it
let isSelecting = false;
consoleOutput.addEventListener("selectstart", () => {
    isSelecting = true;
});
consoleOutput.addEventListener("mouseup", () => {
    if (!isSelecting) {
        consoleInput.focus();
    }
    isSelecting = false;

});
