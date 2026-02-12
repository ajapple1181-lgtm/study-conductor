const LS_KEY = "conductor.v3";

const COLORS = {
  "国語系": css("--pink"),
  "数学系": css("--blue"),
  "英語系": css("--purple"),
  "理科系": css("--green"),
  "社会系": css("--yellow"),
  "その他": css("--gray"),
};

const SUBJECTS_BY_CATEGORY = {
  "国語系": ["論国", "古典"],
  "数学系": ["数学Ⅲ", "数学C"],
  "英語系": ["英C", "論表"],
  "理科系": ["化学", "生物"],
  "社会系": ["地理", "公共"],
  "その他": ["（入力）"],
};

const TASK_OPTIONS_BY_SUBJECT = {
  "論国": ["教科書", "漢字", "現代文課題"],
  "古典": ["教科書", "古文単語", "古文課題", "漢文課題"],
  "数学Ⅲ": ["予習", "復習", "4STEP", "課題"],
  "数学C": ["予習", "復習", "4STEP", "課題"],
  "英C": ["予習", "復習", "CROWN", "Cutting Edge", "LEAP", "課題"],
  "論表": ["予習", "復習", "Write to the point", "Scramble"],
  "化学": ["予習", "復習", "セミナー"],
  "生物": ["予習", "復習", "セミナー"],
  "地理": ["教科書"],
  "公共": ["教科書"],
};

const ALL_TASK_OPTIONS = uniq([
  ...Object.values(TASK_OPTIONS_BY_SUBJECT).flat(),
  "自由入力",
]);

let state = loadState();
let tickHandle = null;

/* DOM */
const $ = (q) => document.querySelector(q);

const clockText = $("#clockText");
const navBtns = Array.from(document.querySelectorAll(".nav__btn"));
const screens = {
  study: $("#screenStudy"),
  life: $("#screenLife"),
  run: $("#screenRun"),
};

/* Study form */
const studyForm = $("#studyForm");
const studyCategory = $("#studyCategory");
const studySubject = $("#studySubject");
const studyOtherSubjectWrap = $("#studyOtherSubjectWrap");
const studyOtherSubject = $("#studyOtherSubject");

const studyTaskType = $("#studyTaskType");
const studyTaskFreeWrap = $("#studyTaskFreeWrap");
const studyTaskFree = $("#studyTaskFree");

const studyDurationWrap = $("#studyDurationWrap");
const studyUntilWrap = $("#studyUntilWrap");
const studyDurationMin = $("#studyDurationMin");
const studyUntilTime = $("#studyUntilTime");

const studyRangesList = $("#studyRangesList");
const btnAddRangeStudy = $("#btnAddRangeStudy");

/* Life form */
const lifeForm = $("#lifeForm");
const lifeTask = $("#lifeTask");
const lifeDurationWrap = $("#lifeDurationWrap");
const lifeUntilWrap = $("#lifeUntilWrap");
const lifeDurationMin = $("#lifeDurationMin");
const lifeUntilTime = $("#lifeUntilTime");

/* Lists */
const studyQueueEl = $("#studyQueue");
const lifeQueueEl = $("#lifeQueue");
const studyDoneEl = $("#studyDone");
const lifeDoneEl = $("#lifeDone");

/* Tools */
const btnStudyClearDone = $("#btnStudyClearDone");
const btnLifeClearDone = $("#btnLifeClearDone");
const btnResetAll = $("#btnResetAll");
const btnResetAll2 = $("#btnResetAll2");

/* Run */
const pickStudy = $("#pickStudy");
const pickLife = $("#pickLife");
const driverBox = $("#driverBox");
const nowSubject = $("#nowSubject");
const nowTitle = $("#nowTitle");
const nowSub = $("#nowSub");
const nowRangesWrap = $("#nowRangesWrap");
const nowRanges = $("#nowRanges");
const timerText = $("#timerText");
const timerMeta = $("#timerMeta");
const btnStartPause = $("#btnStartPause");
const btnArrive = $("#btnArrive");
const btnSkip = $("#btnSkip");
const nextPreview = $("#nextPreview");
const btnRunResetTimer = $("#btnRunResetTimer");

