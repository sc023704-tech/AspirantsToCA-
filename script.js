let appState = {};

const defaultRoutine = [
    { time: "5:00–6:00 AM", task: "Brush + Exercise" },
    { time: "6:00–9:00 AM", task: "Law Comprehensive Block" },
    { time: "9:00–10:00 AM", task: "Breakfast + Bath" },
    { time: "10:00–1:00 PM", task: "Quantitative Aptitude Session" },
    { time: "1:00–3:00 PM", task: "Lunch + Strategic Rest" },
    { time: "3:00–4:00 PM", task: "Core Consolidation Revision" },
    { time: "4:00–7:00 PM", task: "Advanced Accounting Module" },
    { time: "7:00–9:00 PM", task: "Business Economics" },
    { time: "9:00–10:00 PM", task: "Law Writing Practice Sandbox" },
    { time: "10:00–11:00 PM", task: "Dinner + Execution Planning" },
    { time: "11:00 PM–5:00 AM", task: "Deep Sleep Cycles Sync" }
];

const defaultSyllabus = [
    { name: "⚖ Business Law", chapters: ["Indian Contract Act, 1872", "Sale of Goods Act, 1930", "Companies Act, 2013"] },
    { name: "📘 Accounting", chapters: ["Theoretical Framework", "Accounting Process", "Bank Reconciliation Statement"] }
];

const shivamQuotes = [
    "“Sep 2026 door nahi hai bhai, aaj ka schedule poora track par hona chahiye!”",
    "“Discipline is doing what needs to be done, even if you don't feel like it.”",
    "“Consistency is the bridge between CA Foundation preparation and success.”",
    "“Your target is clear. Make every minute count.”"
];

document.addEventListener("DOMContentLoaded", () => {
    loadState();
    initCoreApp();
});

function createDefaultState() {
    return {
        theme: "dark-blue",
        targetDate: "2026-09-01",
        challengeDays: 50,
        hoursLogged: { today: 0, total: 0, lastUpdated: "" },
        customRoutine: [...defaultRoutine],
        routineChecked: {},
        subjects: [...defaultSyllabus],
        chaptersChecked: {},
        todo: [],
        roadmapChecked: {},
        diary: [],
        xp: 0
    };
}

function loadState() {
    try {
        appState = JSON.parse(localStorage.getItem("ca_global_state_v3")) || createDefaultState();
    } catch(e) {
        appState = createDefaultState();
    }
    const today = new Date().toDateString();
    if (!appState.hoursLogged || appState.hoursLogged.lastUpdated !== today) {
        appState.hoursLogged = appState.hoursLogged || { today: 0, total: 0 };
        appState.hoursLogged.today = 0;
        appState.hoursLogged.lastUpdated = today;
        appState.routineChecked = {};
        saveState();
    }
    document.documentElement.setAttribute("data-theme", appState.theme || "dark-blue");
}

function saveState() {
    localStorage.setItem("ca_global_state_v3", JSON.stringify(appState));
    calculateTelemetry();
}

function initCoreApp() {
    setupNavigation();
    setupThemeSelector();
    setupConfigHandler();
    startClocksAndCountdowns();
    renderRoutine();
    renderSyllabus();
    setupPomodoro();
    setupStopwatchAndTodo();
    renderRoadmap();
    setupDiary();
    selectQuote();
    setupInterSyncEngine();
}

function setupNavigation() {
    document.querySelectorAll(".nav-item").forEach(item => {
        item.addEventListener("click", () => {
            document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
            document.querySelectorAll(".app-section").forEach(s => s.classList.remove("active"));
            item.classList.add("active");
            document.getElementById(item.getAttribute("data-target")).classList.add("active");
        });
    });
}

function setupThemeSelector() {
    document.querySelectorAll(".theme-btn").forEach(btn => {
        btn.onclick = () => {
            const t = btn.getAttribute("data-set-theme");
            document.documentElement.setAttribute("data-theme", t);
            appState.theme = t;
            saveState();
        };
    });
}

function setupInterSyncEngine() {
    const btnExport = document.getElementById("btn-export-data");
    const btnTriggerImport = document.getElementById("btn-trigger-import");
    const fileInp = document.getElementById("import-file-input");

    if (btnExport) {
        btnExport.onclick = () => {
            const payload = { version: "AspirantsToCA-V3-NoAuth", state: appState };
            const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `ATC_Profile_SyncPack.json`;
            a.click();
            URL.revokeObjectURL(url);
        };
    }

    if (btnTriggerImport && fileInp) {
        btnTriggerImport.onclick = () => fileInp.click();
        fileInp.onchange = (e) => {
            const file = e.target.files[0];
            if(!file) return;
            const reader = new FileReader();
            reader.onload = (evt) => {
                try {
                    const imported = JSON.parse(evt.target.result);
                    if(!imported.state) { alert("Error: Invalid Sync Format."); return; }
                    if(confirm("Overwrite current data layout?")) {
                        appState = imported.state;
                        saveState();
                        window.location.reload();
                    }
                } catch(err) {
                    alert("Corrupted data file.");
                }
            };
            reader.readAsText(file);
        };
    }
}

