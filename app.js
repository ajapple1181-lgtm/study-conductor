/* =========================
   STUDY / LIFE Conductor
   - build不要、GitHub Pages向け
   - localStorageに保存
========================= */

const LS_KEY = "conductor.v1";

const COLORS = {
  "国語系": getCssVar("--pink"),
  "数学系": getCssVar("--blue"),
  "英語系": getCssVar("--purple"),
  "理科系": getCssVar("--green"),
  "社会系": getCssVar("--yellow"),
  "その他": getCssVar("--gray"),
};

const STUDY_MAP = {
  "国語系": ["論国", "古典"],
  "数学系": ["数学Ⅱ", "数学C"],
  "英語系": ["英C", "論表"],
  "理科系": ["化学", "生物"],
  "社会系": ["地理", "公共"],
  "その他": ["（自由入力）"],
};

let state = loadState();
let tickTimer = null;

/* ---------- DOM ---------- */
const $ = (q) => document.querySelector(q);

const tabs = Array.from(document.querySelectorAll(".tab"));
const runStatePill = $("#runStatePill");
const clockText = $("#clockText");

const queueList = $("#queueList");
const doneList = $("#doneList");

const formTitle = $("#formTitle");
const studyForm = $("#studyForm");
const lifeForm = $("#lifeForm");

const studyCategory = $("#studyCategory");
const studySubject = $("#studySubject");
const studyOtherWrap = $("#studyOtherWrap");
const studyOtherSubject = $("#studyOtherSubject");
const studyTask = $("#studyTask");

const studyDurationWrap = $("#studyDurationWrap");
const studyUntilWrap = $("#studyUntilWrap");
const studyDurationMin = $("#studyDurationMin");
const studyUntilTime = $("#studyUntilTime");

const rangesList = $("#rangesList");
const btnAddRange = $("#btnAddRange");

const lifeTask = $("#lifeTask");
const lifeDurationWrap = $("#lifeDurationWrap");
const lifeUntilWrap = $("#lifeUntilWrap");
const lifeDurationMin = $("#lifeDurationMin");
const lifeUntilTime = $("#lifeUntilTime");

const nowSubject = $("#nowSubject");
const nowLineName = $("#nowLineName");
const nowTaskTitle = $("#nowTaskTitle");
const nowTaskDetail = $("#nowTaskDetail");
const nowRanges = $("#nowRanges");
const nowRangesList = $("#nowRangesList");

const timerText = $("#timerText");
const timerMeta = $("#timerMeta");

const btnStartPause = $("#btnStartPause");
const btnArrive = $("#btnArrive");
const btnSkip = $("#btnSkip");

const nextPreview = $("#nextPreview");

const btnClearDone = $("#btnClearDone");
const btnResetAll = $("#btnResetAll");

const modal = $("#modal");
const modalTitle = $("#modalTitle");
const modalText = $("#modalText");
const modalCancel = $("#modalCancel");
const modalOk = $("#modalOk");

/* ---------- init ---------- */
initCategorySelect();
syncSubjectSelect();
syncTimeModeUI("study");
syncTimeModeUI("life");

renderAll();
startClock();
startTickLoop();

/* ---------- events ---------- */
tabs.forEach((b) => {
  b.addEventListener("click", () => {
    const mode = b.dataset.mode;
    setMode(mode);
  });
});

studyCategory.addEventListener("change", () => {
  syncSubjectSelect();
  renderAll();
});

studySubject.addEventListener("change", () => {
  const isOther = isOtherSelected();
  studyOtherWrap.hidden = !isOther;
});

document.querySelectorAll("input[name=studyTimeMode]").forEach((r) => {
  r.addEventListener("change", () => syncTimeModeUI("study"));
});
document.querySelectorAll("input[name=lifeTimeMode]").forEach((r) => {
  r.addEventListener("change", () => syncTimeModeUI("life"));
});

btnAddRange.addEventListener("click", () => addRangeRow());

studyForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addStudyTaskFromForm();
});

lifeForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addLifeTaskFromForm();
});

