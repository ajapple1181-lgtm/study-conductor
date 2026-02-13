const LS_KEY = "conductor.v3"; // 既存データを残すため据え置き

const $ = (q) => document.querySelector(q);

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
  "その他": ["その他"], // ← 要望：その他を表示
};

const TASK_OPTIONS_BY_SUBJECT = {
  "論国": ["教科書", "漢字", "現代文課題"],
  "古典": ["教科書", "古文単語", "古文課題", "漢文課題"],
  "数学Ⅲ": ["予習", "復習", "4STEP", "課題"],
  "数学C": ["予習", "復習", "4STEP", "課題"],
  "英C": ["予習", "復習", "CROWN", "Cutting Edge", "LEAP", "課題"],
  "論表": ["予習", "復習", "Write to the point", "Scramble"],
  "化学": ["予習", "復習", "セミナー", "実験"], // ← 追加
  "生物": ["予習", "復習", "セミナー", "実験"], // ← 追加
  "地理": ["教科書"],
  "公共": ["教科書"],
};

const LIFE_OPTIONS = ["移動", "食事", "風呂", "準備", "就寝", "ラジオ", "テレビ", "爪切り", "散髪", "自由入力"];

const ALL_TASK_OPTIONS = uniq([
  ...Object.values(TASK_OPTIONS_BY_SUBJECT).flat(),
  "自由入力",
]);

let state = loadState();

/* =========================
   DOM
========================= */
const clockText = $("#clockText");
const navBtns = Array.from(document.querySelectorAll(".nav__btn"));
const screens = {
  study: $("#screenStudy"),
  life: $("#screenLife"),
  run: $("#screenRun"),
};

/* Study */
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
const studyFromTime = $("#studyFromTime");
const studyToTime = $("#studyToTime");

const studyRangesList = $("#studyRangesList");
const btnAddRangeStudy = $("#btnAddRangeStudy");

/* Life */
const lifeForm = $("#lifeForm");
const lifeTaskType = $("#lifeTaskType");
const lifeTaskFreeWrap = $("#lifeTaskFreeWrap");
const lifeTaskFree = $("#lifeTaskFree");

const lifeDurationWrap = $("#lifeDurationWrap");
const lifeUntilWrap = $("#lifeUntilWrap");
const lifeDurationMin = $("#lifeDurationMin");
const lifeFromTime = $("#lifeFromTime");
const lifeToTime = $("#lifeToTime");

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

/* =========================
   init
========================= */
initCategorySelect();
initLifeSelect();

syncStudySubjectSelect();
syncStudyTaskSelect();

syncTimeModeUI("study");
syncTimeModeUI("life");

ensureAtLeastOneRangeRow(studyRangesList);

renderAll();
startClock();
startTick();
window.addEventListener("storage", () => { state = loadState(); renderAll(); }); // 別タブ/別ページでも途中から

/* =========================
   navigation
========================= */
navBtns.forEach((b) => {
  b.addEventListener("click", () => setScreen(b.dataset.screen));
});

/* =========================
   Study events
========================= */
studyCategory.addEventListener("change", () => {
  syncStudySubjectSelect();
  syncStudyTaskSelect();
  renderAll();
});

studySubject.addEventListener("change", () => {
  syncStudyTaskSelect();
});

studyOtherSubject.addEventListener("input", () => {
  syncStudyTaskSelect();
  renderAll();
});

studyTaskType.addEventListener("change", () => {
  studyTaskFreeWrap.hidden = (studyTaskType.value !== "自由入力");
});

document.querySelectorAll('input[name="studyTimeMode"]').forEach((r) => {
  r.addEventListener("change", () => syncTimeModeUI("study"));
});

btnAddRangeStudy.addEventListener("click", () => addRangeRow(studyRangesList));

studyForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addStudyTask();
});

/* =========================
   Life events
========================= */
lifeTaskType.addEventListener("change", () => {
  lifeTaskFreeWrap.hidden = (lifeTaskType.value !== "自由入力");
});

document.querySelectorAll('input[name="lifeTimeMode"]').forEach((r) => {
  r.addEventListener("change", () => syncTimeModeUI("life"));
});

lifeForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addLifeTask();
});

/* =========================
   Clear / Reset
========================= */
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

/* =========================
   Run line pick
========================= */
pickStudy.addEventListener("click", () => setRunLine("study"));
pickLife.addEventListener("click", () => setRunLine("life"));

/* =========================
   Run controls
========================= */
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

