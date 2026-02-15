const LS_KEY = "conductor.v4"; // ← 今回からv4（旧状態を壊さず新保存に）

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
  "その他": ["その他"],
};

const TASK_OPTIONS_BY_SUBJECT = {
  "論国": ["教科書", "漢字", "現代文課題"],
  "古典": ["教科書", "古文単語", "古文課題", "漢文課題"],
  "数学Ⅲ": ["予習", "復習", "4STEP", "課題"],
  "数学C": ["予習", "復習", "4STEP", "課題"],
  "英C": ["予習", "復習", "CROWN", "Cutting Edge", "LEAP", "課題"],
  "論表": ["予習", "復習", "Write to the point", "Scramble"],
  "化学": ["予習", "復習", "セミナー", "実験"],
  "生物": ["予習", "復習", "セミナー", "実験"],
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

const btnShareExport = $("#btnShareExport");
const btnShareImport = $("#btnShareImport");
const btnTTExport = $("#btnTTExport");
const btnTTImport = $("#btnTTImport");
const ttFileInput = $("#ttFileInput");

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
const studyAutoHint = $("#studyAutoHint");

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

/* Confirm Modal */
const modal = $("#modal");
const modalTitle = $("#modalTitle");
const modalText = $("#modalText");
const modalCancel = $("#modalCancel");
const modalOk = $("#modalOk");

/* Edit Modal */
const editModal = $("#editModal");
const editTitle = $("#editTitle");
const editWhere = $("#editWhere");
const editForm = $("#editForm");
const editDelete = $("#editDelete");
const editCancel = $("#editCancel");

const editStudyBlock = $("#editStudyBlock");
const editLifeBlock = $("#editLifeBlock");

/* edit - study */
const editCategory = $("#editCategory");
const editSubject = $("#editSubject");
const editOtherSubjectWrap = $("#editOtherSubjectWrap");
const editOtherSubject = $("#editOtherSubject");
const editTaskType = $("#editTaskType");
const editTaskFreeWrap = $("#editTaskFreeWrap");
const editTaskFree = $("#editTaskFree");
const editDurationWrap = $("#editDurationWrap");
const editUntilWrap = $("#editUntilWrap");
const editDurationMin = $("#editDurationMin");
const editFromTime = $("#editFromTime");
const editToTime = $("#editToTime");
const editRangesList = $("#editRangesList");
const btnAddRangeEdit = $("#btnAddRangeEdit");
const editAutoHint = $("#editAutoHint");

/* edit - life */
const editLifeTaskType = $("#editLifeTaskType");
const editLifeTaskFreeWrap = $("#editLifeTaskFreeWrap");
const editLifeTaskFree = $("#editLifeTaskFree");
const editDurationWrapLife = $("#editDurationWrapLife");
const editUntilWrapLife = $("#editUntilWrapLife");
const editDurationMinLife = $("#editDurationMinLife");
const editFromTimeLife = $("#editFromTimeLife");
const editToTimeLife = $("#editToTimeLife");

/* edit context */
let editCtx = null; // { line: "study"|"life", where:"queue"|"done", index:number }

/* =========================
   init
========================= */
initCategorySelect(studyCategory);
initLifeSelect(lifeTaskType);

syncStudySubjectSelect();
syncStudyTaskSelect();
syncTimeModeUI("study");
syncTimeModeUI("life");

ensureAtLeastOneRangeRow(studyRangesList);
renderAll();
startClock();
startTick();

window.addEventListener("storage", () => { state = loadState(); renderAll(); });

/* =========================
   navigation
========================= */
navBtns.forEach((b) => b.addEventListener("click", () => setScreen(b.dataset.screen)));

/* =========================
   top actions
========================= */
btnShareExport.addEventListener("click", shareExport);
btnShareImport.addEventListener("click", shareImport);

btnTTExport.addEventListener("click", exportTimetableFile);
btnTTImport.addEventListener("click", () => ttFileInput.click());
ttFileInput.addEventListener("change", importTimetableFile);

/* =========================
   Study events
========================= */
studyCategory.addEventListener("change", () => {
  syncStudySubjectSelect();
  syncStudyTaskSelect();
  updateAutoDurationStudyForm();
  renderAll();
});
studySubject.addEventListener("change", () => {
  syncStudyTaskSelect();
  updateAutoDurationStudyForm();
});
studyOtherSubject.addEventListener("input", () => {
  syncStudyTaskSelect();
  updateAutoDurationStudyForm();
  renderAll();
});
studyTaskType.addEventListener("change", () => {
  studyTaskFreeWrap.hidden = (studyTaskType.value !== "自由入力");
});

document.querySelectorAll('input[name="studyTimeMode"]').forEach((r) => {
  r.addEventListener("change", () => {
    syncTimeModeUI("study");
    updateAutoDurationStudyForm();
  });
});

btnAddRangeStudy.addEventListener("click", () => addRangeRow(studyRangesList));

studyRangesList.addEventListener("input", () => updateAutoDurationStudyForm());

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
   Done clear / reset
========================= */
btnStudyClearDone.addEventListener("click", () => confirmModal(
  "確認",
  "勉強の完了ログを一括で消しますか？",
  "消去",
  () => { state.study.done = []; saveState(); renderAll(); }
));

btnLifeClearDone.addEventListener("click", () => confirmModal(
  "確認",
  "生活の完了ログを一括で消しますか？",
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
   Range complete toggle (run)
========================= */
nowRanges.addEventListener("click", (e) => {
  const li = e.target.closest("li");
  if (!li) return;

  const cur = getRunCurrentTask();
  if (!cur || cur.kind !== "study") return;

  const idx = Number(li.dataset.idx);
  if (!Number.isInteger(idx)) return;

  if (!cur.rangeDone) cur.rangeDone = [];
  const pos = cur.rangeDone.indexOf(idx);
  if (pos >= 0) cur.rangeDone.splice(pos, 1);
  else cur.rangeDone.push(idx);

  saveState();
  renderDriver();
});

/* =========================
   Confirm modal
========================= */
modalCancel.addEventListener("click", closeModal);
modalOk.addEventListener("click", () => {
  if (modalOk._onOk) modalOk._onOk();
  closeModal();
});

/* =========================
   Edit modal events
========================= */
editCancel.addEventListener("click", closeEditModal);
editDelete.addEventListener("click", () => {
  if (!editCtx) return;
  const { line, where, index } = editCtx;
  confirmModal("確認", "このタスクを削除しますか？", "削除", () => {
    deleteByEditCtx(line, where, index);
    closeEditModal();
  });
});

btnAddRangeEdit.addEventListener("click", () => addRangeRow(editRangesList));
editRangesList.addEventListener("input", () => updateAutoDurationEdit());

editCategory.addEventListener("change", () => {
  syncEditSubjectSelect();
  syncEditTaskSelect();
  updateAutoDurationEdit();
});
editSubject.addEventListener("change", () => {
  syncEditTaskSelect();
  updateAutoDurationEdit();
});
editOtherSubject.addEventListener("input", () => {
  syncEditTaskSelect();
  updateAutoDurationEdit();
});
editTaskType.addEventListener("change", () => {
  editTaskFreeWrap.hidden = (editTaskType.value !== "自由入力");
});
editLifeTaskType.addEventListener("change", () => {
  editLifeTaskFreeWrap.hidden = (editLifeTaskType.value !== "自由入力");
});

document.querySelectorAll('input[name="editTimeMode"]').forEach((r) => {
  r.addEventListener("change", () => {
    syncEditTimeModeUI();
    updateAutoDurationEdit();
  });
});

editForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!editCtx) return;
  saveEdit();
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

    return sanitizeState({
      ...defaultState(),
      ...p,
      ui: { ...defaultState().ui, ...(p.ui||{}) },
      study: { ...defaultState().study, ...(p.study||{}) },
      life:  { ...defaultState().life,  ...(p.life||{}) },
      run:   { ...defaultState().run,   ...(p.run||{}) },
    });
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

function sanitizeState(s){
  s.study.queue = (s.study.queue||[]).map(sanitizeTask);
  s.study.done  = (s.study.done||[]).map(sanitizeTask);
  s.life.queue  = (s.life.queue||[]).map(sanitizeTask);
  s.life.done   = (s.life.done||[]).map(sanitizeTask);
  return s;
}

function sanitizeTask(t){
  if (!t || typeof t !== "object") return null;
  const out = { ...t };

  // kind inference
  if (!out.kind){
    out.kind = out.taskType != null ? "study" : "life";
  }

  // id
  if (!out.id) out.id = uid();

  // defaults
  if (out.kind === "study"){
    out.category = (out.category || "その他").trim();
    out.subject = (out.subject || "—").trim();
    out.taskType = (out.taskType || "—").trim();
    out.color = COLORS[out.category] || COLORS["その他"];
    out.ranges = Array.isArray(out.ranges) ? out.ranges : [];
    out.rangeSteps = computeRangeSteps(out.ranges);
    out.rangeDone = Array.isArray(out.rangeDone) ? out.rangeDone : [];
  } else {
    out.category = "その他";
    out.subject = "生活";
    out.task = (out.task || "—").trim();
    out.color = COLORS["その他"];
    out.ranges = [];
  }

  // timeSpec
  if (!out.timeSpec || typeof out.timeSpec !== "object"){
    out.timeSpec = { mode:"duration", durationMin: 30 };
  } else {
    if (out.timeSpec.mode === "duration"){
      out.timeSpec.durationMin = Math.max(1, parseInt(out.timeSpec.durationMin || 1, 10));
    } else {
      out.timeSpec.fromHHMM = (out.timeSpec.fromHHMM || "").trim();
      out.timeSpec.toHHMM = (out.timeSpec.toHHMM || "").trim();
    }
  }

  return out;
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
function initCategorySelect(selectEl){
  selectEl.innerHTML = "";
  addOpt(selectEl, "", "—");
  Object.keys(SUBJECTS_BY_CATEGORY).forEach(cat => addOpt(selectEl, cat, cat));
  selectEl.value = "";
}

function initLifeSelect(selectEl){
  selectEl.innerHTML = "";
  addOpt(selectEl, "", "—");
  LIFE_OPTIONS.forEach(x => addOpt(selectEl, x, x));
  selectEl.value = "";
}

/* =========================
   Study select chain (main)
========================= */
function syncStudySubjectSelect(){
  const cat = studyCategory.value;

  studySubject.innerHTML = "";
  addOpt(studySubject, "", "—");

  if (!cat){
    studySubject.disabled = true;
    studyOtherSubjectWrap.hidden = true;

    studyTaskType.innerHTML = "";
    addOpt(studyTaskType, "", "—");
    studyTaskType.disabled = true;
    studyTaskFreeWrap.hidden = true;
    return;
  }

  (SUBJECTS_BY_CATEGORY[cat]||[]).forEach(s => addOpt(studySubject, s, s));

  if (cat === "その他"){
    studySubject.value = "その他";
    studySubject.disabled = true;
    studyOtherSubjectWrap.hidden = false;
  } else {
    studySubject.disabled = false;
    studyOtherSubjectWrap.hidden = true;
    studyOtherSubject.value = "";
  }
}

function resolveStudySubject(){
  const cat = studyCategory.value;
  if (!cat) return "";

  if (cat !== "その他"){
    return (studySubject.value || "").trim();
  }
  const typed = (studyOtherSubject.value || "").trim();
  return typed ? typed : "その他";
}

function syncStudyTaskSelect(){
  const cat = studyCategory.value;

  studyTaskType.innerHTML = "";
  addOpt(studyTaskType, "", "—");

  if (!cat){
    studyTaskType.disabled = true;
    studyTaskFreeWrap.hidden = true;
    return;
  }

  const subj = resolveStudySubject();
  if (cat !== "その他" && !subj){
    studyTaskType.disabled = true;
    studyTaskFreeWrap.hidden = true;
    return;
  }

  let opts = TASK_OPTIONS_BY_SUBJECT[subj];
  if (!opts){
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
   Ranges
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
    <input class="rangeStart" type="text" placeholder="開始（例：11(2-3) / 3）" />
    <input class="rangeEnd" type="text" placeholder="終了（例：15(3) / 7）" />
    <button type="button" class="rangeDel">×</button>
  `;
  row.querySelector(".rangeDel").addEventListener("click", () => {
    row.remove();
    ensureAtLeastOneRangeRow(container);
    // auto duration update for main
    if (container === studyRangesList) updateAutoDurationStudyForm();
    if (container === editRangesList) updateAutoDurationEdit();
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

function parseLeadingInt(token){
  const t = (token || "").trim();
  const m = /^(-?\d+)(.*)$/.exec(t);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  if (String(n) !== m[1]) return null;
  return { num: n, rest: m[2] || "" };
}

/**
 * 展開ルール
 * - 両端が「先頭が整数」であれば、整数の列で埋める
 *   - 端の表示は元の文字列を保持（例：11(2-3) / 15(3)）
 *   - 中間は整数だけ（例：12,13,14）
 * - 片方だけ整数/どちらも非整数 → 1行表示
 */
function computeRangeSteps(ranges){
  const out = [];
  for (const r of ranges){
    const a = (r.start || "").trim();
    const b = (r.end || "").trim();

    const pa = parseLeadingInt(a);
    const pb = parseLeadingInt(b);

    if (pa && pb){
      if (pa.num === pb.num){
        if (a === b) out.push(a);
        else {
          out.push(a);
          out.push(b);
        }
        continue;
      }

      const step = pa.num < pb.num ? 1 : -1;
      out.push(a); // 始点は文字列のまま
      for (let v = pa.num + step; step === 1 ? v < pb.num : v > pb.num; v += step){
        out.push(String(v));
      }
      out.push(b); // 終点も文字列のまま
      continue;
    }

    // 片側だけ整数で片側空など：そのまま
    if (a && !b){ out.push(a); continue; }
    if (!a && b){ out.push(b); continue; }

    // 非整数：通常表示
    out.push(rangeText(r));
  }
  return out;
}

/* =========================
   Auto duration
========================= */
function perRangeMinutes(subject){
  if (subject === "化学" || subject === "生物") return 20;
  if (subject === "数学Ⅲ" || subject === "数学C") return 10;
  return null;
}

function computeAutoDurationMin(subject, ranges){
  const per = perRangeMinutes(subject);
  if (!per) return null;
  const steps = computeRangeSteps(ranges);
  const n = Math.max(1, steps.length);
  return per * n;
}

function updateAutoDurationStudyForm(){
  const mode = radioValue("studyTimeMode");
  const cat = studyCategory.value || "";
  const subj = resolveStudySubject();
  const ranges = readRanges(studyRangesList);
  const auto = (mode === "duration") ? computeAutoDurationMin(subj, ranges) : null;

  if (auto != null){
    studyDurationMin.value = String(auto);
    studyDurationMin.disabled = true;
    studyAutoHint.hidden = false;
  } else {
    studyDurationMin.disabled = false;
    studyAutoHint.hidden = true;
  }
}

/* =========================
   Add tasks
========================= */
function addStudyTask(){
  const cat = (studyCategory.value || "").trim();
  if (!cat){ alert("系を選んでください"); return; }

  const subject = resolveStudySubject();
  if (cat !== "その他" && !subject){ alert("科目を選んでください"); return; }

  const rawTask = (studyTaskType.value || "").trim();
  if (!rawTask){ alert("タスク内容を選んでください"); return; }

  const free = (studyTaskFree.value || "").trim();
  const taskType = (rawTask === "自由入力") ? (free || "自由入力") : rawTask;

  const mode = radioValue("studyTimeMode");
  if (!mode){ alert("時間か時刻を選んでください"); return; }

  const ranges = readRanges(studyRangesList);
  const rangeSteps = computeRangeSteps(ranges);

  let timeSpec = readTimeSpec(mode, studyDurationMin?.value, studyFromTime?.value, studyToTime?.value);

  // auto duration override
  if (mode === "duration"){
    const auto = computeAutoDurationMin(subject, ranges);
    if (auto != null) timeSpec = { mode:"duration", durationMin: auto };
  }

  const t = sanitizeTask({
    id: uid(),
    kind: "study",
    category: cat,
    subject: subject || "—",
    taskType: taskType || "—",
    ranges,
    rangeSteps,
    rangeDone: [],
    timeSpec,
    createdAt: Date.now(),
  });

  state.study.queue.push(t);

  // reset
  studyTaskFree.value = "";
  studyTaskFreeWrap.hidden = true;
  studyRangesList.innerHTML = "";
  addRangeRow(studyRangesList);
  updateAutoDurationStudyForm();

  saveState();
  renderAll();
}

function addLifeTask(){
  const raw = (lifeTaskType.value || "").trim();
  if (!raw){ alert("内容を選んでください"); return; }

  const free = (lifeTaskFree.value || "").trim();
  const task = (raw === "自由入力") ? (free || "自由入力") : raw;

  const mode = radioValue("lifeTimeMode");
  if (!mode){ alert("時間か時刻を選んでください"); return; }

  const timeSpec = readTimeSpec(mode, lifeDurationMin?.value, lifeFromTime?.value, lifeToTime?.value);

  const t = sanitizeTask({
    id: uid(),
    kind: "life",
    task: task || "—",
    timeSpec,
    createdAt: Date.now(),
  });

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
   Render lists + edit click
========================= */
function renderAll(){
  setScreenInternal(state.ui.screen);

  renderQueueList(studyQueueEl, state.study.queue, "study");
  renderQueueList(lifeQueueEl, state.life.queue, "life");

  renderDoneList(studyDoneEl, state.study.done, "study");
  renderDoneList(lifeDoneEl, state.life.done, "life");

  renderRunLinePick();
  renderDriver();

  saveState();
}

function renderQueueList(el, queue, line){
  el.innerHTML = "";
  const list = queue.filter(Boolean);

  if (list.length === 0){
    el.appendChild(emptyLi("（空です）"));
    return;
  }

  list.forEach((t, idx) => {
    const li = document.createElement("li");
    li.className = "item";
    li.style.borderLeftColor = (t.color || css("--gray"));

    const main = document.createElement("div");
    main.className = "item__main";
    main.addEventListener("click", () => openEdit(line, "queue", idx));

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
    btns.appendChild(miniBtn("✕", () => deleteTask(line, t.id)));

    li.appendChild(main);
    li.appendChild(btns);
    el.appendChild(li);
  });
}

function renderDoneList(el, done, line){
  el.innerHTML = "";
  const list = (done || []).filter(Boolean);

  if (list.length === 0){
    el.appendChild(emptyLi("（まだありません）"));
    return;
  }

  list.slice(0, 50).forEach((t, idx) => {
    const li = document.createElement("li");
    li.className = "item";
    li.style.borderLeftColor = (t.color || css("--gray"));

    const main = document.createElement("div");
    main.className = "item__main";
    main.addEventListener("click", () => openEdit(line, "done", idx));

    const title = document.createElement("div");
    title.className = "item__title";
    const time = t.completedAt ? fmtHHMM(new Date(t.completedAt)) : "--:--";
    title.textContent = (line === "study")
      ? `${time}  ${showDash(t.subject)}｜${showDash(t.taskType)}`
      : `${time}  生活｜${showDash(t.task)}`;

    main.appendChild(title);

    const btns = document.createElement("div");
    btns.className = "item__btns";
    btns.appendChild(miniBtn("↩", () => restoreDone(line, idx)));
    btns.appendChild(miniBtn("✕", () => deleteDone(line, idx))); // ← 個別削除

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
  ls.queue = ls.queue.filter(t => t && t.id !== id);
  if (state.run.line === line) stopRunTimer();
  saveState();
  renderAll();
}

function moveTask(line, id, dir){
  const ls = getLineState(line);
  const i = ls.queue.findIndex(t => t && t.id === id);
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
  const revived = { ...t };
  delete revived.completedAt;

  // 復活：先頭に戻す
  ls.queue.unshift(sanitizeTask(revived));

  if (state.run.line === line) stopRunTimer();

  saveState();
  renderAll();
}

function deleteDone(line, doneIndex){
  const ls = getLineState(line);
  ls.done.splice(doneIndex, 1);
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
  const q = getRunQueue().filter(Boolean);
  return (q.length === 0) ? null : q[0];
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

  const start = parseHHMMToDate(from, now) || new Date(now);
  let end = parseHHMMToDate(to, now);

  if (!end){
    end = new Date(start.getTime() + 30*60*1000);
  }
  if (end.getTime() <= start.getTime()){
    end.setDate(end.getDate() + 1);
  }

  const nowMs = now.getTime();
  const startMs = start.getTime();
  const endMs = end.getTime();

  const duration = endMs - startMs;
  const remaining = (nowMs >= startMs && nowMs <= endMs) ? (endMs - nowMs) : duration;

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

  // ranges
  if (cur.kind === "study" && cur.ranges && cur.ranges.length > 0){
    if (!cur.rangeSteps){
      cur.rangeSteps = computeRangeSteps(cur.ranges);
      cur.rangeDone = [];
      saveState();
    }
    if (!cur.rangeDone) cur.rangeDone = [];

    nowRangesWrap.hidden = false;
    nowRanges.innerHTML = "";
    cur.rangeSteps.forEach((text, idx) => {
      const li = document.createElement("li");
      li.textContent = text;
      li.dataset.idx = String(idx);
      if (cur.rangeDone.includes(idx)) li.classList.add("is-done");
      nowRanges.appendChild(li);
    });
  } else {
    nowRangesWrap.hidden = true;
  }

  const q = getRunQueue().filter(Boolean);
  nextPreview.textContent = (q.length >= 2) ? taskShort(q[1]) : "—";

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

  if (state.run.isRunning && state.run.endAt){
    const remain = Math.max(0, state.run.endAt - Date.now());
    timerText.textContent = fmtMMSS(remain);

    const ts = cur.timeSpec || {};
    if (ts.mode === "until"){
      timerMeta.textContent = `${showDash(ts.fromHHMM)}–${showDash(ts.toHHMM)}`;
    } else {
      timerMeta.textContent = `到着 ${fmtHHMM(new Date(state.run.endAt))}`;
    }

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

  if (!state.run.isRunning && state.run.remainingMs != null){
    timerText.textContent = fmtMMSS(state.run.remainingMs);
    timerMeta.textContent = "停止中";
    return;
  }

  timerText.textContent = plannedTimeText(cur.timeSpec);
  timerMeta.textContent = "未発車";
}

/* =========================
   Tick / Clock
========================= */
function startTick(){
  setInterval(() => updateTimerUI(), 250);
}

function startClock(){
  const tick = () => (clockText.textContent = fmtHHMM(new Date()));
  tick();
  setInterval(tick, 1000);
}

/* =========================
   Confirm modal helpers
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
   Edit modal
========================= */
function openEdit(line, where, index){
  const ls = getLineState(line);
  const arr = where === "queue" ? ls.queue : ls.done;
  const t = arr[index];
  if (!t) return;

  editCtx = { line, where, index };
  editWhere.textContent = `${line === "study" ? "勉強" : "生活"} / ${where === "queue" ? "運行表" : "完了ログ"}`;
  editTitle.textContent = "編集";

  if (t.kind === "study"){
    editStudyBlock.hidden = false;
    editLifeBlock.hidden = true;
    openEditStudy(t);
  } else {
    editStudyBlock.hidden = true;
    editLifeBlock.hidden = false;
    openEditLife(t);
  }

  editModal.hidden = false;
}

function closeEditModal(){
  editModal.hidden = true;
  editCtx = null;
}

function deleteByEditCtx(line, where, index){
  const ls = getLineState(line);
  if (where === "queue"){
    const t = ls.queue[index];
    if (t && state.run.line === line) stopRunTimer();
    ls.queue.splice(index, 1);
  } else {
    ls.done.splice(index, 1);
  }
  saveState();
  renderAll();
}

function openEditStudy(t){
  // init selects
  initCategorySelect(editCategory);
  editCategory.value = t.category || "";

  syncEditSubjectSelect(t);
  syncEditTaskSelect(t);

  // free handling
  if (editTaskType.value === "自由入力"){
    editTaskFreeWrap.hidden = false;
    editTaskFree.value = t.taskType || "";
  } else {
    editTaskFreeWrap.hidden = true;
    editTaskFree.value = "";
  }

  // time mode
  const mode = t.timeSpec?.mode || "duration";
  setRadio("editTimeMode", mode);
  syncEditTimeModeUI();

  // fill time
  if (mode === "duration"){
    editDurationMin.value = String(t.timeSpec.durationMin || 30);
  } else {
    editFromTime.value = (t.timeSpec.fromHHMM || "");
    editToTime.value = (t.timeSpec.toHHMM || "");
  }

  // ranges
  editRangesList.innerHTML = "";
  const ranges = Array.isArray(t.ranges) ? t.ranges : [];
  if (ranges.length === 0) addRangeRow(editRangesList);
  else ranges.forEach(r => addRangeRow(editRangesList, r));

  updateAutoDurationEdit();
}

function openEditLife(t){
  initLifeSelect(editLifeTaskType);
  editLifeTaskType.value = LIFE_OPTIONS.includes(t.task) ? t.task : "自由入力";
  editLifeTaskFreeWrap.hidden = (editLifeTaskType.value !== "自由入力");
  editLifeTaskFree.value = (editLifeTaskType.value === "自由入力") ? (t.task || "") : "";

  const mode = t.timeSpec?.mode || "duration";
  setRadio("editTimeMode", mode);
  syncEditTimeModeUI();

  if (mode === "duration"){
    editDurationMinLife.value = String(t.timeSpec.durationMin || 15);
  } else {
    editFromTimeLife.value = (t.timeSpec.fromHHMM || "");
    editToTimeLife.value = (t.timeSpec.toHHMM || "");
  }
}

function syncEditSubjectSelect(existingTask){
  const cat = editCategory.value;

  editSubject.innerHTML = "";
  addOpt(editSubject, "", "—");

  if (!cat){
    editSubject.disabled = true;
    editOtherSubjectWrap.hidden = true;
    return;
  }

  (SUBJECTS_BY_CATEGORY[cat]||[]).forEach(s => addOpt(editSubject, s, s));

  if (cat === "その他"){
    editSubject.value = "その他";
    editSubject.disabled = true;
    editOtherSubjectWrap.hidden = false;
    if (existingTask){
      editOtherSubject.value = (existingTask.subject && existingTask.subject !== "その他") ? existingTask.subject : "";
    }
  } else {
    editSubject.disabled = false;
    editOtherSubjectWrap.hidden = true;
    if (existingTask){
      editSubject.value = existingTask.subject || "";
    }
  }
}

function resolveEditSubject(){
  const cat = editCategory.value;
  if (!cat) return "";
  if (cat !== "その他"){
    return (editSubject.value || "").trim();
  }
  const typed = (editOtherSubject.value || "").trim();
  return typed ? typed : "その他";
}

function syncEditTaskSelect(existingTask){
  const cat = editCategory.value;
  const subj = resolveEditSubject();

  editTaskType.innerHTML = "";
  addOpt(editTaskType, "", "—");

  if (!cat){
    editTaskType.disabled = true;
    editTaskFreeWrap.hidden = true;
    return;
  }

  let opts = TASK_OPTIONS_BY_SUBJECT[subj];
  if (!opts){
    opts = uniq(["教科書", ...ALL_TASK_OPTIONS.filter(x => x !== "教科書")]);
  }
  opts.forEach(o => addOpt(editTaskType, o, o));
  editTaskType.disabled = false;

  if (existingTask){
    const val = existingTask.taskType || "";
    if (opts.includes(val)){
      editTaskType.value = val;
      editTaskFreeWrap.hidden = true;
      editTaskFree.value = "";
    } else {
      editTaskType.value = "自由入力";
      editTaskFreeWrap.hidden = false;
      editTaskFree.value = val;
    }
  }

  editTaskFreeWrap.hidden = (editTaskType.value !== "自由入力");
}

function syncEditTimeModeUI(){
  const mode = radioValue("editTimeMode");

  // study blocks
  editDurationWrap.hidden = (mode !== "duration");
  editUntilWrap.hidden = (mode !== "until");

  // life blocks
  editDurationWrapLife.hidden = (mode !== "duration");
  editUntilWrapLife.hidden = (mode !== "until");
}

function updateAutoDurationEdit(){
  if (!editCtx) return;
  const { line, where, index } = editCtx;
  const ls = getLineState(line);
  const arr = where === "queue" ? ls.queue : ls.done;
  const t = arr[index];
  if (!t || t.kind !== "study") return;

  const mode = radioValue("editTimeMode");
  const subj = resolveEditSubject();
  const ranges = readRanges(editRangesList);

  const auto = (mode === "duration") ? computeAutoDurationMin(subj, ranges) : null;

  if (auto != null){
    editDurationMin.value = String(auto);
    editDurationMin.disabled = true;
    editAutoHint.hidden = false;
  } else {
    editDurationMin.disabled = false;
    editAutoHint.hidden = true;
  }
}

function saveEdit(){
  const { line, where, index } = editCtx;
  const ls = getLineState(line);
  const arr = where === "queue" ? ls.queue : ls.done;
  const t = arr[index];
  if (!t) return;

  if (t.kind === "study"){
    const cat = (editCategory.value || "").trim();
    if (!cat){ alert("系を選んでください"); return; }

    const subject = resolveEditSubject();
    if (cat !== "その他" && !subject){ alert("科目を選んでください"); return; }

    const rawTask = (editTaskType.value || "").trim();
    if (!rawTask){ alert("タスク内容を選んでください"); return; }
    const free = (editTaskFree.value || "").trim();
    const taskType = (rawTask === "自由入力") ? (free || "自由入力") : rawTask;

    const mode = radioValue("editTimeMode") || "duration";
    const ranges = readRanges(editRangesList);
    const rangeSteps = computeRangeSteps(ranges);

    let timeSpec;
    if (mode === "duration"){
      let d = Math.max(1, parseInt(editDurationMin.value || "1", 10));
      const auto = computeAutoDurationMin(subject, ranges);
      if (auto != null) d = auto;
      timeSpec = { mode:"duration", durationMin: d };
    } else {
      timeSpec = { mode:"until", fromHHMM: (editFromTime.value||""), toHHMM: (editToTime.value||"") };
    }

    const updated = sanitizeTask({
      ...t,
      category: cat,
      subject,
      taskType,
      ranges,
      rangeSteps,
      rangeDone: [], // 範囲が変わる可能性が高いのでリセット
      timeSpec,
    });

    arr[index] = updated;

    if (state.run.line === line) stopRunTimer();
  } else {
    // life
    const raw = (editLifeTaskType.value || "").trim();
    if (!raw){ alert("内容を選んでください"); return; }
    const free = (editLifeTaskFree.value || "").trim();
    const task = (raw === "自由入力") ? (free || "自由入力") : raw;

    const mode = radioValue("editTimeMode") || "duration";
    let timeSpec;
    if (mode === "duration"){
      const d = Math.max(1, parseInt(editDurationMinLife.value || "1", 10));
      timeSpec = { mode:"duration", durationMin: d };
    } else {
      timeSpec = { mode:"until", fromHHMM: (editFromTimeLife.value||""), toHHMM: (editToTimeLife.value||"") };
    }

    arr[index] = sanitizeTask({ ...t, task, timeSpec });

    if (state.run.line === line) stopRunTimer();
  }

  saveState();
  renderAll();
  closeEditModal();
}

/* =========================
   Share export/import (full state)
========================= */
async function shareExport(){
  try{
    const portable = makePortableState();
    const code = btoa(unescape(encodeURIComponent(JSON.stringify(portable))));
    await navigator.clipboard.writeText(code);
    alert("共有コードをコピーしました。別端末で「共有読込」に貼り付けてください。");
  }catch(e){
    const portable = makePortableState();
    const code = btoa(unescape(encodeURIComponent(JSON.stringify(portable))));
    prompt("共有コード（コピーして別端末へ）", code);
  }
}

function shareImport(){
  const code = prompt("共有コードを貼り付けてください");
  if (!code) return;
  try{
    const json = decodeURIComponent(escape(atob(code.trim())));
    const obj = JSON.parse(json);
    state = mergeWithDefault(obj);
    stopRunTimer();
    saveState();
    renderAll();
    alert("読み込み完了");
  }catch(e){
    alert("読み込み失敗: " + e.message);
  }
}

function makePortableState(){
  const s = (typeof structuredClone === "function")
    ? structuredClone(state)
    : JSON.parse(JSON.stringify(state));

  // 走行中は残り時間で停止状態にして持ち運ぶ
  if (s.run && s.run.isRunning && s.run.endAt){
    const remain = Math.max(0, s.run.endAt - Date.now());
    s.run.isRunning = false;
    s.run.remainingMs = remain;
    s.run.endAt = null;
    s.run.notifiedZero = false;
  }
  return s;
}

function mergeWithDefault(obj){
  const d = defaultState();
  const merged = {
    ...d,
    ...obj,
    ui:   { ...d.ui,   ...(obj.ui||{}) },
    study:{ ...d.study,...(obj.study||{}) },
    life: { ...d.life, ...(obj.life||{}) },
    run:  { ...d.run,  ...(obj.run||{}) },
  };
  return sanitizeState(merged);
}

/* =========================
   Timetable save/load (queues only)
========================= */
function exportTimetableFile(){
  const payload = {
    version: 1,
    savedAt: new Date().toISOString(),
    studyQueue: (state.study.queue||[]).filter(Boolean),
    lifeQueue: (state.life.queue||[]).filter(Boolean),
  };
  const name = `conductor_timetable_${stamp()}.json`;
  downloadJson(payload, name);
}

function importTimetableFile(){
  const file = ttFileInput.files && ttFileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try{
      const obj = JSON.parse(String(reader.result || "{}"));
      const sq = Array.isArray(obj.studyQueue) ? obj.studyQueue : [];
      const lq = Array.isArray(obj.lifeQueue) ? obj.lifeQueue : [];

      state.study.queue = sq.map(sanitizeTask).filter(Boolean);
      state.life.queue = lq.map(sanitizeTask).filter(Boolean);

      stopRunTimer();
      saveState();
      renderAll();
      alert("運行表を読み込みました");
    }catch(e){
      alert("読み込み失敗: " + e.message);
    }finally{
      ttFileInput.value = "";
    }
  };
  reader.readAsText(file);
}

function downloadJson(obj, filename){
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type:"application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* =========================
   Helpers
========================= */
function setRadio(name, value){
  const el = document.querySelector(`input[name="${name}"][value="${value}"]`);
  if (el) el.checked = true;
}

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

function stamp(){
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,"0");
  const da = String(d.getDate()).padStart(2,"0");
  const hh = String(d.getHours()).padStart(2,"0");
  const mm = String(d.getMinutes()).padStart(2,"0");
  return `${y}${m}${da}_${hh}${mm}`;
}

function miniBtn(text, onClick){
  const b = document.createElement("button");
  b.type = "button";
  b.className = "btn btn--ghost btn--mini";
  b.textContent = text;
  b.addEventListener("click", (e) => { e.stopPropagation(); onClick(); });
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
  const m = /^#([0-9a-fA-F]{6})$/.exec(c);
  if (m){
    const hex = m[1];
    const r = parseInt(hex.slice(0,2),16);
    const g = parseInt(hex.slice(2,4),16);
    const b = parseInt(hex.slice(4,6),16);
    return `rgba(${r},${g},${b},${a})`;
  }
  return `rgba(255,255,255,${a})`;
                                                                  }