btnStartPause.addEventListener("click", () => {
  const cur = getCurrentTask();
  if (!cur) return;

  if (!state.run.isRunning) {
    // 初回発車：endAt未設定なら設定
    if (!state.run.endAt) {
      const endAt = computeEndAtFromTask(cur);
      state.run.endAt = endAt;
    }
    state.run.isRunning = true;
  } else {
    // 一時停止：残り時間を保持するため endAt をズラす
    // pause時点のremainingを保存し、再開時にendAtを再計算
    state.run.isRunning = false;
    state.run.remainingOnPauseMs = Math.max(0, state.run.endAt - Date.now());
  }

  if (!state.run.isRunning && state.run.remainingOnPauseMs != null) {
    // UIだけ更新
  } else if (state.run.isRunning && state.run.remainingOnPauseMs != null) {
    // 再開：pause分を反映
    state.run.endAt = Date.now() + state.run.remainingOnPauseMs;
    state.run.remainingOnPauseMs = null;
  }

  saveState();
  renderAll();
});

btnArrive.addEventListener("click", () => {
  const cur = getCurrentTask();
  if (!cur) return;

  openModal({
    title: "到着確認",
    text: `「${formatTaskShort(cur)}」を完了にしますか？`,
    okText: "到着（完了）",
    onOk: () => completeCurrentTask(),
  });
});

btnSkip.addEventListener("click", () => {
  const cur = getCurrentTask();
  if (!cur) return;

  openModal({
    title: "次へ確認",
    text: `「${formatTaskShort(cur)}」をスキップして次へ進みますか？`,
    okText: "次へ",
    onOk: () => skipCurrentTask(),
  });
});

btnClearDone.addEventListener("click", () => {
  openModal({
    title: "確認",
    text: "完了ログを消しますか？",
    okText: "消去",
    onOk: () => {
      getModeState().done = [];
      saveState();
      renderAll();
    },
  });
});

btnResetAll.addEventListener("click", () => {
  openModal({
    title: "最終確認",
    text: "全データを初期化しますか？（運行表・完了ログ・タイマー全部）",
    okText: "初期化",
    onOk: () => {
      state = defaultState();
      saveState();
      renderAll();
    },
  });
});

modalCancel.addEventListener("click", closeModal);
modalOk.addEventListener("click", () => {
  if (modalOk._onOk) modalOk._onOk();
  closeModal();
});

/* =========================
   functions
========================= */
function defaultState(){
  return {
    mode: "study",
    study: { queue: [], done: [] },
    life:  { queue: [], done: [] },
    run: {
      currentId: null,
      isRunning: false,
      endAt: null,
      remainingOnPauseMs: null,
      notifiedZero: false,
    }
  };
}

function loadState(){
  try{
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);

    // マイグレーション対策
    return {
      ...defaultState(),
      ...parsed,
      study: { ...defaultState().study, ...(parsed.study||{}) },
      life:  { ...defaultState().life,  ...(parsed.life||{}) },
      run:   { ...defaultState().run,   ...(parsed.run||{}) },
    };
  }catch{
    return defaultState();
  }
}

function saveState(){
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}

function getModeState(){
  return state.mode === "study" ? state.study : state.life;
}

function setMode(mode){
  state.mode = mode;

  tabs.forEach(t => t.classList.toggle("is-active", t.dataset.mode === mode));
  tabs.forEach(t => t.setAttribute("aria-selected", t.dataset.mode === mode ? "true" : "false"));

  // タイマーはモードごとに共通運転（=今見てる線の先頭を運転）
  // なので mode切り替え時は currentId をその線の先頭に合わせる（実運用っぽく）
  const ms = getModeState();
  if (ms.queue.length === 0) {
    state.run.currentId = null;
    stopRun();
  } else {
    state.run.currentId = ms.queue[0].id;
    stopRun(); // モード切り替え=運転リセット
  }

  saveState();
  renderAll();
}

function stopRun(){
  state.run.isRunning = false;
  state.run.endAt = null;
  state.run.remainingOnPauseMs = null;
  state.run.notifiedZero = false;
}