/* Modal */
const modal = $("#modal");
const modalTitle = $("#modalTitle");
const modalText = $("#modalText");
const modalCancel = $("#modalCancel");
const modalOk = $("#modalOk");

/* init */
initCategorySelect();
syncStudySubjectSelect();
syncStudyTaskSelect();
syncTimeModeUI("study");
syncTimeModeUI("life");

ensureAtLeastOneRangeRow(studyRangesList);
renderAll();
startClock();
startTick();

/* navigation */
navBtns.forEach((b) => {
  b.addEventListener("click", () => {
    setScreen(b.dataset.screen);
  });
});

/* study form events */
studyCategory.addEventListener("change", () => {
  syncStudySubjectSelect();
  syncStudyTaskSelect();
  renderAll();
});

studySubject.addEventListener("change", () => {
  syncStudyTaskSelect();
});

studyOtherSubject.addEventListener("input", () => {
  // その他でもタスク選択は可能なので、ここではUI更新のみ
  renderAll();
});

studyTaskType.addEventListener("change", () => {
  const v = studyTaskType.value;
  studyTaskFreeWrap.hidden = (v !== "自由入力");
});

document.querySelectorAll('input[name="studyTimeMode"]').forEach((r) => {
  r.addEventListener("change", () => syncTimeModeUI("study"));
});

btnAddRangeStudy.addEventListener("click", () => addRangeRow(studyRangesList));

studyForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addStudyTask();
});

/* life form events */
document.querySelectorAll('input[name="lifeTimeMode"]').forEach((r) => {
  r.addEventListener("change", () => syncTimeModeUI("life"));
});

lifeForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addLifeTask();
});

/* clear & reset */
btnStudyClearDone.addEventListener("click", () => confirmModal(
  "確認",
  "勉強の完了ログを消しますか？",
  "消去",
  () => { state.study.done = []; saveState(); renderAll(); }
));

btnLifeClearDone.addEventListener("click", () => confirmModal(
  "確認",
  "生活の完了ログを消しますか？",
  "消去",
  () => { state.life.done = []; saveState(); renderAll(); }
));

btnResetAll.addEventListener("click", () => confirmModal(
  "最終確認",
  "全データを初期化しますか？",
  "初期化",
  () => resetAll()
));

btnResetAll2.addEventListener("click", () => confirmModal(
  "最終確認",
  "全データを初期化しますか？",
  "初期化",
  () => resetAll()
));

/* run line pick */
pickStudy.addEventListener("click", () => setRunLine("study"));
pickLife.addEventListener("click", () => setRunLine("life"));

/* run controls */
btnStartPause.addEventListener("click", () => toggleStartPause());
btnArrive.addEventListener("click", () => {
  const cur = getRunCurrentTask();
  if (!cur) return;
  confirmModal("到着確認", `「${taskShort(cur)}」を完了にしますか？`, "到着", () => completeRunTask());
});
btnSkip.addEventListener("click", () => {
  const cur = getRunCurrentTask();
  if (!cur) return;
  confirmModal("確認", `「${taskShort(cur)}」を次へ送りますか？`, "次へ", () => skipRunTask());
});

btnRunResetTimer.addEventListener("click", () => {
  confirmModal("確認", "タイマーをリセットしますか？（タスクは消えません）", "リセット", () => {
    stopRunTimer();
    saveState();
    renderAll();
  });
});

/* modal */
modalCancel.addEventListener("click", closeModal);
modalOk.addEventListener("click", () => {
  if (modalOk._onOk) modalOk._onOk();
  closeModal();
});

/* =========================
   State
========================= */
function defaultState(){
  return {
    ui: { screen: "study" },
    study: { queue: [], done: [] },
    life:  { queue: [], done: [] },
    run: {
      line: "study",        // 実行対象：study/life
      isRunning: false,
      endAt: null,          // running時のみ
      remainingMs: null,    // pause時に固定
      notifiedZero: false,
    }
  };
}

