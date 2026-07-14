let currentUser = null;
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
    initAuthEngine();
});

function initAuthEngine() {
    const errorMsg = document.getElementById("auth-error");
    if (!errorMsg) return;

    const goSignup = document.getElementById("go-to-signup");
    const goLogin = document.getElementById("go-to-login");
    const btnSignup = document.getElementById("btn-signup");
    const btnLogin = document.getElementById("btn-login");
    const btnLogout = document.getElementById("btn-logout");

    if (goSignup) {
        goSignup.onclick = () => {
            document.getElementById("login-form-zone").style.display = "none";
            document.getElementById("signup-form-zone").style.display = "block";
            errorMsg.innerText = "";
        };
    }

    if (goLogin) {
        goLogin.onclick = () => {
            document.getElementById("signup-form-zone").style.display = "none";
            document.getElementById("login-form-zone").style.display = "block";
            errorMsg.innerText = "";
        };
    }

    if (btnSignup) {
        btnSignup.onclick = () => {
            const u = document.getElementById("signup-username").value.trim().toLowerCase();
            const p = document.getElementById("signup-password").value.trim();
            if(!u || !p) { errorMsg.innerText = "All fields required."; return; }
            
            let users = JSON.parse(localStorage.getItem("ca_users_db") || "{}");
            if(users[u]) { errorMsg.innerText = "ID already taken."; return; }

            users[u] = btoa(p);
            localStorage.setItem("ca_users_db", JSON.stringify(users));
            localStorage.setItem(`ca_state_v2_${u}`, JSON.stringify(createDefaultState()));
            
            errorMsg.style.color = "var(--accent-green)";
            errorMsg.innerText = "Registered! Redirecting...";
            setTimeout(() => { 
                const loginLink = document.getElementById("go-to-login");
                if (loginLink) loginLink.click(); 
                errorMsg.style.color="var(--danger)"; 
            }, 1000);
        };
    }

    if (btnLogin) {
        btnLogin.onclick = () => {
            const u = document.getElementById("login-username").value.trim().toLowerCase();
            const p = document.getElementById("login-password").value.trim();

            if(!u || !p) { errorMsg.innerText = "Credentials required."; return; }

            let users = JSON.parse(localStorage.getItem("ca_users_db") || "{}");
            if(!users[u] || users[u] !== btoa(p)) { errorMsg.innerText = "Invalid Credentials."; return; }
            executeLogin(u);
        };
    }

    const session = localStorage.getItem("ca_active_user");
    if(session) {
        let users = JSON.parse(localStorage.getItem("ca_users_db") || "{}");
        if(users[session]) executeLogin(session);
        else localStorage.removeItem("ca_active_user");
    }

    if (btnLogout) {
        btnLogout.onclick = () => {
            localStorage.removeItem("ca_active_user");
            window.location.reload();
        };
    }
}

function executeLogin(username) {
    currentUser = username;
    localStorage.setItem("ca_active_user", username);
    document.getElementById("auth-overlay").style.display = "none";
    document.getElementById("app-main-content").style.display = "block";
    loadState();
    initCoreApp();
}

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
        appState = JSON.parse(localStorage.getItem(`ca_state_v2_${currentUser}`)) || createDefaultState();
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
    document.getElementById("user-display-name").innerText = currentUser.toUpperCase();
}

function saveState() {
    localStorage.setItem(`ca_state_v2_${currentUser}`, JSON.stringify(appState));
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
            const payload = {
                version: "AspirantsToCA-V3",
                username: currentUser,
                secretHash: localStorage.getItem("ca_users_db") ? JSON.parse(localStorage.getItem("ca_users_db"))[currentUser] : "",
                state: appState
            };
            const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `ATC_${currentUser}_SyncPack.json`;
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
                    if(imported.version !== "AspirantsToCA-V3" || !imported.state) {
                        alert("Error: Invalid Sync Data Pack Format.");
                        return;
                    }
                    
                    if(confirm("Overwrite your active profile data?")) {
                        if(imported.secretHash) {
                            let localUsers = JSON.parse(localStorage.getItem("ca_users_db") || "{}");
                            localUsers[currentUser] = imported.secretHash;
                            localStorage.setItem("ca_users_db", JSON.stringify(localUsers));
                        }
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
            alert("Configuration saved successfully!");
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

        if(!appState.customRoutine) appState.customRoutine = [];
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
            <div style="display:flex; justify-content:between; align-items:center; margin-bottom:10px;">
                <h3>${sub.name}</h3>
                <button class="btn btn-danger btn-sm del-sub-btn" style="padding:2px 6px; font-size:0.7rem;">Remove Subject</button>
            </div>
            <div class="todo-form margin-bottom">
                <input type="text" placeholder="Add Chapter to ${sub.name}" class="new-chap-input">
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
        if(!appState.subjects) appState.subjects = [];
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
            if (pInterval) return;
            pomoInterval = setInterval(() => {
                if (pomoTimeLeft > 0) { 
                    pomoTimeLeft--; 
                    if (display) display.innerText = `${Math.floor(pomoTimeLeft/60).toString().padStart(2,'0')}:${(pomoTimeLeft%60).toString().padStart(2,'0')}`; 
                }
                else { clearInterval(pomoInterval); pomoInterval = null; alert("Session Finished!"); }
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
            if(!appState.todo) appState.todo = [];
            appState.todo.push({ text: todoInput.value.trim(), priority: document.getElementById("todo-priority").value });
            todoInput.value = ""; saveState(); renderTodos();
        };
    }
    renderTodos();
}

function renderRoadmap() {
    const container = document.getElementById("roadmap-grid-container"); 
    if (!container) return;