function initCategorySelect(){
  // options
  const cats = Object.keys(STUDY_MAP);
  studyCategory.innerHTML = "";
  cats.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    studyCategory.appendChild(opt);
  });

  // 前回選択があれば復元っぽく（mode依存しない簡易）
  studyCategory.value = "数学系";
}

function syncSubjectSelect(){
  const cat = studyCategory.value;
  const subs = STUDY_MAP[cat] || [];
  studySubject.innerHTML = "";
  subs.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s;
    studySubject.appendChild(opt);
  });

  const isOther = isOtherSelected();
  studyOtherWrap.hidden = !isOther;
}

function isOtherSelected(){
  return studyCategory.value === "その他" && studySubject.value === "（自由入力）";
}

function syncTimeModeUI(kind){
  if (kind === "study"){
    const mode = getRadioValue("studyTimeMode");
    studyDurationWrap.hidden = mode !== "duration";
    studyUntilWrap.hidden = mode !== "until";
  } else {
    const mode = getRadioValue("lifeTimeMode");
    lifeDurationWrap.hidden = mode !== "duration";
    lifeUntilWrap.hidden = mode !== "until";
  }
}

function addRangeRow(prefill){
  const row = document.createElement("div");
  row.className = "rangeRow";

  row.innerHTML = `
    <select class="rangeType">
      <option value="page">ページ</option>
      <option value="prob">問題</option>
    </select>
    <input class="rangeStart" type="text" placeholder="開始 (例 12 / 3)" />
    <input class="rangeEnd" type="text" placeholder="終了 (例 18 / 10)" />
    <button type="button" class="rangeDel">×</button>
  `;

  const del = row.querySelector(".rangeDel");
  del.addEventListener("click", () => row.remove());

  if (prefill){
    row.querySelector(".rangeType").value = prefill.type || "page";
    row.querySelector(".rangeStart").value = prefill.start || "";
    row.querySelector(".rangeEnd").value = prefill.end || "";
  }

  rangesList.appendChild(row);
}

function readRangesFromUI(){
  const rows = Array.from(rangesList.querySelectorAll(".rangeRow"));
  const ranges = rows.map(r => ({
    type: r.querySelector(".rangeType").value,
    start: (r.querySelector(".rangeStart").value || "").trim(),
    end: (r.querySelector(".rangeEnd").value || "").trim(),
  })).filter(x => x.start || x.end);

  return ranges;
}

function addStudyTaskFromForm(){
  const cat = studyCategory.value;
  let subj = studySubject.value;

  if (isOtherSelected()){
    const other = (studyOtherSubject.value || "").trim();
    subj = other ? other : "その他";
  }

  const task = (studyTask.value || "").trim();
  const ranges = readRangesFromUI();

  const timeMode = getRadioValue("studyTimeMode");
  const timeSpec = readTimeSpec(timeMode, studyDurationMin.value, studyUntilTime.value);

  const t = {
    id: uid(),
    kind: "study",
    category: cat,
    subject: subj,
    color: COLORS[cat] || COLORS["その他"],
    task,
    ranges,
    timeMode,
    timeSpec, // {mode, durationMin? , untilHHMM?}
    createdAt: Date.now(),
  };

  state.study.queue.push(t);

  // 先頭が未運転なら currentId を合わせる
  if (state.mode === "study" && !state.run.currentId){
    state.run.currentId = t.id;
  }

  // フォーム軽く初期化（範囲は残す/消す好みがあるので一旦消す）
  studyTask.value = "";
  rangesList.innerHTML = "";
  addRangeRow();

  saveState();
  renderAll();
}

function addLifeTaskFromForm(){
  const task = (lifeTask.value || "").trim();

  const timeMode = getRadioValue("lifeTimeMode");
  const timeSpec = readTimeSpec(timeMode, lifeDurationMin.value, lifeUntilTime.value);

  const t = {
    id: uid(),
    kind: "life",
    category: "その他",
    subject: "生活",
    color: COLORS["その他"],
    task,
    ranges: [],
    timeMode,
    timeSpec,
    createdAt: Date.now(),
  };

  state.life.queue.push(t);

  if (state.mode === "life" && !state.run.currentId){
    state.run.currentId = t.id;
  }

  lifeTask.value = "";

  saveState();
  renderAll();
}