function loadState(){
  try{
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return defaultState();
    const p = JSON.parse(raw);
    return {
      ...defaultState(),
      ...p,
      ui: { ...defaultState().ui, ...(p.ui||{}) },
      study: { ...defaultState().study, ...(p.study||{}) },
      life:  { ...defaultState().life,  ...(p.life||{}) },
      run:   { ...defaultState().run,   ...(p.run||{}) },
    };
  }catch{
    return defaultState();
  }
}

function saveState(){
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}

function resetAll(){
  state = defaultState();
  saveState();
  renderAll();
}

/* =========================
   UI: screen
========================= */
function setScreen(screen){
  state.ui.screen = screen;
  saveState();

  navBtns.forEach(b => b.classList.toggle("is-active", b.dataset.screen === screen));
  Object.entries(screens).forEach(([k, el]) => el.classList.toggle("is-active", k === screen));

  renderAll();
}

/* =========================
   Study selects
========================= */
function initCategorySelect(){
  studyCategory.innerHTML = "";
  Object.keys(SUBJECTS_BY_CATEGORY).forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    studyCategory.appendChild(opt);
  });
  // 初期は数学系（好みなら変えてOK）
  studyCategory.value = "数学系";
}

function syncStudySubjectSelect(){
  const cat = studyCategory.value;
  const subs = SUBJECTS_BY_CATEGORY[cat] || [];

  studySubject.innerHTML = "";
  subs.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s;
    studySubject.appendChild(opt);
  });

  // 「系→科目」の順を強制：系が決まれば科目は有効化
  studySubject.disabled = false;

  // その他系なら入力欄表示
  const isOther = (cat === "その他");
  studyOtherSubjectWrap.hidden = !isOther;

  // その他系は科目が（入力）固定でもOK
  if (isOther) {
    studySubject.value = "（入力）";
  }
}

function resolveStudySubject(){
  const cat = studyCategory.value;
  if (cat !== "その他") return studySubject.value;

  const v = (studyOtherSubject.value || "").trim();
  return v ? v : "その他";
}

function syncStudyTaskSelect(){
  const subject = resolveStudySubject();
  const cat = studyCategory.value;

  // 科目が未確定（その他系で未入力でも一応選べるように）
  // → subjectが"その他"でもOK

  // タスク内容候補
  let opts = TASK_OPTIONS_BY_SUBJECT[subject];
  if (!opts) {
    // その他：上の選択肢全部＋自由入力
    opts = ALL_TASK_OPTIONS.slice();
    // 教科書が先頭に来るように整形
    opts = uniq(["教科書", ...opts.filter(x => x !== "教科書")]);
  }

  studyTaskType.innerHTML = "";
  opts.forEach(o => {
    const opt = document.createElement("option");
    opt.value = o;
    opt.textContent = o;
    studyTaskType.appendChild(opt);
  });

  // 科目→タスク内容 の順：科目が選ばれていれば有効化
  studyTaskType.disabled = false;

  // 自由入力表示
  studyTaskFreeWrap.hidden = (studyTaskType.value !== "自由入力");
}

/* =========================
   Time mode UI
========================= */
function syncTimeModeUI(kind){
  if (kind === "study"){
    const mode = radioValue("studyTimeMode");
    studyDurationWrap.hidden = (mode !== "duration");
    studyUntilWrap.hidden = (mode !== "until");

    // required切替
    studyDurationMin.required = (mode === "duration");
    studyUntilTime.required = (mode === "until");
  } else {
    const mode = radioValue("lifeTimeMode");
    lifeDurationWrap.hidden = (mode !== "duration");
    lifeUntilWrap.hidden = (mode !== "until");

    lifeDurationMin.required = (mode === "duration");
    lifeUntilTime.required = (mode === "until");
  }
}