function setupConfigHandler() {
    const targetInp = document.getElementById("config-target-date");
    const daysInp = document.getElementById("config-challenge-days");
    const saveBtn = document.getElementById("save-config-btn");

    if (targetInp) targetInp.value = appState.targetDate || "2026-09-01";
    if (daysInp) daysInp.value = appState.challengeDays || 50;

    if (saveBtn) {
        saveBtn.onclick = () => {
            appState.targetDate = targetInp.value;
            appState.challengeDays = parseInt(daysInp.value) || 50;
            saveState();
            renderRoadmap();
            alert("Configuration committed successfully!");
        };
    }
}

function startClocksAndCountdowns() {
    setInterval(() => {
        const clockEl = document.getElementById("live-clock");
        const dateEl = document.getElementById("current-date");
        const countdownEl = document.getElementById("exam-countdown");
        const now = new Date();

        if (clockEl) clockEl.innerText = now.toLocaleTimeString();
        if (dateEl) dateEl.innerText = now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        
        if (countdownEl) {
            const target = appState.targetDate ? new Date(appState.targetDate + "T00:00:00") : new Date("2026-09-01T00:00:00");
            const diff = target.getTime() - now.getTime();
            if(diff > 0) {
                countdownEl.innerText = `${Math.floor(diff / (1000 * 60 * 60 * 24))} Days Left`;
            } else {
                countdownEl.innerText = "Target Arrived!";
            }
        }
    }, 1000);
}

function selectQuote() {
    const quoteEl = document.getElementById("motivational-quote");
    if (quoteEl) quoteEl.innerText = shivamQuotes[Math.floor(Math.random() * shivamQuotes.length)];
}

function renderRoutine() {
    const container = document.getElementById("routine-tasks-container");
    if (!container) return;
    container.innerHTML = "";
    
    if(!appState.customRoutine) appState.customRoutine = [];
    appState.customRoutine.forEach((item, idx) => {
        const checked = appState.routineChecked[idx] || false;
        const div = document.createElement("div");
        div.className = "routine-item glass";
        div.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px; flex:1;">
                <input type="checkbox" id="routine-chk-${idx}" ${checked ? 'checked' : ''}>
                <div><strong>${item.time}</strong><p style="font-size:0.85rem; color:var(--text-muted);">${item.task}</p></div>
            </div>
            <button class="btn btn-danger" style="padding:4px 8px; font-size:0.75rem;">Delete</button>
        `;
        
        div.querySelector("input").onchange = (e) => {
            appState.routineChecked[idx] = e.target.checked;
            appState.xp += e.target.checked ? 10 : -10;
            saveState();
        };

        div.querySelector("button").onclick = () => {
            appState.customRoutine.splice(idx, 1);
            delete appState.routineChecked[idx];
            saveState();
            renderRoutine();
        };
        container.appendChild(div);
    });
}

const addRoutineBtn = document.getElementById("add-routine-block-btn");
if (addRoutineBtn) {
    addRoutineBtn.onclick = () => {
        const time = document.getElementById("routine-time-input").value.trim();
        const task = document.getElementById("routine-task-input").value.trim();
        if(!time || !task) return;
        appState.customRoutine.push({ time, task });
        document.getElementById("routine-time-input").value = "";
        document.getElementById("routine-task-input").value = "";
        saveState();
        renderRoutine();
    };
}

function renderSyllabus() {
    const container = document.getElementById("subjects-container");
    if (!container) return;
    container.innerHTML = "";

    if(!appState.subjects) appState.subjects = [];
    appState.subjects.forEach((sub, sIdx) => {
        const div = document.createElement("div");
        div.className = "subject-block-card glass card-padding";
        
        let chapHtml = "";
        sub.chapters.forEach((chap) => {
            const key = `${sIdx}_${chap}`;
            const isDone = appState.chaptersChecked[key] || false;
            chapHtml += `
                <div class="chapter-flex-row">
                    <span>${chap}</span>
                    <input type="checkbox" data-ckey="${key}" ${isDone ? 'checked' : ''}>
                </div>
            `;
        });

        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <h3>${sub.name}</h3>
                <button class="btn btn-danger btn-sm del-sub-btn" style="padding:2px 6px; font-size:0.7rem;">Remove</button>
            </div>
            <div class="todo-form margin-bottom">
                <input type="text" placeholder="Add Chapter..." class="new-chap-input">
                <button class="btn btn-primary add-chap-btn">+</button>
            </div>
            <div class="chapters-area">${chapHtml}</div>
        `;

        div.querySelectorAll("input[type='checkbox']").forEach(box => {
            box.onchange = (e) => {
                const k = e.target.getAttribute("data-ckey");
                appState.chaptersChecked[k] = e.target.checked;
                appState.xp += e.target.checked ? 15 : -15;
                saveState();
                renderSyllabus();
            };
        });

        div.querySelector(".add-chap-btn").onclick = () => {
            const inp = div.querySelector(".new-chap-input").value.trim();
            if(!inp) return;
            sub.chapters.push(inp);
            saveState();
            renderSyllabus();
        };

        div.querySelector(".del-sub-btn").onclick = () => {
            appState.subjects.splice(sIdx, 1);
            saveState();
            renderSyllabus();
        };
        container.appendChild(div);
    });
}