/* =========================
   Modal
========================= */
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
      line: "study",
      isRunning: false,
      endAt: null,
      remainingMs: null,
      notifiedZero: false,
    }
  };
}

function loadState(){
  try{
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return defaultState();
    const p = JSON.parse(raw);

    // migrate: old untilHHMM -> from/to
    for (const line of ["study","life"]){
      const q = (p[line]?.queue) || [];
      const d = (p[line]?.done) || [];
      for (const t of [...q, ...d]){
        if (t?.timeSpec?.mode === "until" && t.timeSpec.untilHHMM && !t.timeSpec.toHHMM){
          t.timeSpec = { mode:"until", fromHHMM:"", toHHMM:t.timeSpec.untilHHMM };
          delete t.timeSpec.untilHHMM;
        }
      }
    }

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
   Screen
========================= */
function setScreen(screen){
  state.ui.screen = screen;
  saveState();
  renderAll();
}

function setScreenInternal(screen){
  navBtns.forEach(b => b.classList.toggle("is-active", b.dataset.screen === screen));
  Object.entries(screens).forEach(([k, el]) => el.classList.toggle("is-active", k === screen));
}

/* =========================
   Select init
========================= */
function initCategorySelect(){
  studyCategory.innerHTML = "";
  addOpt(studyCategory, "", "—"); // 何も選ばない
  Object.keys(SUBJECTS_BY_CATEGORY).forEach(cat => addOpt(studyCategory, cat, cat));
  studyCategory.value = "";
}

function initLifeSelect(){
  lifeTaskType.innerHTML = "";
  addOpt(lifeTaskType, "", "—"); // 何も選ばない
  LIFE_OPTIONS.forEach(x => addOpt(lifeTaskType, x, x));
  lifeTaskType.value = "";
  lifeTaskFreeWrap.hidden = true;
}

/* =========================
   Study select chain
========================= */
function syncStudySubjectSelect(){
  const cat = studyCategory.value;

  studySubject.innerHTML = "";
  addOpt(studySubject, "", "—"); // 何も選ばない

  if (!cat){
    studySubject.disabled = true;
    studyOtherSubjectWrap.hidden = true;
    studyTaskType.disabled = true;
    studyTaskType.innerHTML = "";
    addOpt(studyTaskType, "", "—");
    return;
  }

  const subs = SUBJECTS_BY_CATEGORY[cat] || [];
  subs.forEach(s => addOpt(studySubject, s, s));

  if (cat === "その他"){
    // 要望：科目は「その他」と表示（固定でもOK）
    studySubject.value = "その他";
    studySubject.disabled = true;
    studyOtherSubjectWrap.hidden = false;
  } else {
    studySubject.disabled = false;
    studyOtherSubjectWrap.hidden = true;
  }

  // 次（タスク）は subject選択後に有効化される
}

function resolveStudySubject(){
  const cat = studyCategory.value;
  if (!cat) return "";

  if (cat !== "その他"){
    return studySubject.value || "";
  }

  const typed = (studyOtherSubject.value || "").trim();
  return typed ? typed : "その他";
}

function syncStudyTaskSelect(){
  const cat = studyCategory.value;

  studyTaskType.innerHTML = "";
  addOpt(studyTaskType, "", "—"); // 何も選ばない

  if (!cat){
    studyTaskType.disabled = true;
    studyTaskFreeWrap.hidden = true;
    return;
  }

  const subj = resolveStudySubject();

  // 科目が空（非その他で—のまま）ならタスク無効
  if (cat !== "その他" && !subj){
    studyTaskType.disabled = true;
    studyTaskFreeWrap.hidden = true;
    return;
  }

  let opts = TASK_OPTIONS_BY_SUBJECT[subj];
  if (!opts){
    // その他科目：全選択肢 + 自由入力
    opts = uniq(["教科書", ...ALL_TASK_OPTIONS.filter(x => x !== "教科書")]);
  }

  opts.forEach(o => addOpt(studyTaskType, o, o));
  studyTaskType.disabled = false;

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
  } else {
    const mode = radioValue("lifeTimeMode");
    lifeDurationWrap.hidden = (mode !== "duration");
    lifeUntilWrap.hidden = (mode !== "until");
  }
}

/* =========================
   Ranges (start/end)
   - start==end が数なら、その数だけ出力（実行画面で展開）
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
  return rows.map(r => ({
    start: (r.querySelector(".rangeStart").value || "").trim(),
    end: (r.querySelector(".rangeEnd").value || "").trim(),
  })).filter(x => x.start || x.end);
}

/* =========================
   Add tasks
========================= */
function addStudyTask(){
  const cat = studyCategory.value || "";
  const subject = resolveStudySubject();
  const rawTask = studyTaskType.value || "";
  const free = (studyTaskFree.value || "").trim();
  const taskType = (rawTask === "自由入力") ? (free || "自由入力") : rawTask;

  const mode = radioValue("studyTimeMode");
  if (!mode) { alert("時間か時刻を選んでください"); return; }

  const timeSpec = readTimeSpec(
    mode,
    studyDurationMin?.value,
    studyFromTime?.value,
    studyToTime?.value
  );

  const ranges = readRanges(studyRangesList);

  const t = {
    id: uid(),
    kind: "study",
    category: cat,
    subject: subject || (cat ? "" : ""), // 何も選ばないもOK
    color: COLORS[cat] || COLORS["その他"],
    taskType: taskType || "",
    ranges,
    timeSpec,
    createdAt: Date.now(),
  };

  state.study.queue.push(t);

  // reset small inputs
  studyTaskFree.value = "";
  studyTaskFreeWrap.hidden = true;
  studyRangesList.innerHTML = "";
  addRangeRow(studyRangesList);

  saveState();
  renderAll();
}

function addLifeTask(){
  const raw = lifeTaskType.value || "";
  const free = (lifeTaskFree.value || "").trim();
  const task = (raw === "自由入力") ? (free || "自由入力") : raw;

  const mode = radioValue("lifeTimeMode");
  if (!mode) { alert("時間か時刻を選んでください"); return; }

  const timeSpec = readTimeSpec(
    mode,
    lifeDurationMin?.value,
    lifeFromTime?.value,
    lifeToTime?.value
  );

  const t = {
    id: uid(),
    kind: "life",
    category: "その他",
    subject: "生活",
    color: COLORS["その他"],
    task: task || "",
    ranges: [],
    timeSpec,
    createdAt: Date.now(),
  };

  state.life.queue.push(t);

  // reset
  lifeTaskFree.value = "";
  lifeTaskFreeWrap.hidden = true;
  lifeTaskType.value = "";

  saveState();
  renderAll();
}

function readTimeSpec(mode, durationMinRaw, fromHHMM, toHHMM){
  if (mode === "duration"){
    const d = Math.max(1, parseInt(durationMinRaw || "1", 10));
    return { mode, durationMin: d };
  }
  return { mode, fromHHMM: (fromHHMM || "").trim(), toHHMM: (toHHMM || "").trim() };
}

/* =========================
   Render
========================= */
function renderAll(){
  setScreenInternal(state.ui.screen);

  renderQueueList(studyQueueEl, state.study.queue, "study");
  renderQueueList(lifeQueueEl, state.life.queue, "life");

  renderDoneList(studyDoneEl, state.study.done, "study");
  renderDoneList(lifeDoneEl, state.life.done, "life");

  renderRunLinePick();
  renderDriver();

  saveState(); // 画面切替などで同期を確実に
}

function renderQueueList(el, queue, line){
  el.innerHTML = "";
  if (queue.length === 0){
    el.appendChild(emptyLi("（空です）"));
    return;
  }

  queue.forEach((t) => {
    const li = document.createElement("li");
    li.className = "item";
    li.style.borderLeftColor = (t.color || css("--gray"));

    const main = document.createElement("div");
    main.className = "item__main";

    const title = document.createElement("div");
    title.className = "item__title";
    title.textContent = (line === "study")
      ? `${showDash(t.subject)}｜${showDash(t.taskType)}`
      : `生活｜${showDash(t.task)}`;

    const meta = document.createElement("div");
    meta.className = "item__meta";
    meta.textContent = timeSpecText(t.timeSpec);

    main.appendChild(title);
    main.appendChild(meta);

    const btns = document.createElement("div");
    btns.className = "item__btns";
    btns.appendChild(miniBtn("↑", () => moveTask(line, t.id, -1)));
    btns.appendChild(miniBtn("↓", () => moveTask(line, t.id, +1)));
    btns.appendChild(miniBtn("✕", () => deleteTask(line, t.id))); // ← 削→✕
    li.appendChild(main);
    li.appendChild(btns);

    el.appendChild(li);
  });
}

function renderDoneList(el, done, line){
  el.innerHTML = "";
  if (done.length === 0){
    el.appendChild(emptyLi("（まだありません）"));
    return;
  }

  done.slice(0, 30).forEach((t, idx) => {
    const li = document.createElement("li");
    li.className = "item";
    li.style.borderLeftColor = (t.color || css("--gray"));

    const main = document.createElement("div");
    main.className = "item__main";

    const title = document.createElement("div");
    title.className = "item__title";
    title.textContent = (line === "study")
      ? `${fmtHHMM(new Date(t.completedAt))}  ${showDash(t.subject)}｜${showDash(t.taskType)}`
      : `${fmtHHMM(new Date(t.completedAt))}  生活｜${showDash(t.task)}`;

    main.appendChild(title);

    const btns = document.createElement("div");
    btns.className = "item__btns";
    btns.appendChild(miniBtn("↩", () => restoreDone(line, idx))); // ← 復活

    li.appendChild(main);
    li.appendChild(btns);
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
  if (state.run.line === line) stopRunTimer();
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
  if (state.run.line === line) stopRunTimer();
  saveState();
  renderAll();
}

function restoreDone(line, doneIndex){
  const ls = getLineState(line);
  const t = ls.done[doneIndex];
  if (!t) return;
  ls.done.splice(doneIndex, 1);

  // completedAt は外して復活
  const revived = { ...t };
  delete revived.completedAt;

  // 先頭に戻す（すぐ実行できる）
  ls.queue.unshift(revived);

  // 実行線ならタイマーは安全に停止
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

function getRunCurrentTask(){
  const q = getRunQueue();
  if (q.length === 0) return null;
  return q[0];
}

function toggleStartPause(){
  const cur = getRunCurrentTask();
  if (!cur) return;

  if (!state.run.isRunning) {
    if (state.run.remainingMs != null) {
      state.run.endAt = Date.now() + state.run.remainingMs;
      state.run.remainingMs = null;
    } else {
      state.run.endAt = computeEndAt(cur);
    }
    state.run.isRunning = true;
    state.run.notifiedZero = false;
  } else {
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
  const ts = task.timeSpec || { mode:"duration", durationMin:30 };

  if (ts.mode === "duration"){
    return Date.now() + ((ts.durationMin || 30) * 60 * 1000);
  }

  // 時刻：開始〜終了
  const from = (ts.fromHHMM || "").trim();
  const to = (ts.toHHMM || "").trim();
  const now = new Date();

  const start = parseHHMMToDate(from, now) || new Date(now); // 未入力なら今
  let end = parseHHMMToDate(to, now);

  if (!end){
    // 終了が未入力なら30分
    end = new Date(start.getTime() + 30*60*1000);
  }

  // end <= startなら翌日に回す
  if (end.getTime() <= start.getTime()){
    end.setDate(end.getDate() + 1);
  }

  // 「途中から」：今がstart〜endの間なら end-now、そうでなければ end-start（所要）
  const nowMs = now.getTime();
  const startMs = start.getTime();
  const endMs = end.getTime();

  const remaining =
    (nowMs >= startMs && nowMs <= endMs)
      ? (endMs - nowMs)
      : (endMs - startMs);

  return Date.now() + Math.max(0, remaining);
}

function completeRunTask(){
  const cur = getRunCurrentTask();
  if (!cur) return;

  const ls = getLineState(state.run.line);
  ls.done.unshift({ ...cur, completedAt: Date.now() });
  ls.queue.shift();

  stopRunTimer();
  saveState();
  renderAll();
}

function skipRunTask(){
  const ls = getLineState(state.run.line);
  if (ls.queue.length === 0) return;

  const first = ls.queue.shift();
  ls.queue.push(first);

  stopRunTimer();
  saveState();
  renderAll();
}

function renderDriver(){
  const cur = getRunCurrentTask();
  setAccent(cur?.color || css("--gray"));

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
    nowSubject.textContent = showDash(cur.subject);
    nowTitle.textContent = showDash(cur.taskType);
    nowSub.textContent = showDash(cur.category);
  } else {
    nowSubject.textContent = "生活";
    nowTitle.textContent = showDash(cur.task);
    nowSub.textContent = "生活";
  }

  // ranges (start==end numeric -> expand count)
  if (cur.kind === "study" && cur.ranges && cur.ranges.length > 0){
    nowRangesWrap.hidden = false;
    nowRanges.innerHTML = "";

    const expanded = expandRanges(cur.ranges);
    expanded.forEach(text => {
      const li = document.createElement("li");
      li.textContent = text;
      nowRanges.appendChild(li);
    });
  } else {
    nowRangesWrap.hidden = true;
  }

  const q = getRunQueue();
  nextPreview.textContent = (q.length >= 2) ? taskShort(q[1]) : "—";

  btnStartPause.textContent = state.run.isRunning ? "一時停止" : "発車";

  updateTimerUI();
}

/* start==end numeric -> N items */
function expandRanges(ranges){
  const out = [];
  for (const r of ranges){
    const a = (r.start || "").trim();
    const b = (r.end || "").trim();

    if (a && b && a === b){
      const n = parseInt(a, 10);
      if (String(n) === a && n > 0 && n <= 300){
        for (let i=0; i<n; i++) out.push(a);
        continue;
      }
      out.push(a);
      continue;
    }
    out.push(rangeText(r));
  }
  return out;
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

    const ts = cur.timeSpec || {};
    const window = (ts.mode === "until")
      ? `${showDash(ts.fromHHMM)}–${showDash(ts.toHHMM)}`
      : "";

    timerMeta.textContent = window ? `${window}` : `到着 ${fmtHHMM(new Date(state.run.endAt))}`;

    if (remain === 0 && !state.run.notifiedZero){
      state.run.notifiedZero = true;
      state.run.isRunning = false;
      state.run.endAt = null;
      state.run.remainingMs = 0;
      saveState();

      confirmModal("到着", `「${taskShort(cur)}」の時間が終了しました。完了にしますか？`, "到着", () => completeRunTask());
    }
    return;
  }

  // paused (freeze)
  if (!state.run.isRunning && state.run.remainingMs != null){
    timerText.textContent = fmtMMSS(state.run.remainingMs);
    timerMeta.textContent = "停止中";
    return;
  }

  // not started
  timerText.textContent = plannedTimeText(cur.timeSpec);
  timerMeta.textContent = "未発車";
}

/* =========================
   Tick / Clock
========================= */
function startTick(){
  setInterval(() => {
    // 走行中だけでなく、終了判定のため常に回す
    updateTimerUI();
  }, 250);
}

function startClock(){
  const tick = () => (clockText.textContent = fmtHHMM(new Date()));
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
   Helpers
========================= */
function taskShort(t){
  if (t.kind === "study") return `${showDash(t.subject)}｜${showDash(t.taskType)}`;
  return `生活｜${showDash(t.task)}`;
}

function rangeText(r){
  const a = (r.start || "").trim();
  const b = (r.end || "").trim();
  if (a && b) return `${a}–${b}`;
  if (a) return `${a}～`;
  if (b) return `～${b}`;
  return "—";
}

function timeSpecText(ts){
  if (!ts) return "—";
  if (ts.mode === "duration") return `所要 ${ts.durationMin}分`;
  return `${showDash(ts.fromHHMM)}–${showDash(ts.toHHMM)}`;
}

function plannedTimeText(ts){
  if (!ts) return "—";
  if (ts.mode === "duration") return `${ts.durationMin}分`;
  return `${showDash(ts.fromHHMM)}–${showDash(ts.toHHMM)}`;
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

function parseHHMMToDate(hhmm, baseDate){
  if (!hhmm) return null;
  const m = /^(\d{2}):(\d{2})$/.exec(hhmm);
  if (!m) return null;
  const d = new Date(baseDate);
  d.setHours(parseInt(m[1],10), parseInt(m[2],10), 0, 0);
  return d;
}

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

function addOpt(sel, value, label){
  const opt = document.createElement("option");
  opt.value = value;
  opt.textContent = label;
  sel.appendChild(opt);
}

function showDash(v){
  const s = (v ?? "").toString().trim();
  return s ? s : "—";
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

function css(name){
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function setAccent(color){
  document.documentElement.style.setProperty("--accent", color);
  document.documentElement.style.setProperty("--accentSoft", toRgba(color, 0.18));
}

function toRgba(color, a){
  const c = (color || "").trim();
  // #RRGGBB
  const m = /^#([0-9a-fA-F]{6})$/.exec(c);
  if (m){
    const hex = m[1];
    const r = parseInt(hex.slice(0,2),16);
    const g = parseInt(hex.slice(2,4),16);
    const b = parseInt(hex.slice(4,6),16);
    return `rgba(${r},${g},${b},${a})`;
  }
  // fallback
  return `rgba(255,255,255,${a})`;
}