/* =========================
   Ranges (start/end only)
========================= */
function ensureAtLeastOneRangeRow(container){
  if (container.querySelectorAll(".rangeRow").length === 0){
    addRangeRow(container);
  }
}

function addRangeRow(container, prefill){
  const row = document.createElement("div");
  row.className = "rangeRow";
  row.innerHTML = `
    <input class="rangeStart" type="text" placeholder="開始（例：12 / 3）" />
    <input class="rangeEnd" type="text" placeholder="終了（例：18 / 10）" />
    <button type="button" class="rangeDel">×</button>
  `;
  const del = row.querySelector(".rangeDel");
  del.addEventListener("click", () => {
    row.remove();
    ensureAtLeastOneRangeRow(container);
  });

  if (prefill){
    row.querySelector(".rangeStart").value = prefill.start || "";
    row.querySelector(".rangeEnd").value = prefill.end || "";
  }

  container.appendChild(row);
}

function readRanges(container){
  const rows = Array.from(container.querySelectorAll(".rangeRow"));
  const ranges = rows.map(r => ({
    start: (r.querySelector(".rangeStart").value || "").trim(),
    end: (r.querySelector(".rangeEnd").value || "").trim(),
  })).filter(x => x.start || x.end);

  return ranges;
}

/* =========================
   Add tasks
========================= */
function addStudyTask(){
  const cat = studyCategory.value;
  const subject = resolveStudySubject();
  const taskType = studyTaskType.value;
  const free = (studyTaskFree.value || "").trim();
  const finalTaskType = (taskType === "自由入力") ? (free || "自由入力") : taskType;

  const mode = radioValue("studyTimeMode");
  if (!mode) {
    alert("時間か時刻を選んでください");
    return;
  }

  const timeSpec = readTimeSpec(mode, studyDurationMin.value, studyUntilTime.value);
  const ranges = readRanges(studyRangesList);

  const t = {
    id: uid(),
    kind: "study",
    category: cat,
    subject,
    color: COLORS[cat] || COLORS["その他"],
    taskType: finalTaskType,
    ranges,
    timeSpec,
    createdAt: Date.now(),
  };

  state.study.queue.push(t);

  // 入力の軽い初期化
  studyTaskFree.value = "";
  studyTaskFreeWrap.hidden = true;

  // 範囲は1行残す（リセット）
  studyRangesList.innerHTML = "";
  addRangeRow(studyRangesList);

  saveState();
  renderAll();
}

function addLifeTask(){
  const task = (lifeTask.value || "").trim();
  const mode = radioValue("lifeTimeMode");
  if (!mode) {
    alert("時間か時刻を選んでください");
    return;
  }

  const timeSpec = readTimeSpec(mode, lifeDurationMin.value, lifeUntilTime.value);

  const t = {
    id: uid(),
    kind: "life",
    category: "その他",
    subject: "生活",
    color: COLORS["その他"],
    task: task,
    ranges: [],
    timeSpec,
    createdAt: Date.now(),
  };

  state.life.queue.push(t);
  lifeTask.value = "";

  saveState();
  renderAll();
}

function readTimeSpec(mode, durationMinRaw, untilHHMM){
  if (mode === "duration"){
    const d = Math.max(1, parseInt(durationMinRaw || "1", 10));
    return { mode, durationMin: d };
  }
  return { mode, untilHHMM: (untilHHMM || "").trim() };
}

/* =========================
   Render
========================= */
function renderAll(){
  // screen
  setScreenInternal(state.ui.screen);

  renderQueues();
  renderDone();

  // run UI
  renderRunLinePick();
  renderDriver();
}

function setScreenInternal(screen){
  navBtns.forEach(b => b.classList.toggle("is-active", b.dataset.screen === screen));
  Object.entries(screens).forEach(([k, el]) => el.classList.toggle("is-active", k === screen));
}

function renderQueues(){
  renderQueueList(studyQueueEl, state.study.queue, "study");
  renderQueueList(lifeQueueEl, state.life.queue, "life");
}

