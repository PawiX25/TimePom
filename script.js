let isRunning = false;
let interval;
let workDuration = 25 * 60;
let breakDuration = 5 * 60;
let longBreakDuration = 15 * 60;
let timeRemaining = workDuration;
let onBreak = false;
let sessionsCompleted = 0;
const sessionsBeforeLongBreak = 4;
let tasks = [];

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playBeep() {
    const beep = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    beep.connect(gainNode);
    gainNode.connect(audioContext.destination);

    beep.type = 'sine';
    beep.frequency.setValueAtTime(440, audioContext.currentTime); 
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    beep.start();
    beep.stop(audioContext.currentTime + 0.5); 
}

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
    const totalDuration = onBreak ? (sessionsCompleted >= sessionsBeforeLongBreak ? longBreakDuration : breakDuration) : workDuration;
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

        if (!onBreak) {
            sessionsCompleted++;
            if (sessionsCompleted >= sessionsBeforeLongBreak) {
                timeRemaining = longBreakDuration;
                sessionsCompleted = 0; // reset after long break
            } else {
                timeRemaining = breakDuration;
            }
            onBreak = true;
        } else {
            timeRemaining = workDuration;
            onBreak = false;
        }

        const sessionType = onBreak ? 'Break Time!' : 'Work Session';
        document.getElementById('status').textContent = sessionType;
        updateVisualFeedback();
        showNotification('Session Complete', sessionType);
        playBeep();
    }

    updateProgressBar();
}

function updateDurations() {
    const workInput = document.getElementById('work-time').value;
    const breakInput = document.getElementById('break-time').value;

    if (isNaN(workInput) || isNaN(breakInput) || workInput <= 0 || breakInput <= 0) {
        showError('Please enter valid positive numbers for both work and break times.');
        return;
    }

    workDuration = parseInt(workInput) * 60;
    breakDuration = parseInt(breakInput) * 60;
    if (!onBreak) {
        timeRemaining = workDuration;
        updateTimer();
    } else {
        timeRemaining = breakDuration;
        updateTimer();
    }

    clearError();
}

function showError(message) {
    const errorElem = document.getElementById('error-message');
    errorElem.textContent = message;
    errorElem.classList.remove('hidden');
}

function clearError() {
    const errorElem = document.getElementById('error-message');
    errorElem.textContent = '';
    errorElem.classList.add('hidden');
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
    clearError();
}

function renderTasks() {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = ''; 
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.className = 'flex items-center justify-between py-2 text-gray-800';
        li.innerHTML = `
            <span id="task-${index}" ${task.completed ? 'style="text-decoration: line-through;"' : ''}>${task.text}</span>
            <div>
                <button class="bg-green-500 text-white py-1 px-2 rounded-lg ml-2 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400" onclick="markTaskComplete(${index})">Complete</button>
                <button class="bg-blue-500 text-white py-1 px-2 rounded-lg ml-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400" onclick="editTask(${index})">Edit</button>
                <button class="bg-red-500 text-white py-1 px-2 rounded-lg ml-2 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400" onclick="removeTask(${index})">Remove</button>
            </div>
        `;
        taskList.appendChild(li);
    });
}

function addTask() {
    const taskInput = document.getElementById('task-input');
    const taskText = taskInput.value.trim();
    if (taskText) {
        tasks.push({ text: taskText, completed: false });
        taskInput.value = '';
        renderTasks();
    }
}

function markTaskComplete(index) {
    tasks[index].completed = true;
    renderTasks();
}

function editTask(index) {
    const newTaskText = prompt('Edit task:', tasks[index].text);
    if (newTaskText !== null) {
        tasks[index].text = newTaskText.trim();
        renderTasks();
    }
}

function removeTask(index) {
    tasks.splice(index, 1);
    renderTasks();
}


function showNotification(title, message) {
    if (Notification.permission === 'granted') {
        new Notification(title, {
            body: message,
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (Notification.permission !== 'granted') {
        Notification.requestPermission();
    }
});

document.getElementById('start-btn').addEventListener('click', startTimer);
document.getElementById('pause-btn').addEventListener('click', pauseTimer);
document.getElementById('reset-btn').addEventListener('click', resetTimer);
document.getElementById('add-task-btn').addEventListener('click', addTask);


updateTimer();