const createSubjectBtn = document.getElementById("create-subject-btn");
if (createSubjectBtn) {
    createSubjectBtn.onclick = () => {
        const title = document.getElementById("new-subject-name").value.trim();
        if(!title) return;
        appState.subjects.push({ name: title, chapters: [] });
        document.getElementById("new-subject-name").value = "";
        saveState();
        renderSyllabus();
    };
}

let pomoInterval = null, pomoTimeLeft = 50 * 60;
function setupPomodoro() {
    const display = document.getElementById("timer-display");
    const pStart = document.getElementById("pomo-start");
    const pPause = document.getElementById("pomo-pause");
    const pReset = document.getElementById("pomo-reset");

    if (pStart) {
        pStart.onclick = () => {
            if (pomoInterval) return;
            pomoInterval = setInterval(() => {
                if (pomoTimeLeft > 0) { 
                    pomoTimeLeft--; 
                    if (display) display.innerText = `${Math.floor(pomoTimeLeft/60).toString().padStart(2,'0')}:${(pomoTimeLeft%60).toString().padStart(2,'0')}`; 
                }
                else { clearInterval(pomoInterval); pomoInterval = null; alert("Focus Block Complete!"); }
            }, 1000);
        };
    }
    if (pPause) { pPause.onclick = () => { clearInterval(pomoInterval); pomoInterval = null; }; }
    if (pReset) { pReset.onclick = () => { clearInterval(pomoInterval); pomoInterval = null; pomoTimeLeft = 50*60; if (display) display.innerText = "50:00"; }; }
}

let swInterval = null, swSeconds = 0;
function setupStopwatchAndTodo() {
    const swDisplay = document.getElementById("stopwatch-display");
    const swStart = document.getElementById("sw-start");
    const swPause = document.getElementById("sw-pause");
    const swLog = document.getElementById("sw-log");

    if (swStart) {
        swStart.onclick = () => {
            if(swInterval) return;
            swInterval = setInterval(() => {
                swSeconds++;
                if (swDisplay) {
                    const h = Math.floor(swSeconds/3600).toString().padStart(2,'0');
                    const m = Math.floor((swSeconds%3600)/60).toString().padStart(2,'0');
                    const s = (swSeconds%60).toString().padStart(2,'0');
                    swDisplay.innerText = `${h}:${m}:${s}`;
                }
            }, 1000);
        };
    }
    if (swPause) { swPause.onclick = () => { clearInterval(swInterval); swInterval = null; }; }
    if (swLog) {
        swLog.onclick = () => {
            clearInterval(swInterval); swInterval = null;
            const h = swSeconds / 3600;
            if(h > 0) { 
                appState.hoursLogged.today += h; 
                appState.hoursLogged.total += h; 
                appState.xp += Math.round(h * 20); 
                saveState(); 
            }
            swSeconds = 0; if (swDisplay) swDisplay.innerText = "00:00:00";
        };
    }

    const todoInput = document.getElementById("todo-input"), list = document.getElementById("todo-list-items");
    function renderTodos() {
        if (!list) return;
        list.innerHTML = "";
        if(!appState.todo) appState.todo = [];
        appState.todo.forEach((item, idx) => {
            const li = document.createElement("li"); li.className = "todo-item";
            li.innerHTML = `<span>[${item.priority}] ${item.text}</span><button class="btn btn-danger" style="padding:2px 6px; font-size:0.75rem;">X</button>`;
            li.querySelector("button").onclick = () => { appState.todo.splice(idx, 1); saveState(); renderTodos(); };
            list.appendChild(li);
        });
    }
    const addTodoBtn = document.getElementById("add-todo-btn");
    if (addTodoBtn) {
        addTodoBtn.onclick = () => {
            if(!todoInput.value.trim()) return;
            appState.todo.push({ text: todoInput.value.trim(), priority: document.getElementById("todo-priority").value });
            todoInput.value = ""; saveState(); renderTodos();
        };
    }
    renderTodos();
}

