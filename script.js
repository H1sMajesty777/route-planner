// ============================================================
// КОНСТАНТЫ
// ============================================================

const ROLES = {
  tl:    { name: 'Тимлид',      color: '#ff6b9d' },
  arch:  { name: 'Архитектор',  color: '#f39c12' },
  back:  { name: 'Бэкенд',      color: '#2ecc71' },
  front: { name: 'Фронтенд',    color: '#5aa9ff' },
  qa:    { name: 'Тестировщик', color: '#a855f7' }
};

const CFG_KEY = 'planner-github-config';
const LOCAL_KEY = 'planner-state';
const DEFAULT_REPO = { user: 'H1sMajesty777', repo: 'route-planner', branch: 'main' };
const POLL_INTERVAL = 30000;

const FALLBACK_DATA = {
  project: {
    title: 'Route Planner — Календарь разработки',
    subtitle: '05 октября 2026 — 06 декабря 2026 · 9 недель · 5 ролей',
    startDate: '2026-10-05',
    endDate: '2026-12-06'
  },
  checkpoints: [
    { date: '2026-10-05', name: 'КТ-1: ТЗ, архитектура, дизайн' },
    { date: '2026-10-31', name: 'КТ-2: Бэкенд' },
    { date: '2026-11-14', name: 'КТ-3: Фронтенд' },
    { date: '2026-12-05', name: 'КТ-4: Демонстрация проекта' }
  ],
  saturdays: [
    '2026-10-10', '2026-10-17', '2026-10-24',
    '2026-11-07', '2026-11-21', '2026-11-28'
  ],
  tasks: [],
  taskStatus: {},
  notes: {},
  rolesFilter: { tl: true, arch: true, back: true, front: true, qa: true },
  updatedAt: null
};

// ============================================================
// СОСТОЯНИЕ
// ============================================================

let state = JSON.parse(JSON.stringify(FALLBACK_DATA));
let config = { user: '', repo: '', branch: 'main', token: '' };
let fileSha = null;
let isSaving = false;
let isReadOnly = false;
let pollTimer = null;
let lastKnownUpdatedAt = null;
let currentDate = null;

// ============================================================
// УТИЛИТЫ
// ============================================================

function getTasks() {
  return (state.tasks && state.tasks.length) ? state.tasks : [];
}
function getCheckpoints() {
  return (state.checkpoints && state.checkpoints.length) ? state.checkpoints : [];
}
function getSaturdays() {
  return state.saturdays || [];
}
function getProject() {
  return state.project || FALLBACK_DATA.project;
}
function taskKey(t) {
  return `${t.date}_${t.role}_${t.text}`;
}
function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}
function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function parseDate(str) {
  return new Date(str + 'T00:00:00');
}
function setSync(cls, text) {
  const dot = document.getElementById('sync-dot');
  const txt = document.getElementById('sync-text');
  if (dot) dot.className = 'sync-dot ' + cls;
  if (txt) txt.textContent = text;
}
function applyProjectMeta() {
  const p = getProject();
  const subtitle = document.querySelector('.page-header .subtitle');
  if (subtitle) subtitle.textContent = p.subtitle;
}

// ============================================================
// НАСТРОЙКИ
// ============================================================

function loadConfig() {
  try {
    const s = localStorage.getItem(CFG_KEY);
    if (s) config = { ...config, ...JSON.parse(s) };
  } catch (e) {}
}
function saveConfig() {
  localStorage.setItem(CFG_KEY, JSON.stringify(config));
}
function openSettings() {
  document.getElementById('cfg-user').value = config.user;
  document.getElementById('cfg-repo').value = config.repo;
  document.getElementById('cfg-branch').value = config.branch;
  document.getElementById('cfg-token').value = config.token;
  document.getElementById('settings-modal').classList.add('active');
}
function closeSettings() {
  document.getElementById('settings-modal').classList.remove('active');
}
function saveSettings() {
  config.user = document.getElementById('cfg-user').value.trim();
  config.repo = document.getElementById('cfg-repo').value.trim();
  config.branch = document.getElementById('cfg-branch').value.trim() || 'main';
  config.token = document.getElementById('cfg-token').value.trim();
  saveConfig();
  closeSettings();
  loadFromGitHub();
}

// ============================================================
// GITHUB API / PAGES
// ============================================================

