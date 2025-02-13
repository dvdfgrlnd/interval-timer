
let cachedIntervals = localStorage.getItem("intervals");
let intervals = [];
if(cachedIntervals) {
    intervals = JSON.parse(cachedIntervals);
}

var audio = undefined;

let errorText = document.querySelector("#errorText");

window.onerror = function(error, url, line) {
    let t = errorText.innerText;
    errorText.innerText = t +`${error}, ${url}, ${line}`;
};

function beep() {
    audio.play();
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
        clone.querySelector(".intervalText").textContent = `Interval ${i+1}:`;
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

function startClock(repeat) {
    let i = repeat % intervals.length;
    setTimeout(()=>{
        if (startButton.disabled){
            beep();
            startClock(repeat+1);
        }
    }, 1000*intervals[i][1]);
}

let startButton = document.querySelector("#startButton");
startButton.addEventListener("click", ()=>{
    if (!audio) {
        audio = new Audio("cymbal.m4a");
    }
    beep();
    startButton.disabled = true;
    stopButton.disabled = false;
    startClock(0)
});

let stopButton = document.querySelector("#stopButton");
stopButton.addEventListener("click", ()=>{
    startButton.disabled = false;
    stopButton.disabled = true;
});

startButton.disabled = false;
stopButton.disabled = true;

renderIntervals();