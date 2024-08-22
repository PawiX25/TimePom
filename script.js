let isRunning = false;
let interval;
let workDuration = 25 * 60;
let breakDuration = 5 * 60;
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

function updateProgressBar() {
    const progressBar = document.getElementById('progress-bar');
    const totalDuration = onBreak ? breakDuration : workDuration;
    const progress = ((totalDuration - timeRemaining) / totalDuration) * 100;
    progressBar.style.width = `${progress}%`;
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

    updateProgressBar();
}

function updateDurations() {
    const workInput = document.getElementById('work-time').value;
    const breakInput = document.getElementById('break-time').value;
    workDuration = parseInt(workInput) * 60;
    breakDuration = parseInt(breakInput) * 60;
    if (!onBreak) {
        timeRemaining = workDuration;
        updateTimer();
    } else {
        timeRemaining = breakDuration;
        updateTimer();
    }
}

function startTimer() {
    if (!isRunning) {
        updateDurations(); 
        document.getElementById('input-container').classList.add('hidden'); 
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
    document.getElementById('input-container').classList.remove('hidden'); 
}

document.getElementById('start-btn').addEventListener('click', startTimer);
document.getElementById('pause-btn').addEventListener('click', pauseTimer);
document.getElementById('reset-btn').addEventListener('click', resetTimer);

updateTimer();
