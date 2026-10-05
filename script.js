// ============================================================
// КОНСТАНТЫ
// ============================================================

// Роли остаются в коде — это UI-конфиг, редактировать не будем.
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
const POLL_INTERVAL = 30000; // 30 секунд — автообновление

// Фолбэк-шаблон на случай, если data.json ещё не создан
const FALLBACK_DATA = {
  project: {
    title: 'Route Planner — Календарь разработки',
    subtitle: '05 октября 2026 — 06 декабря 2026 · 10 недель · 5 ролей',
    startDate: '2026-10-05',
    endDate: '2026-12-06'
  },
  checkpoints: [
    { date: '2026-10-18', name: 'КТ-1: ТЗ и архитектура' },
    { date: '2026-11-08', name: 'КТ-2: Бэкенд' },
    { date: '2026-11-22', name: 'КТ-3: Фронтенд' },
    { date: '2026-11-29', name: 'КТ-4: Тестирование' },
    { date: '2026-12-05', name: 'КТ-5: Демонстрация' }
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

// ============================================================
// УТИЛИТЫ
// ============================================================

function getTasks() {
  return (state.tasks && state.tasks.length) ? state.tasks : [];
}

function getCheckpoints() {
  return (state.checkpoints && state.checkpoints.length) ? state.checkpoints : [];
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

  // Динамически пересчитываем границы календаря
  window.__projectStart = p.startDate;
  window.__projectEnd = p.endDate;
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
// GITHUB API
// ============================================================

function apiUrl(path) {
  const user = config.user || DEFAULT_REPO.user;
  const repo = config.repo || DEFAULT_REPO.repo;
  return `https://api.github.com/repos/${user}/${repo}/contents/${path}`;
}

async function loadFromGitHub(showToast = false) {
  const branch = config.branch || DEFAULT_REPO.branch;

  setSync('syncing', 'Загрузка...');
  try {
    const headers = { 'Accept': 'application/vnd.github+json' };
    if (config.token) {
      headers['Authorization'] = `Bearer ${config.token}`;
      isReadOnly = false;
    } else {
      isReadOnly = true;
    }

    const res = await fetch(`${apiUrl('data.json')}?ref=${branch}&t=${Date.now()}`, { headers });

    if (res.status === 404) {
      // Файла нет — используем фолбэк, не перезаписываем
      state = JSON.parse(JSON.stringify(FALLBACK_DATA));
      fileSha = null;
    } else if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    } else {
      const data = await res.json();
      fileSha = data.sha;
      const decoded = decodeURIComponent(escape(atob(data.content.replace(/\n/g, ''))));
      const remote = JSON.parse(decoded);
      // Мерджим с фолбэком, чтобы не потерять поля, если их нет в удалённом
      state = { ...JSON.parse(JSON.stringify(FALLBACK_DATA)), ...remote };
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
    const content = btoa(unescape(encodeURIComponent(JSON.stringify(state, null, 2))));

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
      // Конфликт — кто-то сохранил раньше
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
// READ-ONLY РЕЖИМ
// ============================================================

function updateReadOnlyUI() {
  const saveBtn = document.getElementById('save-btn');
  const settingsBtn = document.getElementById('settings-btn');
  const addBtn = document.getElementById('add-task-btn');

  if (isReadOnly) {
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = '🔒 Только просмотр';
    }
    if (settingsBtn) settingsBtn.style.display = 'none';
    if (addBtn) addBtn.style.display = 'none';
  } else {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = '💾 Сохранить на GitHub';
    }
    if (settingsBtn) settingsBtn.style.display = '';
    if (addBtn) addBtn.style.display = '';
  }
}

// ============================================================
// АВТООБНОВЛЕНИЕ (POLLING)
// ============================================================

function startPolling() {
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = setInterval(async () => {
    if (isSaving) return;
    const branch = config.branch || DEFAULT_REPO.branch;
    try {
      const headers = { 'Accept': 'application/vnd.github+json' };
      if (config.token) headers['Authorization'] = `Bearer ${config.token}`;
      const res = await fetch(`${apiUrl('data.json')}?ref=${branch}&t=${Date.now()}`, { headers });
      if (!res.ok) return;
      const data = await res.json();
      const decoded = decodeURIComponent(escape(atob(data.content.replace(/\n/g, ''))));
      const remote = JSON.parse(decoded);
      if (remote.updatedAt && remote.updatedAt !== lastKnownUpdatedAt) {
        // Кто-то сохранил изменения — обновляем
        fileSha = data.sha;
        state = { ...JSON.parse(JSON.stringify(FALLBACK_DATA)), ...remote };
        lastKnownUpdatedAt = remote.updatedAt;
        applyProjectMeta();
        renderCalendar();
        updateProgress();
        if (currentDate) openModal(currentDate);
      }
    } catch (e) {
      // тихо игнорируем
    }
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

  while (cursor <= end) {
    const dateStr = formatDate(cursor);
    const dayEl = document.createElement('div');
    dayEl.className = 'day';

    if (cursor < start || cursor > end) {
      dayEl.classList.add('empty');
      dayEl.innerHTML = `<div class="day-number">${cursor.getDate()}</div>`;
    } else {
      if (dateStr === formatDate(today)) dayEl.classList.add('today');
      if (checkpoints.find(c => c.date === dateStr)) dayEl.classList.add('checkpoint');

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
// СОБЫТИЯ (фильтр ролей, закрытие модалок)
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  const roleFilter = document.getElementById('role-filter');
  if (roleFilter) {
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

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      closeSettings();
      closeEditModal();
    }
  });

  // Инициализация
  loadConfig();
  loadFromGitHub().then(() => {
    startPolling();
  });
});
// ============================================================
// МОДАЛКА ДНЯ
// ============================================================

let currentDate = null;

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

  // Заполняем форму
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

  if (!text) {
    alert('Введите текст задачи');
    return;
  }
  if (!date) {
    alert('Выберите дату');
    return;
  }
  if (!role) {
    alert('Выберите роль');
    return;
  }

  if (!state.tasks) state.tasks = getTasks().slice();

  if (originalKey) {
    // Редактирование существующей
    const idx = state.tasks.findIndex(t => taskKey(t) === originalKey);
    if (idx === -1) {
      alert('Задача не найдена');
      return;
    }
    const oldKey = originalKey;
    state.tasks[idx] = { date, role, text, stage };
    const newKey = taskKey(state.tasks[idx]);

    // Переносим статус на новый ключ
    if (oldKey !== newKey && state.taskStatus[oldKey]) {
      state.taskStatus[newKey] = state.taskStatus[oldKey];
      delete state.taskStatus[oldKey];
    }
  } else {
    // Новая задача
    state.tasks.push({ date, role, text, stage });
  }

  // Сортируем задачи по дате
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
// ЗАГРУЗКА UI ПОСЛЕ ПОЛУЧЕНИЯ ДАННЫХ
// ============================================================

// После инициализации в части 1 — навешиваем обработчики на кнопки
document.addEventListener('DOMContentLoaded', () => {
  const addTaskBtn = document.getElementById('add-task-btn');
  if (addTaskBtn) {
    addTaskBtn.addEventListener('click', () => addTask(currentDate));
  }

  const editSaveBtn = document.getElementById('edit-save-btn');
  if (editSaveBtn) {
    editSaveBtn.addEventListener('click', saveTaskForm);
  }
});