function renderQueueList(el, queue, line){
  el.innerHTML = "";
  if (queue.length === 0){
    el.appendChild(emptyLi("（空です）"));
    return;
  }

  queue.forEach((t, idx) => {
    const li = document.createElement("li");
    li.className = "item";
    li.style.borderLeftColor = (t.color || css("--gray"));

    const main = document.createElement("div");
    main.className = "item__main";

    const title = document.createElement("div");
    title.className = "item__title";
    title.textContent = (line === "study")
      ? `${t.subject}｜${t.taskType}`
      : `生活｜${t.task}`;

    const meta = document.createElement("div");
    meta.className = "item__meta";
    meta.textContent = timeSpecText(t.timeSpec);

    main.appendChild(title);
    main.appendChild(meta);

    const btns = document.createElement("div");
    btns.className = "item__btns";
    btns.appendChild(miniBtn("↑", () => moveTask(line, t.id, -1)));
    btns.appendChild(miniBtn("↓", () => moveTask(line, t.id, +1)));
    btns.appendChild(miniBtn("削", () => deleteTask(line, t.id)));

    li.appendChild(main);
    li.appendChild(btns);
    el.appendChild(li);
  });
}

function renderDone(){
  renderDoneList(studyDoneEl, state.study.done, "study");
  renderDoneList(lifeDoneEl, state.life.done, "life");
}

function renderDoneList(el, done, line){
  el.innerHTML = "";
  if (done.length === 0){
    el.appendChild(emptyLi("（まだありません）"));
    return;
  }

  done.slice(0, 30).forEach(t => {
    const li = document.createElement("li");
    li.className = "item";
    li.style.borderLeftColor = (t.color || css("--gray"));

    const main = document.createElement("div");
    main.className = "item__main";

    const title = document.createElement("div");
    title.className = "item__title";
    const txt = (line === "study")
      ? `${fmtHHMM(new Date(t.completedAt))}  ${t.subject}｜${t.taskType}`
      : `${fmtHHMM(new Date(t.completedAt))}  生活｜${t.task}`;
    title.textContent = txt;

    main.appendChild(title);
    li.appendChild(main);
    el.appendChild(li);
  });
}

/* =========================
   Queue operations
========================= */
function getLineState(line){
  return (line === "study") ? state.study : state.life;
}

function deleteTask(line, id){
  const ls = getLineState(line);
  ls.queue = ls.queue.filter(t => t.id !== id);

  // 実行中のタスクを消した場合は安全に停止
  if (state.run.line === line) {
    stopRunTimer();
  }

  saveState();
  renderAll();
}

function moveTask(line, id, dir){
  const ls = getLineState(line);
  const i = ls.queue.findIndex(t => t.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= ls.queue.length) return;

  const tmp = ls.queue[i];
  ls.queue[i] = ls.queue[j];
  ls.queue[j] = tmp;

  // 並び替えたら実行タイマーは止める（ズレ防止）
  if (state.run.line === line) stopRunTimer();

  saveState();
  renderAll();
}

/* =========================
   Run logic (pause freezes)
========================= */
function setRunLine(line){
  if (state.run.line === line) return;
  state.run.line = line;

  // 切替は運転リセット
  stopRunTimer();

  saveState();
  renderAll();
}

function renderRunLinePick(){
  pickStudy.classList.toggle("is-active", state.run.line === "study");
  pickLife.classList.toggle("is-active", state.run.line === "life");
}

function getRunQueue(){
  return (state.run.line === "study") ? state.study.queue : state.life.queue;
}

function getRunDone(){
  return (state.run.line === "study") ? state.study.done : state.life.done;
}

function getRunCurrentTask(){
  const q = getRunQueue();
  if (q.length === 0) return null;
  return q[0]; // 常に先頭を運転
}

