const LS_KEY = "conductor.v4";

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
const ALL_TASK_OPTIONS = uniq([...Object.values(TASK_OPTIONS_BY_SUBJECT).flat(), "自由入力"]);

/** ★生活の自動時間（分） */
const LIFE_AUTO_MIN = {
  "移動": 30,
  "食事": 30,
  "風呂": 60,
  "準備": 15,
  "ラジオ": 60,
  "テレビ": 60,
  "爪切り": 15,
  "散髪": 60,
};

let state = loadState();

/* ===== DOM ===== */
const clockText = $("#clockText");

const btnShareExport = $("#btnShareExport");
const btnShareImport = $("#btnShareImport");

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
const lifeAutoHint = $("#lifeAutoHint"); // ★追加

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
const rangeProgressTitle = $("#rangeProgressTitle");
const btnRangeAllDone = $("#btnRangeAllDone");

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
const editRangesList = $("#editRangesList");
const btnAddRangeEdit = $("#btnAddRangeEdit");

/* edit - life */
const editLifeTaskType = $("#editLifeTaskType");
const editLifeTaskFreeWrap = $("#editLifeTaskFreeWrap");
const editLifeTaskFree = $("#editLifeTaskFree");

/* edit - time (common) */
const editDurationWrap = $("#editDurationWrap");
const editUntilWrap = $("#editUntilWrap");
const editDurationMin = $("#editDurationMin");
const editFromTime = $("#editFromTime");
const editToTime = $("#editToTime");
const editAutoHint = $("#editAutoHint");

/* edit context */
let editCtx = null; // { line:"study"|"life", where:"queue"|"done", index:number }

/* auto-time touch flags */
let suppressStudyTouch = false;
let studyDurationTouched = false;

let suppressLifeTouch = false;   // ★追加
let lifeDurationTouched = false; // ★追加

let suppressEditTouch = false;
let editDurationTouched = false;

/* ===== init ===== */
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

/* ===== navigation ===== */
navBtns.forEach((b) => b.addEventListener("click", () => setScreen(b.dataset.screen)));

/* ===== share ===== */
btnShareExport.addEventListener("click", shareExport);
btnShareImport.addEventListener("click", shareImport);

/* ===== Study events ===== */
studyCategory.addEventListener("change", () => {
  studyDurationTouched = false;
  syncStudySubjectSelect();
  syncStudyTaskSelect();
  updateAutoDurationStudyForm();
  renderAll();
});
studySubject.addEventListener("change", () => {
  studyDurationTouched = false;
  syncStudyTaskSelect();
  updateAutoDurationStudyForm();
});
studyOtherSubject.addEventListener("input", () => {
  studyDurationTouched = false;
  syncStudyTaskSelect();
  updateAutoDurationStudyForm();
  renderAll();
});
studyTaskType.addEventListener("change", () => {
  studyDurationTouched = false;
  studyTaskFreeWrap.hidden = (studyTaskType.value !== "自由入力");
  updateAutoDurationStudyForm();
});
studyTaskFree.addEventListener("input", () => {
  updateAutoDurationStudyForm();
});
studyDurationMin.addEventListener("input", () => {
  if (!suppressStudyTouch) studyDurationTouched = true;
});