function apiUrl(path) {
  const user = config.user || DEFAULT_REPO.user;
  const repo = config.repo || DEFAULT_REPO.repo;
  return `https://api.github.com/repos/${user}/${repo}/contents/${path}`;
}

function pagesDataUrl() {
  const user = config.user || DEFAULT_REPO.user;
  const repo = config.repo || DEFAULT_REPO.repo;
  return `https://${user.toLowerCase()}.github.io/${repo}/data.json`;
}

async function loadFromGitHub(showToast = false) {
  setSync('syncing', 'Загрузка...');
  try {
    if (config.token) {
      isReadOnly = false;
      const branch = config.branch || DEFAULT_REPO.branch;
      const headers = {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${config.token}`
      };
      const res = await fetch(`${apiUrl('data.json')}?ref=${branch}&t=${Date.now()}`, { headers });
      if (res.status === 404) {
        state = JSON.parse(JSON.stringify(FALLBACK_DATA));
        fileSha = null;
      } else if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      } else {
        const data = await res.json();
        fileSha = data.sha;
        const decoded = decodeURIComponent(escape(atob(data.content.replace(/\n/g, ''))));
        const remote = JSON.parse(decoded);
        const incoming = { ...JSON.parse(JSON.stringify(FALLBACK_DATA)), ...remote };
        delete incoming.rolesFilter;
        state = { ...state, ...incoming };
      }
    } else {
      isReadOnly = true;
      const res = await fetch(`${pagesDataUrl()}?t=${Date.now()}`, {
        headers: { 'Accept': 'application/json' }
      });
      if (res.status === 404) {
        state = JSON.parse(JSON.stringify(FALLBACK_DATA));
      } else if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      } else {
        const remote = await res.json();
        const incoming = { ...JSON.parse(JSON.stringify(FALLBACK_DATA)), ...remote };
        delete incoming.rolesFilter;
        state = { ...state, ...incoming };
      }
      fileSha = null;
    }

    lastKnownUpdatedAt = state.updatedAt;
    applyProjectMeta();
    renderCalendar();
    updateProgress();
    updateReadOnlyUI();
    setSync('', isReadOnly ? 'Режим просмотра' : 'Синхронизировано');
    if (showToast) console.log('Обновлено');
  } catch (e) {
    console.error(e);
    setSync('error', 'Ошибка загрузки');
  }
}

async function saveToGitHub() {
  if (isReadOnly) {
    alert('Режим просмотра. Введи токен в настройках, чтобы сохранять изменения.');
    return;
  }
  if (isSaving) return;
  if (!config.token) {
    alert('Настрой GitHub в разделе «Настроить GitHub»');
    openSettings();
    return;
  }

  isSaving = true;
  const saveBtn = document.getElementById('save-btn');
  if (saveBtn) saveBtn.disabled = true;
  setSync('syncing', 'Сохранение...');

  try {
    state.updatedAt = new Date().toISOString();

    // rolesFilter не отправляем в data.json — он локальный
    const stateToSave = { ...state };
    delete stateToSave.rolesFilter;

    const content = btoa(unescape(encodeURIComponent(JSON.stringify(stateToSave, null, 2))));
    const branch = config.branch || DEFAULT_REPO.branch;

    const body = {
      message: `Обновление календаря — ${new Date().toLocaleString('ru-RU')}`,
      content: content,
      branch: branch
    };
    if (fileSha) body.sha = fileSha;

    const res = await fetch(apiUrl('data.json'), {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (res.status === 409) {
      alert('Кто-то изменил данные раньше тебя. Сейчас подтянем свежую версию.');
      await loadFromGitHub();
      return;
    }
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`HTTP ${res.status}: ${err}`);
    }

    const result = await res.json();
    fileSha = result.content.sha;
    lastKnownUpdatedAt = state.updatedAt;
    setSync('', 'Сохранено ✓');
    setTimeout(() => setSync('', 'Синхронизировано'), 2000);
  } catch (e) {
    console.error(e);
    setSync('error', 'Ошибка сохранения');
    alert('Не удалось сохранить: ' + e.message);
  } finally {
    isSaving = false;
    if (saveBtn) saveBtn.disabled = false;
  }
}

// ============================================================
// READ-ONLY
// ============================================================

function updateReadOnlyUI() {
  const saveBtn = document.getElementById('save-btn');
  const addBtn = document.getElementById('add-task-btn');
  const datesBtn = document.getElementById('dates-btn');

  if (isReadOnly) {
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = '🔒 Только просмотр';
    }
    if (addBtn) addBtn.style.display = 'none';
    if (datesBtn) datesBtn.style.display = 'none';
  } else {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = '💾 Сохранить на GitHub';
    }
    if (addBtn) addBtn.style.display = '';
    if (datesBtn) datesBtn.style.display = '';
  }
}

// ============================================================
// АВТООБНОВЛЕНИЕ
// ============================================================

function startPolling() {
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = setInterval(async () => {
    if (isSaving) return;
    try {
      let remote;
      let newSha = null;

      if (config.token) {
        const branch = config.branch || DEFAULT_REPO.branch;
        const headers = {
          'Accept': 'application/vnd.github+json',
          'Authorization': `Bearer ${config.token}`
        };
        const res = await fetch(`${apiUrl('data.json')}?ref=${branch}&t=${Date.now()}`, { headers });
        if (!res.ok) return;
        const data = await res.json();
        newSha = data.sha;
        const decoded = decodeURIComponent(escape(atob(data.content.replace(/\n/g, ''))));
        remote = JSON.parse(decoded);
      } else {
        const res = await fetch(`${pagesDataUrl()}?t=${Date.now()}`, {
          headers: { 'Accept': 'application/json' }
        });
        if (!res.ok) return;
        remote = await res.json();
      }

      if (remote.updatedAt && remote.updatedAt !== lastKnownUpdatedAt) {
        fileSha = newSha;
        const incoming = { ...JSON.parse(JSON.stringify(FALLBACK_DATA)), ...remote };
        delete incoming.rolesFilter;
        state = { ...state, ...incoming };
        lastKnownUpdatedAt = remote.updatedAt;
        applyProjectMeta();
        renderCalendar();
        updateProgress();
        if (currentDate) openModal(currentDate);
      }
    } catch (e) {}
  }, POLL_INTERVAL);
}

// ============================================================
// РЕНДЕР КАЛЕНДАРЯ
// ============================================================

function renderCalendar() {
  const grid = document.getElementById('days-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const project = getProject();
  const start = parseDate(project.startDate);
  const end = parseDate(project.endDate);

  const startDay = start.getDay();
  const offset = startDay === 0 ? 6 : startDay - 1;
  const cursor = new Date(start);
  cursor.setDate(cursor.getDate() - offset);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tasks = getTasks();
  const checkpoints = getCheckpoints();
  const saturdays = getSaturdays();

  while (cursor <= end) {
    const dateStr = formatDate(cursor);
    const dayEl = document.createElement('div');
    dayEl.className = 'day';

    if (cursor < start || cursor > end) {
      dayEl.classList.add('empty');
      dayEl.innerHTML = `<div class="day-number">${cursor.getDate()}</div>`;
    } else {
      if (dateStr === formatDate(today)) dayEl.classList.add('today');

      const isCheckpoint = checkpoints.find(c => c.date === dateStr);
      const isSaturday = saturdays.includes(dateStr);

      if (isCheckpoint) {
        dayEl.classList.add('checkpoint');
      } else if (isSaturday) {
        dayEl.classList.add('saturday');
      }

      const roleFilter = state.rolesFilter || {};
      const dayTasks = tasks.filter(t => t.date === dateStr && roleFilter[t.role] !== false);

      const tasksHtml = dayTasks.slice(0, 4).map(t => {
        const key = taskKey(t);
        const status = state.taskStatus[key] || 'pending';
        const role = ROLES[t.role] || { name: '—', color: '#999' };
        return `<div class="task-chip ${status}" title="${escapeHtml(role.name)}: ${escapeHtml(t.text)}">
          <span class="dot" style="background:${role.color}"></span>
          ${escapeHtml(t.text.substring(0, 20))}${t.text.length > 20 ? '…' : ''}
        </div>`;
      }).join('');

      const more = dayTasks.length > 4 ? `<div class="day-more">+${dayTasks.length - 4} ещё</div>` : '';

      dayEl.innerHTML = `
        <div class="day-number">${cursor.getDate()}</div>
        <div class="day-tasks">${tasksHtml}${more}</div>
      `;
      dayEl.onclick = () => openModal(dateStr);
    }
    grid.appendChild(dayEl);
    cursor.setDate(cursor.getDate() + 1);
  }
}

// ============================================================
// МОДАЛКА ДНЯ
// ============================================================

function openModal(dateStr) {
  currentDate = dateStr;
  const date = parseDate(dateStr);
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  const formatted = date.toLocaleDateString('ru-RU', options);
  document.getElementById('modal-title').textContent = formatted;

  const cp = getCheckpoints().find(c => c.date === dateStr);
  const subtitle = document.getElementById('modal-subtitle');
  if (subtitle) subtitle.textContent = cp ? '★ ' + cp.name : '';

  const tasks = getTasks().filter(t => t.date === dateStr);
  const countEl = document.getElementById('tasks-count');
  if (countEl) countEl.textContent = tasks.length;

  const container = document.getElementById('modal-tasks');

  if (tasks.length === 0) {
    container.innerHTML = '<div class="empty-state">Нет задач на этот день</div>';
  } else {
    container.innerHTML = tasks.map(t => {
      const key = taskKey(t);
      const status = state.taskStatus[key] || 'pending';
      const role = ROLES[t.role] || { name: '—', color: '#999' };
      const statusLabel = status === 'done' ? 'Выполнено'
                        : status === 'in-progress' ? 'В разработке'
                        : 'Не начато';

      const editBtns = isReadOnly ? '' : `
        <button class="task-action-btn" onclick="event.stopPropagation(); editTask('${encodeURIComponent(key)}')" title="Редактировать">✎</button>
        <button class="task-action-btn danger" onclick="event.stopPropagation(); deleteTask('${encodeURIComponent(key)}')" title="Удалить">🗑</button>
      `;

      return `
        <div class="modal-task ${status}">
          <input type="checkbox" ${status === 'done' ? 'checked' : ''} onchange="toggleTask('${encodeURIComponent(key)}')">
          <div class="modal-task-content" onclick="toggleTask('${encodeURIComponent(key)}')">
            <div class="modal-task-role" style="color:${role.color}">${escapeHtml(role.name)}</div>
            <div class="modal-task-text">${escapeHtml(t.text)}</div>
            <div class="modal-task-status">${statusLabel}</div>
          </div>
          <div class="modal-task-actions">${editBtns}</div>
        </div>
      `;
    }).join('');
  }

  document.getElementById('notes-area').value = state.notes[dateStr] || '';
  document.getElementById('modal').classList.add('active');
}

function closeModal() {
  document.getElementById('modal').classList.remove('active');
  currentDate = null;
}

function toggleTask(encodedKey) {
  if (isReadOnly) {
    alert('Режим просмотра. Изменения недоступны.');
    return;
  }
  const key = decodeURIComponent(encodedKey);
  const cur = state.taskStatus[key] || 'pending';
  const next = cur === 'pending' ? 'in-progress' : cur === 'in-progress' ? 'done' : 'pending';
  state.taskStatus[key] = next;
  renderCalendar();
  updateProgress();
  if (currentDate) openModal(currentDate);
  setSync('', 'Не забудь сохранить');
}

function saveNotes() {
  if (isReadOnly) {
    alert('Режим просмотра. Изменения недоступны.');
    return;
  }
  if (!currentDate) return;
  state.notes[currentDate] = document.getElementById('notes-area').value;
  closeModal();
  setSync('', 'Не забудь сохранить');
}

// ============================================================
// РЕДАКТИРОВАНИЕ ЗАДАЧ
// ============================================================

function editTask(encodedKey) {
  if (isReadOnly) {
    alert('Режим просмотра. Изменения недоступны.');
    return;
  }
  const key = decodeURIComponent(encodedKey);
  const tasks = getTasks();
  const task = tasks.find(t => taskKey(t) === key);
  if (!task) {
    alert('Задача не найдена');
    return;
  }
  document.getElementById('edit-modal-title').textContent = 'Редактирование задачи';
  document.getElementById('edit-original-key').value = key;
  document.getElementById('edit-text').value = task.text;
  document.getElementById('edit-date').value = task.date;
  document.getElementById('edit-role').value = task.role;
  document.getElementById('edit-stage').value = task.stage || 1;
  document.getElementById('edit-modal').classList.add('active');
}

function addTask(dateStr) {
  if (isReadOnly) {
    alert('Режим просмотра. Изменения недоступны.');
    return;
  }
  document.getElementById('edit-modal-title').textContent = 'Новая задача';
  document.getElementById('edit-original-key').value = '';
  document.getElementById('edit-text').value = '';
  document.getElementById('edit-date').value = dateStr || currentDate || formatDate(new Date());
  document.getElementById('edit-role').value = 'tl';
  document.getElementById('edit-stage').value = 1;
  document.getElementById('edit-modal').classList.add('active');
}

function closeEditModal() {
  document.getElementById('edit-modal').classList.remove('active');
}

function saveTaskForm() {
  if (isReadOnly) {
    alert('Режим просмотра. Изменения недоступны.');
    return;
  }
  const originalKey = document.getElementById('edit-original-key').value;
  const text = document.getElementById('edit-text').value.trim();
  const date = document.getElementById('edit-date').value;
  const role = document.getElementById('edit-role').value;
  const stage = parseInt(document.getElementById('edit-stage').value, 10);

  if (!text) { alert('Введите текст задачи'); return; }
  if (!date) { alert('Выберите дату'); return; }
  if (!role) { alert('Выберите роль'); return; }

  if (!state.tasks) state.tasks = getTasks().slice();

  if (originalKey) {
    const idx = state.tasks.findIndex(t => taskKey(t) === originalKey);
    if (idx === -1) { alert('Задача не найдена'); return; }
    const oldKey = originalKey;
    state.tasks[idx] = { date, role, text, stage };
    const newKey = taskKey(state.tasks[idx]);
    if (oldKey !== newKey && state.taskStatus[oldKey]) {
      state.taskStatus[newKey] = state.taskStatus[oldKey];
      delete state.taskStatus[oldKey];
    }
  } else {
    state.tasks.push({ date, role, text, stage });
  }

  state.tasks.sort((a, b) => a.date.localeCompare(b.date));
  closeEditModal();
  renderCalendar();
  updateProgress();
  if (currentDate) openModal(currentDate);
  setSync('', 'Не забудь сохранить');
}

function deleteTask(encodedKey) {
  if (isReadOnly) {
    alert('Режим просмотра. Изменения недоступны.');
    return;
  }
  const key = decodeURIComponent(encodedKey);
  if (!confirm('Удалить задачу?')) return;
  if (!state.tasks) state.tasks = getTasks().slice();
  state.tasks = state.tasks.filter(t => taskKey(t) !== key);
  delete state.taskStatus[key];
  renderCalendar();
  updateProgress();
  if (currentDate) openModal(currentDate);
  setSync('', 'Не забудь сохранить');
}

// ============================================================
// УПРАВЛЕНИЕ ДАТАМИ (СУББОТЫ И КТ)
// ============================================================

function openDatesModal() {
  if (isReadOnly) {
    alert('Режим просмотра. Изменения недоступны.');
    return;
  }
  renderDatesModal();
  document.getElementById('dates-modal').classList.add('active');
}

function closeDatesModal() {
  document.getElementById('dates-modal').classList.remove('active');
}

function renderDatesModal() {
  const saturdays = getSaturdays();
  const checkpoints = getCheckpoints();

  const satContainer = document.getElementById('saturdays-list');
  if (saturdays.length === 0) {
    satContainer.innerHTML = '<div class="dates-empty">Нет суббот</div>';
  } else {
    satContainer.innerHTML = saturdays.slice().sort().map(d => `
      <div class="date-row">
        <span class="date-label blue">★ ${d}</span>
        <button class="date-remove" onclick="removeSaturday('${d}')" title="Удалить">×</button>
      </div>
    `).join('');
  }

  const cpContainer = document.getElementById('checkpoints-list');
  if (checkpoints.length === 0) {
    cpContainer.innerHTML = '<div class="dates-empty">Нет контрольных точек</div>';
  } else {
    cpContainer.innerHTML = checkpoints.slice().sort((a, b) => a.date.localeCompare(b.date)).map(c => `
      <div class="date-row">
        <span class="date-label yellow">★ ${c.date} — ${escapeHtml(c.name)}</span>
        <button class="date-remove" onclick="removeCheckpoint('${c.date}')" title="Удалить">×</button>
      </div>
    `).join('');
  }
}

function addSaturday() {
  if (isReadOnly) return;
  const input = document.getElementById('new-saturday-date');
  const date = input.value;
  if (!date) {
    alert('Выберите дату');
    return;
  }
  if (!state.saturdays) state.saturdays = [];
  if (state.saturdays.includes(date)) {
    alert('Эта дата уже отмечена как суббота');
    return;
  }
  state.saturdays.push(date);
  state.saturdays.sort();
  input.value = '';
  renderDatesModal();
  renderCalendar();
  setSync('', 'Не забудь сохранить');
}

function removeSaturday(date) {
  if (isReadOnly) return;
  if (!state.saturdays) return;
  state.saturdays = state.saturdays.filter(d => d !== date);
  renderDatesModal();
  renderCalendar();
  setSync('', 'Не забудь сохранить');
}

function addCheckpoint() {
  if (isReadOnly) return;
  const dateInput = document.getElementById('new-checkpoint-date');
  const nameInput = document.getElementById('new-checkpoint-name');
  const date = dateInput.value;
  const name = nameInput.value.trim();

  if (!date) {
    alert('Выберите дату');
    return;
  }
  if (!name) {
    alert('Введите название КТ');
    return;
  }
  if (!state.checkpoints) state.checkpoints = [];
  if (state.checkpoints.find(c => c.date === date)) {
    alert('На эту дату уже есть КТ');
    return;
  }
  state.checkpoints.push({ date, name });
  state.checkpoints.sort((a, b) => a.date.localeCompare(b.date));
  dateInput.value = '';
  nameInput.value = '';
  renderDatesModal();
  renderCalendar();
  setSync('', 'Не забудь сохранить');
}

function removeCheckpoint(date) {
  if (isReadOnly) return;
  if (!state.checkpoints) return;
  state.checkpoints = state.checkpoints.filter(c => c.date !== date);
  renderDatesModal();
  renderCalendar();
  setSync('', 'Не забудь сохранить');
}

// ============================================================
// ПРОГРЕСС
// ============================================================

function updateProgress() {
  const tasks = getTasks();
  const total = tasks.length;
  const done = tasks.filter(t => state.taskStatus[taskKey(t)] === 'done').length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  document.getElementById('overall-percent').textContent = percent + '%';
  document.getElementById('overall-progress').style.width = percent + '%';
  document.getElementById('overall-done').textContent = done;
  document.getElementById('overall-total').textContent = total;

  [1, 2, 3, 4, 5].forEach(stage => {
    const el = document.getElementById(`stage${stage}-percent`);
    const bar = document.getElementById(`stage${stage}-progress`);
    if (!el || !bar) return;
    const st = tasks.filter(t => t.stage === stage);
    const sd = st.filter(t => state.taskStatus[taskKey(t)] === 'done').length;
    const p = st.length ? Math.round((sd / st.length) * 100) : 0;
    el.textContent = p + '%';
    bar.style.width = p + '%';
  });
}

// ============================================================
// СОБЫТИЯ И ИНИЦИАЛИЗАЦИЯ
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  const roleFilter = document.getElementById('role-filter');
  if (roleFilter) {
    // Синхронизируем чекбоксы с состоянием (по умолчанию всё включено)
    roleFilter.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      const role = cb.dataset.role;
      if (state.rolesFilter && state.rolesFilter[role] === false) {
        cb.checked = false;
      } else {
        cb.checked = true;
      }
    });

    roleFilter.addEventListener('change', (e) => {
      if (e.target.type === 'checkbox') {
        if (!state.rolesFilter) state.rolesFilter = {};
        state.rolesFilter[e.target.dataset.role] = e.target.checked;
        renderCalendar();
      }
    });
  }

  const modal = document.getElementById('modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target.id === 'modal') closeModal();
    });
  }

  const settings = document.getElementById('settings-modal');
  if (settings) {
    settings.addEventListener('click', (e) => {
      if (e.target.id === 'settings-modal') closeSettings();
    });
  }

  const editModal = document.getElementById('edit-modal');
  if (editModal) {
    editModal.addEventListener('click', (e) => {
      if (e.target.id === 'edit-modal') closeEditModal();
    });
  }

  const datesModal = document.getElementById('dates-modal');
  if (datesModal) {
    datesModal.addEventListener('click', (e) => {
      if (e.target.id === 'dates-modal') closeDatesModal();
    });
  }

  const addTaskBtn = document.getElementById('add-task-btn');
  if (addTaskBtn) {
    addTaskBtn.addEventListener('click', () => addTask(currentDate));
  }

  const editSaveBtn = document.getElementById('edit-save-btn');
  if (editSaveBtn) {
    editSaveBtn.addEventListener('click', saveTaskForm);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      closeSettings();
      closeEditModal();
      closeDatesModal();
    }
  });

  loadConfig();
  loadFromGitHub().then(() => {
    startPolling();
  });
});