function readTimeSpec(mode, durationMinRaw, untilHHMM){
  if (mode === "duration"){
    const d = Math.max(1, parseInt(durationMinRaw || "1", 10));
    return { mode, durationMin: d };
  }
  // until
  const hhmm = (untilHHMM || "").trim();
  return { mode, untilHHMM: hhmm };
}

function computeEndAtFromTask(task){
  const now = new Date();
  if (task.timeSpec.mode === "duration"){
    const ms = task.timeSpec.durationMin * 60 * 1000;
    return Date.now() + ms;
  }

  // until HH:MM
  const hhmm = task.timeSpec.untilHHMM;
  if (!hhmm){
    // 未入力ならデフォで30分
    return Date.now() + 30*60*1000;
  }
  const [hh, mm] = hhmm.split(":").map(x => parseInt(x,10));
  const end = new Date(now);
  end.setHours(hh, mm, 0, 0);

  // もし過去なら翌日に回す（「次の日まで」運用）
  if (end.getTime() <= now.getTime()){
    end.setDate(end.getDate() + 1);
  }
  return end.getTime();
}

function getCurrentTask(){
  const ms = getModeState();
  if (ms.queue.length === 0) return null;

  // currentId が無ければ先頭
  if (!state.run.currentId) {
    state.run.currentId = ms.queue[0].id;
    saveState();
  }

  const found = ms.queue.find(t => t.id === state.run.currentId);
  return found || ms.queue[0];
}

function completeCurrentTask(){
  const ms = getModeState();
  const cur = getCurrentTask();
  if (!cur) return;

  // doneへ
  ms.done.unshift({
    ...cur,
    completedAt: Date.now(),
  });

  // queueから削除
  ms.queue = ms.queue.filter(t => t.id !== cur.id);

  // 次へ
  if (ms.queue.length > 0){
    state.run.currentId = ms.queue[0].id;
  } else {
    state.run.currentId = null;
  }

  stopRun();
  saveState();
  renderAll();
}

function skipCurrentTask(){
  const ms = getModeState();
  const cur = getCurrentTask();
  if (!cur) return;

  // 先頭にいる想定で、先頭を末尾へ送る（運行っぽく）
  const idx = ms.queue.findIndex(t => t.id === cur.id);
  if (idx >= 0){
    const [x] = ms.queue.splice(idx, 1);
    ms.queue.push(x);
  }

  // 次は先頭
  if (ms.queue.length > 0){
    state.run.currentId = ms.queue[0].id;
  } else {
    state.run.currentId = null;
  }

  stopRun();
  saveState();
  renderAll();
}

function deleteTask(id){
  const ms = getModeState();
  ms.queue = ms.queue.filter(t => t.id !== id);
  if (state.run.currentId === id){
    state.run.currentId = ms.queue[0]?.id || null;
    stopRun();
  }
  saveState();
  renderAll();
}

function moveTask(id, dir){
  const ms = getModeState();
  const i = ms.queue.findIndex(t => t.id === id);
  if (i < 0) return;
  const j = i + dir;
  if (j < 0 || j >= ms.queue.length) return;
  const tmp = ms.queue[i];
  ms.queue[i] = ms.queue[j];
  ms.queue[j] = tmp;

  // 先頭が変わったらcurrentIdも合わせる（運転士っぽい）
  state.run.currentId = ms.queue[0].id;
  stopRun();

  saveState();
  renderAll();
}

function renderAll(){
  // mode UI
  tabs.forEach(t => t.classList.toggle("is-active", t.dataset.mode === state.mode));
  nowLineName.textContent = state.mode === "study" ? "STUDY LINE" : "LIFE LINE";
  formTitle.textContent = state.mode === "study" ? "新規タスク（勉強）" : "新規タスク（生活）";
  studyForm.hidden = state.mode !== "study";
  lifeForm.hidden = state.mode !== "life";

  // 色（現在タスク基準）
  const cur = getCurrentTask();
  applyAccent(cur?.color || COLORS["その他"]);

  // 運行表
  renderQueue();

  // 完了ログ
  renderDone();

  // 運転席
  renderDriver();

  // 走行状態
  renderRunState();
}