function renderRoadmap() {
    const container = document.getElementById("roadmap-grid-container"); 
    if (!container) return;
    container.innerHTML = "";
    let completed = 0;
    const totalDays = appState.challengeDays || 50;

    for (let i = 0; i < totalDays; i++) {
        const block = document.createElement("div"), done = appState.roadmapChecked[i] || false;
        if (done) completed++;
        block.className = `day-block ${done ? 'checked' : ''}`; block.innerText = i + 1;
        block.onclick = () => {
            appState.roadmapChecked[i] = !appState.roadmapChecked[i];
            appState.xp += appState.roadmapChecked[i] ? 40 : -40;
            saveState();
            renderRoadmap();
        };
        container.appendChild(block);
    }
    const rmStats = document.getElementById("roadmap-stats");
    if (rmStats) rmStats.innerText = `${completed}/${totalDays} Days`;
}

function setupDiary() {
    const input = document.getElementById("diary-input"), container = document.getElementById("diary-notes-container");
    function renderNotes() {
        if (!container) return;
        container.innerHTML = "";
        if(!appState.diary) appState.diary = [];
        appState.diary.forEach((note, idx) => {
            const div = document.createElement("div"); div.className = "glass card-padding"; div.style.fontSize="0.85rem";
            div.innerHTML = `<p>${note}</p><button class="btn btn-danger btn-sm" style="padding:2px 6px; font-size:0.7rem; margin-top:4px;">Delete</button>`;
            div.querySelector("button").onclick = () => { appState.diary.splice(idx, 1); saveState(); renderNotes(); };
            container.appendChild(div);
        });
    }
    const saveDiaryBtn = document.getElementById("save-diary-btn");
    if (saveDiaryBtn) {
        saveDiaryBtn.onclick = () => {
            if(!input.value.trim()) return;
            appState.diary.push(input.value.trim()); input.value = ""; saveState(); renderNotes();
        };
    }
    renderNotes();
}

function calculateTelemetry() {
    const rKeys = appState.customRoutine.length, rDone = Object.keys(appState.routineChecked).filter(k => appState.routineChecked[k] === true).length;
    const rPct = rKeys ? Math.round((rDone / rKeys) * 100) : 0;
    
    if (document.getElementById("routine-progress")) document.getElementById("routine-progress").innerText = `${rPct}%`;
    if (document.getElementById("dash-routine-pct")) document.getElementById("dash-routine-pct").innerText = `${rPct}%`;

    let totalChaps = 0, chapsDone = 0;
    appState.subjects.forEach((s, sIdx) => {
        (s.chapters || []).forEach(chap => {
            totalChaps++;
            if(appState.chaptersChecked[`${sIdx}_${chap}`] === true) chapsDone++;
        });
    });
    const sPct = totalChaps ? Math.round((chapsDone / totalChaps) * 100) : 0;
    
    if (document.getElementById("syllabus-global-progress")) document.getElementById("syllabus-global-progress").innerText = `${sPct}%`;
    if (document.getElementById("dash-syllabus-pct")) document.getElementById("dash-syllabus-pct").innerText = `${sPct}%`;

    const daysDone = Object.keys(appState.roadmapChecked).filter(k => appState.roadmapChecked[k] === true).length;
    const roadPct = appState.challengeDays ? Math.round((daysDone / appState.challengeDays) * 100) : 0;
    if (document.getElementById("dash-roadmap-pct")) document.getElementById("dash-roadmap-pct").innerText = `${roadPct}%`;

    if (document.getElementById("chart-routine")) document.getElementById("chart-routine").style.width = `${rPct}%`;
    if (document.getElementById("chart-roadmap")) document.getElementById("chart-roadmap").style.width = `${roadPct}%`;

    if (document.getElementById("hours-today")) document.getElementById("hours-today").innerText = (appState.hoursLogged.today || 0).toFixed(1);
    if (document.getElementById("hours-total-metric")) document.getElementById("hours-total-metric").innerText = (appState.hoursLogged.total || 0).toFixed(1);

    const lvl = Math.max(1, Math.floor((appState.xp || 0) / 100) + 1);
    if (document.getElementById("rpg-level-title")) document.getElementById("rpg-level-title").innerText = `Level ${lvl} Tracker Rank`;
    if (document.getElementById("rpg-xp-fill")) document.getElementById("rpg-xp-fill").style.width = `${Math.max(0, (appState.xp || 0) % 100)}%`;
    if (document.getElementById("current-streak")) document.getElementById("current-strea
