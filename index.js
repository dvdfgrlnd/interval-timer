class Interval{
    constructor(id) {
        this.id = id;
        this.seconds = 0;
        this.count = 0;
    }

    changeSeconds(seconds) {
        this.seconds = seconds;
    }

    increaseCount() {
        this.count += 1;
    }

    resetCount() {
        this.count = 0;
    }
}

let cachedIntervals = localStorage.getItem("intervals");
let intervals = [];
if(cachedIntervals) {
    intervalsTemp = JSON.parse(cachedIntervals);
    intervals = intervalsTemp.map((x) => Object.assign(new Interval, x));
}

var audio = undefined;
var context = undefined;
var startTime = undefined;

let stopwatchDisplay = document.querySelector("#stopwatchDisplay");

window.onerror = function(error, url, line) {
    alert(`${error}, ${url}, ${line}`);
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
        const template = document.querySelector("#intervalTemplate");
        const clone = template.content.cloneNode(true);
        clone.querySelector(".intervalContainer").id=`interval_${i}`
        clone.querySelector(".intervalText").textContent = `Interval ${i}:`;
        let inp = clone.querySelector(".secondsInput");
        inp.value = el.seconds;
        inp.addEventListener("change", (event)=>{
            let newValue = Number(event.target.value);
            let ind = intervals.findIndex((v) => v.id === el.id);
            intervals[ind].changeSeconds(newValue);
            saveIntervals();
        })

        clone.querySelector(".deleteInterval").addEventListener("click", () => {
            intervals.splice(intervals.findIndex((v) => v.id === el.id), 1);
            renderIntervals();

            saveIntervals();
        });

        let intervalContainer = document.querySelector("#container");
        intervalContainer.appendChild(clone);
    }

}

document.querySelector("#addButton").addEventListener("click", ()=> {
    intervals.push(new Interval(Date.now()));
    renderIntervals();
});

let prevElapsedTime = 0;
let visualBeep = document.querySelector("#visualBeep");
let currentInterval = document.querySelector("#currentInterval");

function flashScreen() {
    document.querySelector("#mainContainer").style.display = 'none';
    document.querySelector("#flashElement").style.display = 'block';
    setTimeout(function() {
        document.querySelector("#mainContainer").style.display = 'block';
        document.querySelector("#flashElement").style.display = 'none';
    }, 500);
}

function updateTime(time) {
    if (!startButton.disabled){
        return;
    }
    if (!startTime) {
        startTime = time;
        prevElapsedTime = 0;
    }
    let elapsedTime = time - startTime;

    let totalTime = 1000 * intervals.reduce((p, c) => p+c.seconds, 0);

    let prevElapsedTimeRelative = prevElapsedTime % totalTime;
    let elapsedTimeRelative = elapsedTime % totalTime;
    let j = 0;
    let s = 0;
    let activeInterval = 0;
    for(interval of intervals) {
        s += interval.seconds;
        let seconds = 1000 * s;
        if(prevElapsedTimeRelative < seconds && (seconds <= elapsedTimeRelative || prevElapsedTimeRelative > elapsedTimeRelative)) {
            beep();
            visualBeep.classList.toggle("beep");
            flashScreen();
            let intervalNum = (j+1)%intervals.length;
            let iel = intervals[intervalNum];
            iel.increaseCount();
            currentInterval.textContent = `Interval #${intervalNum}`;
            for(d of document.querySelectorAll(".intervalContainer")) {
                d.classList.remove("selectedInterval");
            }
            let currentDoc = document.querySelector(`#interval_${intervalNum}`);
            currentDoc.classList.toggle("selectedInterval");
            currentDoc.querySelector(".intervalCount").textContent = `${iel.count}`;
            break;
        }
        if (elapsedTimeRelative <= seconds && !activeInterval) {
            activeInterval = [interval, seconds];
        }
        j += 1;
    }

    let secondsLeft = Math.round((activeInterval[1] - elapsedTimeRelative) / 1000);
    document.querySelector(`#timeLeftDisplay`).textContent = `${secondsLeft}s`;


    let seconds = parseInt((elapsedTime / 1000) % 60);
    let minutes = parseInt((elapsedTime / (1000 * 60)) % 60);
    let hours = parseInt((elapsedTime / (1000 * 60 * 60)) % 24);

    seconds = seconds < 10 ? "0" + seconds : seconds;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    hours = hours < 10 ? "0" + hours : hours;

    stopwatchDisplay.textContent = `Total: ${hours}:${minutes}:${seconds}`;

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

    intervals.forEach((i) => i.resetCount());
    
    intervals[0].increaseCount();
    currentInterval.textContent = `Interval #0`;
    document.querySelector(`#interval_0`).classList.toggle("selectedInterval");
    document.querySelector(`#interval_0 > .intervalCount`).textContent = "1";
    beep()
    flashScreen();

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
