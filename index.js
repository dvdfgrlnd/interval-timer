
let cachedIntervals = localStorage.getItem("intervals");
let intervals = [];
if(cachedIntervals) {
    intervals = JSON.parse(cachedIntervals);
}

var audio = undefined;
var context = undefined;
var startTime = undefined;

let errorText = document.querySelector("#errorText");
let stopwatchDisplay = document.querySelector("#stopwatchDisplay");

window.onerror = function(error, url, line) {
    let t = errorText.innerText;
    errorText.innerText = t +`${error}, ${url}, ${line}`;
};


function beep() {
    oscillator = context.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.value = 600;
    oscillator.connect(context.destination);
    oscillator.start();
    setTimeout(function () {
        oscillator.stop();
    }, 300);
}

function saveIntervals() {
    localStorage.setItem("intervals", JSON.stringify(intervals));
}

function renderIntervals() {
    let container = document.querySelector("#container");
    container.replaceChildren();

    for (const [i, el] of intervals.entries()) {
        const [_, seconds] = el;
        const template = document.querySelector("#intervalTemplate");
        const clone = template.content.cloneNode(true);
        clone.querySelector(".intervalText").textContent = `Interval ${i}:`;
        let inp = clone.querySelector(".secondsInput");
        inp.value = seconds;
        inp.addEventListener("change", (event)=>{
            let newValue = Number(event.target.value);
            let ind = intervals.findIndex((v) => v[0] === el[0]);
            intervals[ind] = [el[0], newValue];
            saveIntervals();
        })

        clone.querySelector(".deleteInterval").addEventListener("click", () => {
            intervals.splice(intervals.findIndex((v) => v[0] === el[0]), 1);
            renderIntervals();

            saveIntervals();
        });

        let intervalContainer = document.querySelector("#container");
        intervalContainer.appendChild(clone);
    }

}

document.querySelector("#addButton").addEventListener("click", ()=> {
    intervals.push([Date.now(), 0]);
    renderIntervals();
});

let prevElapsedTime = 0;
let visualBeep = document.querySelector("#visualBeep");
let intervalInfo = document.querySelector("#intervalInfo");

function updateTime(time) {
    if (!startButton.disabled){
        return;
    }
    if (!startTime) {
        startTime = time;
        prevElapsedTime = 0;
    }
    let elapsedTime = time - startTime;

    let totalTime = 1000 * intervals.reduce((p, c) => p+c[1], 0);
    let t = elapsedTime % totalTime;

    let prevElapsedTimeRelative = prevElapsedTime % totalTime;
    let elapsedTimeRelative = elapsedTime % totalTime;
    let j = 0;
    let s = 0;
    for(i of intervals) {
        s += i[1];
        let seconds = 1000 * s;
        if(prevElapsedTimeRelative < seconds && (seconds <= elapsedTimeRelative || prevElapsedTimeRelative > elapsedTimeRelative)) {
            beep();
            visualBeep.classList.toggle("beep");
            intervalInfo.textContent = `Interval #${(j+1)%intervals.length}`;
            break;
        }
        j += 1;
    }


    let seconds = parseInt((elapsedTime / 1000) % 60);
    let minutes = parseInt((elapsedTime / (1000 * 60)) % 60);
    let hours = parseInt((elapsedTime / (1000 * 60 * 60)) % 24);

    seconds = seconds < 10 ? "0" + seconds : seconds;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    hours = hours < 10 ? "0" + hours : hours;

    stopwatchDisplay.textContent = `${hours}:${minutes}:${seconds}`;

    prevElapsedTime = elapsedTime;
    animationFrameId = requestAnimationFrame(updateTime);
}

let startButton = document.querySelector("#startButton");
startButton.addEventListener("click", ()=>{
    if (!context){
        context = new AudioContext();
    }
    startButton.disabled = true;
    stopButton.disabled = false;
    
    intervalInfo.textContent = `Interval #0`;
    requestAnimationFrame(updateTime);
    startTime = undefined;
});

let stopButton = document.querySelector("#stopButton");
stopButton.addEventListener("click", ()=>{
    startButton.disabled = false;
    stopButton.disabled = true;
});

startButton.disabled = false;
stopButton.disabled = true;

renderIntervals();