function toggleStartPause(){
  const cur = getRunCurrentTask();
  if (!cur) return;

  if (!state.run.isRunning) {
    // 発車 or 再発車
    if (state.run.remainingMs != null) {
      // 再発車
      state.run.endAt = Date.now() + state.run.remainingMs;
      state.run.remainingMs = null;
    } else {
      // 初回発車
      state.run.endAt = computeEndAt(cur);
    }
    state.run.isRunning = true;
    state.run.notifiedZero = false;
  } else {
    // 一時停止：残りを固定して endAt を捨てる
    const remain = Math.max(0, (state.run.endAt || Date.now()) - Date.now());
    state.run.remainingMs = remain;
    state.run.endAt = null;
    state.run.isRunning = false;
  }

  saveState();
  renderAll();
}

function stopRunTimer(){
  state.run.isRunning = false;
  state.run.endAt = null;
  state.run.remainingMs = null;
  state.run.notifiedZero = false;
}

function computeEndAt(task){
  const ts = task.timeSpec;
  const now = new Date();

  if (ts.mode === "duration"){
    return Date.now() + (ts.durationMin * 60 * 1000);
  }

  // until
  const hhmm = ts.untilHHMM;
  if (!hhmm){
    return Date.now() + 30*60*1000;
  }
  const [hh, mm] = hhmm.split(":").map(n => parseInt(n, 10));
  const end = new Date(now);
  end.setHours(hh, mm, 0, 0);
  if (end.getTime() <= now.getTime()){
    end.setDate(end.getDate() + 1);
  }
  return end.getTime();
}

function completeRunTask(){
  const cur = getRunCurrentTask();
  if (!cur) return;

  const ls = getLineState(state.run.line);
  ls.done.unshift({ ...cur, completedAt: Date.now() });
  ls.queue.shift(); // remove first

  stopRunTimer();
  saveState();
  renderAll();
}

function skipRunTask(){
  const ls = getLineState(state.run.line);
  if (ls.queue.length === 0) return;

  // 先頭を末尾へ
  const first = ls.queue.shift();
  ls.queue.push(first);

  stopRunTimer();
  saveState();
  renderAll();
}

function renderDriver(){
  const cur = getRunCurrentTask();
  const color = cur?.color || css("--gray");
  applyAccent(color);

  if (!cur){
    nowSubject.textContent = "—";
    nowTitle.textContent = "待機中";
    nowSub.textContent = "運行表にタスクを追加してください";
    nowRangesWrap.hidden = true;
    timerText.textContent = "--:--";
    timerMeta.textContent = "";
    nextPreview.textContent = "—";
    btnStartPause.textContent = "発車";
    return;
  }

  if (cur.kind === "study"){
    nowSubject.textContent = cur.subject;
    nowTitle.textContent = cur.taskType;
    nowSub.textContent = cur.category;
  } else {
    nowSubject.textContent = "生活";
    nowTitle.textContent = cur.task;
    nowSub.textContent = "生活";
  }

  // ranges
  if (cur.kind === "study" && cur.ranges && cur.ranges.length > 0){
    nowRangesWrap.hidden = false;
    nowRanges.innerHTML = "";
    cur.ranges.forEach(r => {
      const li = document.createElement("li");
      li.textContent = rangeText(r);
      nowRanges.appendChild(li);
    });
  } else {
    nowRangesWrap.hidden = true;
  }

  // next preview
  const q = getRunQueue();
  if (q.length >= 2){
    nextPreview.textContent = taskShort(q[1]);
  } else {
    nextPreview.textContent = "—";
  }

  // start/pause label
  btnStartPause.textContent = state.run.isRunning ? "一時停止" : "発車";

  updateTimerUI();
}