function renderQueue(){
  const ms = getModeState();
  queueList.innerHTML = "";

  if (ms.queue.length === 0){
    const li = document.createElement("li");
    li.style.color = "rgba(255,255,255,.65)";
    li.style.fontWeight = "900";
    li.style.padding = "10px";
    li.textContent = "（運行表は空です）";
    queueList.appendChild(li);
    return;
  }

  ms.queue.forEach((t, idx) => {
    const li = document.createElement("li");
    li.className = "queueItem";
    li.style.setProperty("--accent", t.color);

    const main = document.createElement("div");
    main.className = "queueItem__main";

    const title = document.createElement("div");
    title.className = "queueItem__title";
    title.textContent = `${idx===0 ? "▶ " : ""}${formatTaskShort(t)}`;

    const meta = document.createElement("div");
    meta.className = "queueItem__meta";
    meta.textContent = formatTimeSpec(t.timeSpec);

    main.appendChild(title);
    main.appendChild(meta);

    const btns = document.createElement("div");
    btns.className = "queueItem__btns";

    const up = mkMiniBtn("↑", () => moveTask(t.id, -1));
    const down = mkMiniBtn("↓", () => moveTask(t.id, +1));
    const del = mkMiniBtn("削", () => deleteTask(t.id));

    // 先頭だけ強調（シンプル）
    if (idx === 0){
      li.style.borderLeftColor = t.color;
      li.style.boxShadow = `0 0 0 2px rgba(255,255,255,.05) inset`;
    }

    btns.appendChild(up);
    btns.appendChild(down);
    btns.appendChild(del);

    li.appendChild(main);
    li.appendChild(btns);

    queueList.appendChild(li);
  });
}

function renderDone(){
  const ms = getModeState();
  doneList.innerHTML = "";
  if (ms.done.length === 0){
    const li = document.createElement("li");
    li.textContent = "（まだありません）";
    li.style.color = "rgba(255,255,255,.65)";
    li.style.fontWeight = "900";
    li.style.padding = "10px";
    doneList.appendChild(li);
    return;
  }

  ms.done.slice(0, 30).forEach(t => {
    const li = document.createElement("li");
    li.textContent = `${formatHHMM(new Date(t.completedAt))}  ${formatTaskShort(t)}`;
    doneList.appendChild(li);
  });
}

function renderDriver(){
  const ms = getModeState();
  const cur = getCurrentTask();

  if (!cur){
    nowSubject.textContent = "—";
    nowTaskTitle.textContent = "待機中";
    nowTaskDetail.textContent = "運行表にタスクを追加してください";
    timerText.textContent = "--:--";
    timerMeta.textContent = "";
    nowRanges.hidden = true;
    nextPreview.textContent = "—";
    return;
  }

  nowSubject.textContent = (cur.kind === "study") ? cur.subject : "生活";
  nowTaskTitle.textContent = cur.kind === "study" ? cur.task : cur.task;
  nowTaskDetail.textContent =
    cur.kind === "study"
      ? `${cur.category} / ${cur.subject}`
      : `生活タスク`;

  // 範囲
  if (cur.kind === "study" && cur.ranges && cur.ranges.length > 0){
    nowRanges.hidden = false;
    nowRangesList.innerHTML = "";
    cur.ranges.forEach(r => {
      const li = document.createElement("li");
      li.textContent = formatRange(r);
      nowRangesList.appendChild(li);
    });
  } else {
    nowRanges.hidden = true;
  }

  // 次タスク
  if (ms.queue.length >= 2){
    nextPreview.textContent = formatTaskShort(ms.queue[1]);
  } else {
    nextPreview.textContent = "—";
  }

  // タイマー表示
  updateTimerUI();
}

function renderRunState(){
  const cur = getCurrentTask();
  const hasTask = !!cur;

  if (!hasTask){
    runStatePill.textContent = "待機";
    btnStartPause.textContent = "発車";
    return;
  }

  if (state.run.isRunning){
    runStatePill.textContent = "走行中";
    btnStartPause.textContent = "一時停止";
  } else {
    // endAtがあるなら停止（残あり）
    runStatePill.textContent = state.run.endAt ? "停止中" : "準備";
    btnStartPause.textContent = state.run.endAt ? "再発車" : "発車";
  }
}

