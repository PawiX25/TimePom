let isRunning = false;
let interval;
const workDuration = 25 * 60;
const breakDuration = 5 * 60;
let timeRemaining = workDuration;
let onBreak = false;

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function updateVisualFeedback() {
    const body = document.body;
    if (onBreak) {
        body.classList.remove('bg-work');
        body.classList.add('bg-break');
    } else {
        body.classList.remove('bg-break');
        body.classList.add('bg-work');
    }
}

function updateTimer() {
    const minutesElem = document.getElementById('minutes');
    const secondsElem = document.getElementById('seconds');
    minutesElem.textContent = formatTime(timeRemaining).split(':')[0];
    secondsElem.textContent = formatTime(timeRemaining).split(':')[1];

    if (timeRemaining <= 0) {
        clearInterval(interval);
        isRunning = false;
        timeRemaining = onBreak ? workDuration : breakDuration;
        onBreak = !onBreak;
        document.getElementById('status').textContent = onBreak ? 'Break Time!' : 'Work Session';
        updateVisualFeedback();
        playAlert();
    }
}

function startTimer() {
    if (!isRunning) {
        interval = setInterval(() => {
            timeRemaining--;
            updateTimer();
        }, 1000);
        isRunning = true;
    }
}

function pauseTimer() {
    clearInterval(interval);
    isRunning = false;
}

function resetTimer() {
    clearInterval(interval);
    isRunning = false;
    timeRemaining = workDuration;
    document.getElementById('status').textContent = 'Work Session';
    document.body.classList.remove('bg-break');
    updateVisualFeedback();
    updateTimer();
}

document.getElementById('start-btn').addEventListener('click', startTimer);
document.getElementById('pause-btn').addEventListener('click', pauseTimer);
document.getElementById('reset-btn').addEventListener('click', resetTimer);

updateTimer();