/* =========================
   Timer update
========================= */
function updateTimerUI(){
  const cur = getRunCurrentTask();
  if (!cur){
    timerText.textContent = "--:--";
    timerMeta.textContent = "";
    return;
  }

  // running
  if (state.run.isRunning && state.run.endAt){
    const remain = Math.max(0, state.run.endAt - Date.now());
    timerText.textContent = fmtMMSS(remain);
    timerMeta.textContent = `到着 ${fmtHHMM(new Date(state.run.endAt))}`;

    if (remain === 0 && !state.run.notifiedZero){
      state.run.notifiedZero = true;
      state.run.isRunning = false;
      state.run.endAt = null;
      state.run.remainingMs = 0;
      saveState();

      confirmModal(
        "到着",
        `「${taskShort(cur)}」の時間が終了しました。完了にしますか？`,
        "到着",
        () => completeRunTask()
      );
    }
    return;
  }

  // paused (freeze)
  if (!state.run.isRunning && state.run.remainingMs != null){
    timerText.textContent = fmtMMSS(state.run.remainingMs);
    timerMeta.textContent = "停止中";
    return;
  }

  // not started yet
  timerText.textContent = plannedTimeText(cur.timeSpec);
  timerMeta.textContent = "未発車";
}

/* =========================
   Tick/Clock
========================= */
function startTick(){
  if (tickHandle) clearInterval(tickHandle);
  tickHandle = setInterval(() => {
    // running中だけ残りを更新（停止中は固定表示）
    if (state.run.isRunning) {
      updateTimerUI();
    }
  }, 250);
}

function startClock(){
  const tick = () => {
    clockText.textContent = fmtHHMM(new Date());
  };
  tick();
  setInterval(tick, 1000);
}

/* =========================
   Modal helpers
========================= */
function confirmModal(title, text, okText, onOk){
  modalTitle.textContent = title;
  modalText.textContent = text;
  modalOk.textContent = okText || "OK";
  modalOk._onOk = onOk;
  modal.hidden = false;
}

function closeModal(){
  modal.hidden = true;
  modalOk._onOk = null;
}

/* =========================
   Text helpers
========================= */
function taskShort(t){
  if (t.kind === "study") return `${t.subject}｜${t.taskType}`;
  return `生活｜${t.task}`;
}

function rangeText(r){
  const a = r.start || "";
  const b = r.end || "";
  if (a && b) return `${a}–${b}`;
  if (a) return `${a}～`;
  if (b) return `～${b}`;
  return "（範囲）";
}

function timeSpecText(ts){
  if (ts.mode === "duration") return `所要 ${ts.durationMin}分`;
  return `～ ${ts.untilHHMM || "未設定"}`;
}

function plannedTimeText(ts){
  if (ts.mode === "duration") return `${ts.durationMin}分`;
  return `～${ts.untilHHMM || "--:--"}`;
}

function fmtMMSS(ms){
  const sec = Math.ceil(ms / 1000);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

function fmtHHMM(d){
  const hh = String(d.getHours()).padStart(2,"0");
  const mm = String(d.getMinutes()).padStart(2,"0");
  return `${hh}:${mm}`;
}

/* =========================
   Utils
========================= */
function uid(){
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function miniBtn(text, onClick){
  const b = document.createElement("button");
  b.type = "button";
  b.className = "btn btn--ghost btn--mini";
  b.textContent = text;
  b.addEventListener("click", onClick);
  return b;
}

function emptyLi(text){
  const li = document.createElement("li");
  li.className = "item";
  li.style.borderLeftColor = css("--gray");
  const main = document.createElement("div");
  main.className = "item__main";
  const title = document.createElement("div");
  title.className = "item__title";
  title.textContent = text;
  title.style.color = "rgba(255,255,255,.70)";
  main.appendChild(title);
  li.appendChild(main);
  return li;
}

function radioValue(name){
  const el = document.querySelector(`input[name="${name}"]:checked`);
  return el ? el.value : null;
}

function css(name){
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function applyAccent(color){
  document.documentElement.style.setProperty("--accent", color);
  // 薄い色は固定透明度のまま使う（見やすさ優先）
  document.documentElement.style.setProperty("--accentSoft", "rgba(255,255,255,.00)");
  // accentSoftはCSS側のradialで使うが、ここは最小限にする
  // ※簡易：背景は色味が変わるだけで十分
}

function uniq(arr){
  const s = new Set();
  const out = [];
  for (const x of arr){
    const k = String(x);
    if (!s.has(k)){
      s.add(k);
      out.push(x);
    }
  }
  return out;
}