function updateTimerUI(){
  const cur = getCurrentTask();
  if (!cur){
    timerText.textContent = "--:--";
    timerMeta.textContent = "";
    return;
  }

  // endAtが未設定なら表示は時間仕様だけ
  if (!state.run.endAt){
    timerText.textContent = formatPlannedTime(cur.timeSpec);
    timerMeta.textContent = "未発車";
    return;
  }

  const now = Date.now();
  const remain = Math.max(0, state.run.endAt - now);
  timerText.textContent = formatMMSS(remain);

  // meta: 到着予定（時計）
  const end = new Date(state.run.endAt);
  timerMeta.textContent = `到着 ${formatHHMM(end)}`;

  if (remain === 0){
    // 0到達通知（1回だけ）
    if (!state.run.notifiedZero){
      state.run.notifiedZero = true;
      state.run.isRunning = false;
      saveState();

      openModal({
        title: "到着",
        text: `「${formatTaskShort(cur)}」の時間が終了しました。完了にして次へ進みますか？`,
        okText: "到着（完了）",
        onOk: () => completeCurrentTask(),
      });
    }
  }
}

function startTickLoop(){
  if (tickTimer) clearInterval(tickTimer);
  tickTimer = setInterval(() => {
    if (state.run.isRunning && state.run.endAt){
      updateTimerUI();
    } else {
      // 走行してなくてもUIを軽く更新（表示だけ）
      updateTimerUI();
    }
  }, 250);
}

function startClock(){
  const tick = () => {
    const d = new Date();
    clockText.textContent = formatHHMM(d);
  };
  tick();
  setInterval(tick, 1000);
}

/* ---------- modal ---------- */
function openModal({title, text, okText="OK", onOk}){
  modalTitle.textContent = title;
  modalText.textContent = text;
  modalOk.textContent = okText;
  modalOk._onOk = onOk;
  modal.hidden = false;
}
function closeModal(){
  modal.hidden = true;
  modalOk._onOk = null;
}

/* ---------- helpers ---------- */
function uid(){
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function mkMiniBtn(txt, onClick){
  const b = document.createElement("button");
  b.className = "btn btn--ghost";
  b.style.padding = "10px 12px";
  b.style.borderRadius = "14px";
  b.style.fontSize = "12px";
  b.textContent = txt;
  b.addEventListener("click", onClick);
  return b;
}

function formatTaskShort(t){
  if (t.kind === "study"){
    return `${t.subject}｜${t.task}`;
  }
  return `生活｜${t.task}`;
}

function formatRange(r){
  const label = r.type === "prob" ? "問" : "p";
  const a = r.start || "";
  const b = r.end || "";
  if (a && b) return `${label}${a}–${b}`;
  if (a) return `${label}${a}～`;
  if (b) return `～${label}${b}`;
  return "（範囲）";
}

function formatTimeSpec(ts){
  if (ts.mode === "duration"){
    return `所要 ${ts.durationMin}分`;
  }
  return `～ ${ts.untilHHMM || "（未設定）"}`;
}

function formatPlannedTime(ts){
  // 未発車表示用
  if (ts.mode === "duration") return `${ts.durationMin}分`;
  return `～${ts.untilHHMM || "--:--"}`;
}

function formatMMSS(ms){
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

function formatHHMM(d){
  const hh = String(d.getHours()).padStart(2,"0");
  const mm = String(d.getMinutes()).padStart(2,"0");
  return `${hh}:${mm}`;
}

function getRadioValue(name){
  const el = document.querySelector(`input[name="${name}"]:checked`);
  return el ? el.value : null;
}

function applyAccent(color){
  document.documentElement.style.setProperty("--accent", color);
  // accent2 も薄く調整（色そのままは難しいので固定の透明度で）
  // （ここはシンプルに：CSS側で--accent2はrgba固定でもOK）
}

function getCssVar(name){
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
                       }