document.querySelectorAll('input[name="studyTimeMode"]').forEach((r) => {
  r.addEventListener("change", () => {
    studyDurationTouched = false;
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

/* ===== Life events ===== */
lifeTaskType.addEventListener("change", () => {
  lifeDurationTouched = false;
  lifeTaskFreeWrap.hidden = (lifeTaskType.value !== "自由入力");
  updateAutoDurationLifeForm();
});

lifeTaskFree.addEventListener("input", () => {
  updateAutoDurationLifeForm();
});

lifeDurationMin.addEventListener("input", () => {
  if (!suppressLifeTouch) lifeDurationTouched = true;
});

document.querySelectorAll('input[name="lifeTimeMode"]').forEach((r) => {
  r.addEventListener("change", () => {
    lifeDurationTouched = false;
    syncTimeModeUI("life");
    updateAutoDurationLifeForm();
  });
});

lifeForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addLifeTask();
});

/* ===== Done clear / reset ===== */
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

/* ===== Run line pick ===== */
pickStudy.addEventListener("click", () => setRunLine("study"));
pickLife.addEventListener("click", () => setRunLine("life"));

/* ===== Run controls ===== */
btnStartPause.addEventListener("click", () => toggleStartPause());

btnArrive.addEventListener("click", () => {
  const cur = getRunCurrentTask();
  if (!cur) return;
  confirmArriveDialog(cur);
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

/* ===== Run ranges interactions ===== */
btnRangeAllDone.addEventListener("click", () => {
  const cur = getRunCurrentTask();
  if (!cur || cur.kind !== "study" || !cur.rangeSteps || cur.rangeSteps.length === 0) return;

  cur.rangeDone = Array.from({ length: cur.rangeSteps.length }, (_, i) => i);
  saveState();
  renderDriver();
  confirmArriveDialog(cur);
});

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

  const total = cur.rangeSteps?.length || 0;
  const done = cur.rangeDone.length;
  if (total > 0 && done === total){
    confirmArriveDialog(cur);
  }
});

/* ===== Confirm modal ===== */
modalCancel.addEventListener("click", closeModal);
modalOk.addEventListener("click", () => {
  if (modalOk._onOk) modalOk._onOk();
  closeModal();
});

/* ===== Edit modal events ===== */
editCancel.addEventListener("click", closeEditModal);

btnAddRangeEdit.addEventListener("click", () => addRangeRow(editRangesList));
editRangesList.addEventListener("input", () => updateAutoDurationEdit());

editCategory.addEventListener("change", () => {
  editDurationTouched = false;
  syncEditSubjectSelect();
  syncEditTaskSelect();
  updateAutoDurationEdit();
});
editSubject.addEventListener("change", () => {
  editDurationTouched = false;
  syncEditTaskSelect();
  updateAutoDurationEdit();
});
editOtherSubject.addEventListener("input", () => {
  editDurationTouched = false;
  syncEditTaskSelect();
  updateAutoDurationEdit();
});
editTaskType.addEventListener("change", () => {
  editDurationTouched = false;
  editTaskFreeWrap.hidden = (editTaskType.value !== "自由入力");
  updateAutoDurationEdit();
});
editTaskFree.addEventListener("input", () => updateAutoDurationEdit());

editLifeTaskType.addEventListener("change", () => {
  editDurationTouched = false;
  editLifeTaskFreeWrap.hidden = (editLifeTaskType.value !== "自由入力");
  updateAutoDurationEdit();
});
editLifeTaskFree.addEventListener("input", () => {
  editDurationTouched = false;
  updateAutoDurationEdit();
});

editDurationMin.addEventListener("input", () => {
  if (!suppressEditTouch) editDurationTouched = true;
});

document.querySelectorAll('input[name="editTimeMode"]').forEach((r) => {
  r.addEventListener("change", () => {
    editDurationTouched = false;
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
  s.study.queue = (s.study.queue||[]).map(sanitizeTask).filter(Boolean);
  s.study.done  = (s.study.done||[]).map(sanitizeTask).filter(Boolean);
  s.life.queue  = (s.life.queue||[]).map(sanitizeTask).filter(Boolean);
  s.life.done   = (s.life.done||[]).map(sanitizeTask).filter(Boolean);
  return s;
}

function sanitizeTask(t){
  if (!t || typeof t !== "object") return null;
  const out = { ...t };

  if (!out.kind){
    out.kind = out.taskType != null ? "study" : "life";
  }
  if (!out.id) out.id = uid();

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

function resolveStudyTaskType(){
  const raw = (studyTaskType.value || "").trim();
  if (!raw) return "";
  if (raw !== "自由入力") return raw;
  return (studyTaskFree.value || "").trim();
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
    <button type="button" class="rangeDel">✕</button>
  `;
  row.querySelector(".rangeDel").addEventListener("click", () => {
    row.remove();
    ensureAtLeastOneRangeRow(container);
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
        else { out.push(a); out.push(b); }
        continue;
      }
      const step = pa.num < pb.num ? 1 : -1;
      out.push(a);
      for (let v = pa.num + step; step === 1 ? v < pb.num : v > pb.num; v += step){
        out.push(String(v));
      }
      out.push(b);
      continue;
    }

    if (a && !b){ out.push(a); continue; }
    if (!a && b){ out.push(b); continue; }
    out.push(rangeText(r));
  }
  return out;
}

/* =========================
   Auto duration (editable)
   変更対象:
   - 化学/生物 + セミナー => 1範囲20分
   - 数学Ⅲ/数学C + 4STEP => 1範囲10分
========================= */
function perRangeMinutes(subject, taskType){
  if ((subject === "化学" || subject === "生物") && taskType === "セミナー") return 20;
  if ((subject === "数学Ⅲ" || subject === "数学C") && taskType === "4STEP") return 10;
  return null;
}

function computeAutoDurationMin(subject, taskType, ranges){
  const per = perRangeMinutes(subject, taskType);
  if (!per) return null;
  const steps = computeRangeSteps(ranges);
  const n = Math.max(1, steps.length);
  return per * n;
}

function updateAutoDurationStudyForm(){
  const mode = radioValue("studyTimeMode");
  if (mode !== "duration"){
    studyAutoHint.hidden = true;
    return;
  }

  const cat = (studyCategory.value || "").trim();
  if (!cat){
    studyAutoHint.hidden = true;
    return;
  }

  const subj = resolveStudySubject();
  const taskType = resolveStudyTaskType();
  const ranges = readRanges(studyRangesList);

  const auto = computeAutoDurationMin(subj, taskType, ranges);

  if (auto == null){
    studyAutoHint.hidden = true;
    return;
  }

  studyAutoHint.hidden = false;
  studyAutoHint.textContent = `推奨: ${auto}分`;

  if (!studyDurationTouched){
    suppressStudyTouch = true;
    studyDurationMin.value = String(auto);
    suppressStudyTouch = false;
  }
}

/* ===== 生活：フォームの自動時間（編集可能） ===== */
function resolveLifeTaskOnForm(){
  const raw = (lifeTaskType.value || "").trim();
  if (!raw) return "";
  if (raw !== "自由入力") return raw;
  return (lifeTaskFree.value || "").trim();
}

function updateAutoDurationLifeForm(){
  const mode = radioValue("lifeTimeMode");
  if (mode !== "duration"){
    lifeAutoHint.hidden = true;
    return;
  }

  const task = resolveLifeTaskOnForm();
  const auto = LIFE_AUTO_MIN[task];

  if (auto == null){
    lifeAutoHint.hidden = true;
    return;
  }

  lifeAutoHint.hidden = false;
  lifeAutoHint.textContent = `推奨: ${auto}分`;

  if (!lifeDurationTouched){
    suppressLifeTouch = true;
    lifeDurationMin.value = String(auto);
    suppressLifeTouch = false;
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

  const timeSpec = readTimeSpec(mode, studyDurationMin?.value, studyFromTime?.value, studyToTime?.value);

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

  studyTaskFree.value = "";
  studyTaskFreeWrap.hidden = true;
  studyRangesList.innerHTML = "";
  addRangeRow(studyRangesList);

  studyDurationTouched = false;
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

  lifeTaskFree.value = "";
  lifeTaskFreeWrap.hidden = true;
  lifeTaskType.value = "";

  lifeDurationTouched = false;
  updateAutoDurationLifeForm();

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
    btns.appendChild(miniBtn("✕", () => deleteDone(line, idx)));

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
   Run logic
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

function confirmArriveDialog(task){
  confirmModal("到着確認", `「${taskShort(task)}」を完了にしますか？`, "到着", () => completeRunTask());
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

  const from = (ts.fromHHMM || "").trim();
  const to = (ts.toHHMM || "").trim();
  const now = new Date();

  const start = parseHHMMToDate(from, now) || new Date(now);
  let end = parseHHMMToDate(to, now);

  if (!end) end = new Date(start.getTime() + 30*60*1000);
  if (end.getTime() <= start.getTime()) end.setDate(end.getDate() + 1);

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

  if (cur.kind === "study" && cur.ranges && cur.ranges.length > 0){
    if (!cur.rangeSteps){
      cur.rangeSteps = computeRangeSteps(cur.ranges);
      cur.rangeDone = [];
      saveState();
    }
    if (!cur.rangeDone) cur.rangeDone = [];

    const total = cur.rangeSteps.length;
    const done = cur.rangeDone.length;

    nowRangesWrap.hidden = false;
    btnRangeAllDone.hidden = false;
    rangeProgressTitle.textContent = `範囲 ${done}/${total}`;

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
    btnRangeAllDone.hidden = true;
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

      confirmArriveDialog(cur);
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

  editDurationTouched = false;

  if (t.kind === "study"){
    editStudyBlock.hidden = false;
    editLifeBlock.hidden = true;
    openEditStudy(t);
  } else {
    editStudyBlock.hidden = true;
    editLifeBlock.hidden = false;
    openEditLife(t);
  }

  const mode = t.timeSpec?.mode || "duration";
  setRadio("editTimeMode", mode);
  syncEditTimeModeUI();

  if (mode === "duration"){
    editDurationMin.value = String(t.timeSpec.durationMin || 30);
    editDurationTouched = true; // ★開いた瞬間に勝手に自動上書きされないように
  } else {
    editFromTime.value = (t.timeSpec.fromHHMM || "");
    editToTime.value = (t.timeSpec.toHHMM || "");
  }

  updateAutoDurationEdit();

  editModal.hidden = false;
}

function closeEditModal(){
  editModal.hidden = true;
  editCtx = null;
}

function openEditStudy(t){
  initCategorySelect(editCategory);
  editCategory.value = t.category || "";

  syncEditSubjectSelect(t);
  syncEditTaskSelect(t);

  editRangesList.innerHTML = "";
  const ranges = Array.isArray(t.ranges) ? t.ranges : [];
  if (ranges.length === 0) addRangeRow(editRangesList);
  else ranges.forEach(r => addRangeRow(editRangesList, r));
}

function openEditLife(t){
  initLifeSelect(editLifeTaskType);
  editLifeTaskType.value = LIFE_OPTIONS.includes(t.task) ? t.task : "自由入力";
  editLifeTaskFreeWrap.hidden = (editLifeTaskType.value !== "自由入力");
  editLifeTaskFree.value = (editLifeTaskType.value === "自由入力") ? (t.task || "") : "";
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
  if (cat !== "その他") return (editSubject.value || "").trim();
  const typed = (editOtherSubject.value || "").trim();
  return typed ? typed : "その他";
}

function resolveEditTaskType(){
  const raw = (editTaskType.value || "").trim();
  if (!raw) return "";
  if (raw !== "自由入力") return raw;
  return (editTaskFree.value || "").trim();
}

function resolveEditLifeTask(){
  const raw = (editLifeTaskType.value || "").trim();
  if (!raw) return "";
  if (raw !== "自由入力") return raw;
  return (editLifeTaskFree.value || "").trim();
}

function syncEditTaskSelect(existingTask){
  const subj = resolveEditSubject();

  editTaskType.innerHTML = "";
  addOpt(editTaskType, "", "—");

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
  editDurationWrap.hidden = (mode !== "duration");
  editUntilWrap.hidden = (mode !== "until");
}

function updateAutoDurationEdit(){
  if (!editCtx) return;

  const { line, where, index } = editCtx;
  const ls = getLineState(line);
  const arr = where === "queue" ? ls.queue : ls.done;
  const t = arr[index];
  if (!t) return;

  const mode = radioValue("editTimeMode");
  if (mode !== "duration"){
    editAutoHint.hidden = true;
    return;
  }

  if (t.kind === "study"){
    const subj = resolveEditSubject();
    const taskType = resolveEditTaskType();
    const ranges = readRanges(editRangesList);

    const auto = computeAutoDurationMin(subj, taskType, ranges);
    if (auto == null){
      editAutoHint.hidden = true;
      return;
    }

    editAutoHint.hidden = false;
    editAutoHint.textContent = `推奨: ${auto}分`;

    if (!editDurationTouched){
      suppressEditTouch = true;
      editDurationMin.value = String(auto);
      suppressEditTouch = false;
    }
    return;
  }

  if (t.kind === "life"){
    const task = resolveEditLifeTask();
    const auto = LIFE_AUTO_MIN[task];

    if (auto == null){
      editAutoHint.hidden = true;
      return;
    }

    editAutoHint.hidden = false;
    editAutoHint.textContent = `推奨: ${auto}分`;

    if (!editDurationTouched){
      suppressEditTouch = true;
      editDurationMin.value = String(auto);
      suppressEditTouch = false;
    }
    return;
  }

  editAutoHint.hidden = true;
}

function saveEdit(){
  const { line, where, index } = editCtx;
  const ls = getLineState(line);
  const arr = where === "queue" ? ls.queue : ls.done;
  const t = arr[index];
  if (!t) return;

  const mode = radioValue("editTimeMode") || "duration";
  let timeSpec;
  if (mode === "duration"){
    const d = Math.max(1, parseInt(editDurationMin.value || "1", 10));
    timeSpec = { mode:"duration", durationMin: d };
  } else {
    timeSpec = { mode:"until", fromHHMM: (editFromTime.value||""), toHHMM: (editToTime.value||"") };
  }

  if (t.kind === "study"){
    const cat = (editCategory.value || "").trim();
    if (!cat){ alert("系を選んでください"); return; }

    const subject = resolveEditSubject();
    if (cat !== "その他" && !subject){ alert("科目を選んでください"); return; }

    const rawTask = (editTaskType.value || "").trim();
    if (!rawTask){ alert("タスク内容を選んでください"); return; }
    const free = (editTaskFree.value || "").trim();
    const taskType = (rawTask === "自由入力") ? (free || "自由入力") : rawTask;

    const ranges = readRanges(editRangesList);
    const rangeSteps = computeRangeSteps(ranges);

    arr[index] = sanitizeTask({
      ...t,
      category: cat,
      subject,
      taskType,
      ranges,
      rangeSteps,
      rangeDone: [],
      timeSpec,
    });

    if (state.run.line === line) stopRunTimer();
  } else {
    const raw = (editLifeTaskType.value || "").trim();
    if (!raw){ alert("内容を選んでください"); return; }
    const free = (editLifeTaskFree.value || "").trim();
    const task = (raw === "自由入力") ? (free || "自由入力") : raw;

    arr[index] = sanitizeTask({ ...t, task, timeSpec });

    if (state.run.line === line) stopRunTimer();
  }

  saveState();
  renderAll();
  closeEditModal();
}

/* =========================
   Share export/import
========================= */
async function shareExport(){
  const portable = makePortableState();
  const code = btoa(unescape(encodeURIComponent(JSON.stringify(portable))));

  try{
    await navigator.clipboard.writeText(code);
  }catch{
    // ignore
  }

  prompt("共有コード（コピーして「共有読込」に貼り付け）", code);
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
