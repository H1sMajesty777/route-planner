// ===== Константы =====
const ROLES = {
  tl:    { name: 'Тимлид',      color: '#ff6b9d' },
  arch:  { name: 'Архитектор',  color: '#f39c12' },
  back:  { name: 'Бэкенд',      color: '#2ecc71' },
  front: { name: 'Фронтенд',    color: '#5aa9ff' },
  qa:    { name: 'Тестировщик', color: '#a855f7' }
};

const TASKS = [
  { date: '2026-09-29', role: 'tl',    text: 'Согласовать ТЗ с командой', stage: 1 },
  { date: '2026-09-29', role: 'arch',  text: 'Спроектировать схему БД', stage: 1 },
  { date: '2026-09-29', role: 'back',  text: 'Развернуть каркас FastAPI', stage: 1 },
  { date: '2026-09-29', role: 'front', text: 'Развернуть каркас React + Vite', stage: 1 },
  { date: '2026-09-29', role: 'qa',    text: 'Изучить ТЗ и контракты API', stage: 1 },
  { date: '2026-09-30', role: 'tl',    text: 'Настроить GitHub, права, ветвление', stage: 1 },
  { date: '2026-09-30', role: 'arch',  text: 'Определить контракты API', stage: 1 },
  { date: '2026-09-30', role: 'back',  text: 'Настроить подключение к PostgreSQL', stage: 1 },
  { date: '2026-09-30', role: 'front', text: 'Настроить структуру проекта', stage: 1 },
  { date: '2026-09-30', role: 'qa',    text: 'Составить тест-план', stage: 1 },
  { date: '2026-10-01', role: 'tl',    text: 'Создать доску задач', stage: 1 },
  { date: '2026-10-01', role: 'arch',  text: 'Спроектировать архитектуру', stage: 1 },
  { date: '2026-10-01', role: 'back',  text: 'Настроить SQLAlchemy + GeoAlchemy2', stage: 1 },
  { date: '2026-10-01', role: 'front', text: 'Подключить Leaflet', stage: 1 },
  { date: '2026-10-01', role: 'qa',    text: 'Определить инструменты автотестов', stage: 1 },
  { date: '2026-10-02', role: 'tl',    text: 'Определить критерии готовности', stage: 1 },
  { date: '2026-10-02', role: 'arch',  text: 'Подготовить Docker Compose', stage: 1 },
  { date: '2026-10-02', role: 'back',  text: 'Подготовить Alembic', stage: 1 },
  { date: '2026-10-02', role: 'front', text: 'Сверстать базовый layout', stage: 1 },
  { date: '2026-10-02', role: 'qa',    text: 'Подготовить шаблоны баг-репортов', stage: 1 },
  { date: '2026-10-03', role: 'arch',  text: 'Продумать JWT и роли', stage: 1 },
  { date: '2026-10-03', role: 'back',  text: 'Настроить Docker для бэкенда', stage: 1 },
  { date: '2026-10-03', role: 'front', text: 'Настроить API-клиент', stage: 1 },
  { date: '2026-10-03', role: 'qa',    text: 'Настроить тестовое окружение', stage: 1 },
  { date: '2026-10-05', role: 'arch',  text: 'Утвердить гео-запросы PostGIS', stage: 1 },
  { date: '2026-10-05', role: 'back',  text: 'Настроить CI бэкенда', stage: 1 },
  { date: '2026-10-05', role: 'front', text: 'Настроить CI фронтенда', stage: 1 },
  { date: '2026-10-05', role: 'qa',    text: 'Подготовить каркас автотестов', stage: 1 },
  { date: '2026-10-13', role: 'back',  text: 'Реализовать регистрацию и логин', stage: 2 },
  { date: '2026-10-13', role: 'front', text: 'Сверстать страницы логина', stage: 2 },
  { date: '2026-10-13', role: 'qa',    text: 'Автотесты на регистрацию', stage: 2 },
  { date: '2026-10-13', role: 'arch',  text: 'Утвердить механику JWT', stage: 2 },
  { date: '2026-10-14', role: 'tl',    text: 'Согласовать политику безопасности', stage: 2 },
  { date: '2026-10-14', role: 'arch',  text: 'Rate limiting на Nginx', stage: 2 },
  { date: '2026-10-14', role: 'back',  text: 'Выдача и обновление JWT', stage: 2 },
  { date: '2026-10-14', role: 'front', text: 'Хранение токенов', stage: 2 },
  { date: '2026-10-15', role: 'back',  text: 'Logout с blacklist в Redis', stage: 2 },
  { date: '2026-10-15', role: 'front', text: 'Автообновление access-токена', stage: 2 },
  { date: '2026-10-15', role: 'qa',    text: 'Проверка валидации данных', stage: 2 },
  { date: '2026-10-16', role: 'back',  text: 'GET /api/auth/me', stage: 2 },
  { date: '2026-10-16', role: 'front', text: 'Сверстать личный кабинет', stage: 2 },
  { date: '2026-10-16', role: 'qa',    text: 'Проверка истечения токенов', stage: 2 },
  { date: '2026-10-17', role: 'back',  text: 'Настроить роли', stage: 2 },
  { date: '2026-10-17', role: 'front', text: 'Загрузка аватарки', stage: 2 },
  { date: '2026-10-17', role: 'qa',    text: 'Проверка прав по ролям', stage: 2 },
  { date: '2026-10-19', role: 'back',  text: 'POST /api/routes/build', stage: 2 },
  { date: '2026-10-19', role: 'front', text: 'Карта с точками', stage: 2 },
  { date: '2026-10-19', role: 'qa',    text: 'Автотесты на построение маршрутов', stage: 2 },
  { date: '2026-10-19', role: 'arch',  text: 'Формат хранения waypoints', stage: 2 },
  { date: '2026-10-20', role: 'back',  text: 'POST /api/routes', stage: 2 },
  { date: '2026-10-20', role: 'front', text: 'Отправка точек на бэкенд', stage: 2 },
  { date: '2026-10-20', role: 'arch',  text: 'Контракт с OSRM', stage: 2 },
  { date: '2026-10-21', role: 'back',  text: 'CRUD маршрутов', stage: 2 },
  { date: '2026-10-21', role: 'front', text: 'Отображение маршрута', stage: 2 },
  { date: '2026-10-21', role: 'qa',    text: 'Проверка граничных случаев', stage: 2 },
  { date: '2026-10-22', role: 'back',  text: 'Привязка тегов', stage: 2 },
  { date: '2026-10-22', role: 'front', text: 'Форма создания маршрута', stage: 2 },
  { date: '2026-10-22', role: 'qa',    text: 'Проверка работы с тегами', stage: 2 },
  { date: '2026-10-23', role: 'back',  text: 'GET /api/tags', stage: 2 },
  { date: '2026-10-23', role: 'front', text: 'Отображение времени и дистанции', stage: 2 },
  { date: '2026-10-26', role: 'back',  text: 'GET /api/routes с фильтрами', stage: 2 },
  { date: '2026-10-26', role: 'front', text: 'Сверстать пул маршрутов', stage: 2 },
  { date: '2026-10-26', role: 'qa',    text: 'Автотесты на фильтры', stage: 2 },
  { date: '2026-10-26', role: 'arch',  text: 'Гео-запросы через PostGIS', stage: 2 },
  { date: '2026-10-27', role: 'back',  text: 'Радиус-поиск ST_DWithin', stage: 2 },
  { date: '2026-10-27', role: 'front', text: 'Фильтры (радиус, время, теги)', stage: 2 },
  { date: '2026-10-27', role: 'qa',    text: 'Проверка радиус-поиска', stage: 2 },
  { date: '2026-10-28', role: 'back',  text: 'Фильтр по времени', stage: 2 },
  { date: '2026-10-28', role: 'front', text: 'Отображение маршрутов на карте', stage: 2 },
  { date: '2026-10-28', role: 'qa',    text: 'Проверка фильтров в комбинации', stage: 2 },
  { date: '2026-10-29', role: 'back',  text: 'Фильтр по тегам', stage: 2 },
  { date: '2026-10-29', role: 'front', text: 'Карточка маршрута', stage: 2 },
  { date: '2026-10-29', role: 'arch',  text: 'Индексы GIST', stage: 2 },
  { date: '2026-10-30', role: 'back',  text: 'Сортировка и пагинация', stage: 2 },
  { date: '2026-10-30', role: 'front', text: 'Кнопка лайка', stage: 2 },
  { date: '2026-10-30', role: 'qa',    text: 'Проверка пагинации', stage: 2 },
  { date: '2026-11-02', role: 'back',  text: 'Лайки', stage: 2 },
  { date: '2026-11-02', role: 'front', text: 'Счётчик просмотров', stage: 2 },
  { date: '2026-11-02', role: 'qa',    text: 'Проверка уникальности лайков', stage: 2 },
  { date: '2026-11-03', role: 'back',  text: 'Счётчик просмотров через Redis', stage: 2 },
  { date: '2026-11-03', role: 'front', text: 'Форма жалобы', stage: 2 },
  { date: '2026-11-03', role: 'qa',    text: 'Проверка счётчика просмотров', stage: 2 },
  { date: '2026-11-05', role: 'back',  text: 'Создание жалобы', stage: 2 },
  { date: '2026-11-05', role: 'front', text: 'Страница жалоб для менеджера', stage: 2 },
  { date: '2026-11-05', role: 'qa',    text: 'Проверка создания жалоб', stage: 2 },
  { date: '2026-11-05', role: 'arch',  text: 'Логика скрытия маршрутов', stage: 2 },
  { date: '2026-11-06', role: 'back',  text: 'Список жалоб', stage: 2 },
  { date: '2026-11-06', role: 'qa',    text: 'Проверка обработки жалоб', stage: 2 },
  { date: '2026-11-09', role: 'back',  text: 'Смена статуса жалобы', stage: 2 },
  { date: '2026-11-09', role: 'qa',    text: 'Проверка скрытия маршрутов', stage: 2 },
  { date: '2026-11-10', role: 'back',  text: 'Скрытие маршрута админом', stage: 2 },
  { date: '2026-11-10', role: 'front', text: 'Страница пользователей', stage: 2 },
  { date: '2026-11-11', role: 'back',  text: 'GET /api/admin/users', stage: 2 },
  { date: '2026-11-11', role: 'front', text: 'Страница статистики', stage: 2 },
  { date: '2026-11-11', role: 'qa',    text: 'Автотесты на статистику', stage: 2 },
  { date: '2026-11-12', role: 'back',  text: 'PUT /api/admin/users/{id}', stage: 2 },
  { date: '2026-11-12', role: 'front', text: 'Управление ролями', stage: 2 },
  { date: '2026-11-12', role: 'qa',    text: 'Проверка статистики', stage: 2 },
  { date: '2026-11-13', role: 'back',  text: 'GET /api/admin/stats', stage: 2 },
  { date: '2026-11-13', role: 'front', text: 'Фильтры по периодам', stage: 2 },
  { date: '2026-11-13', role: 'qa',    text: 'Проверка управления пользователями', stage: 2 },
  { date: '2026-11-16', role: 'back',  text: 'Статистика пользователей', stage: 2 },
  { date: '2026-11-16', role: 'front', text: 'Графики', stage: 2 },
  { date: '2026-11-16', role: 'qa',    text: 'Проверка прав доступа', stage: 2 },
  { date: '2026-11-17', role: 'back',  text: 'Статистика просмотров', stage: 2 },
  { date: '2026-11-17', role: 'qa',    text: 'Проверка производительности', stage: 2 },
  { date: '2026-11-23', role: 'front', text: 'Каркас мобильного приложения', stage: 3 },
  { date: '2026-11-23', role: 'arch',  text: 'Структура React Native проекта', stage: 3 },
  { date: '2026-11-23', role: 'qa',    text: 'Расширение автотестов', stage: 3 },
  { date: '2026-11-23', role: 'tl',    text: 'Согласование дизайна экранов', stage: 3 },
  { date: '2026-11-24', role: 'front', text: 'Экраны аутентификации', stage: 3 },
  { date: '2026-11-24', role: 'back',  text: 'Доработка API под мобильное', stage: 3 },
  { date: '2026-11-24', role: 'arch',  text: 'JWT на мобильном', stage: 3 },
  { date: '2026-11-25', role: 'front', text: 'Карта с геолокацией', stage: 3 },
  { date: '2026-11-25', role: 'qa',    text: 'Проверка мобильного на iOS/Android', stage: 3 },
  { date: '2026-11-26', role: 'front', text: 'Создание маршрута на мобильном', stage: 3 },
  { date: '2026-11-26', role: 'back',  text: 'Оптимизация эндпоинтов', stage: 3 },
  { date: '2026-11-27', role: 'front', text: 'Пул маршрутов на мобильном', stage: 3 },
  { date: '2026-11-27', role: 'qa',    text: 'Проверка геолокации', stage: 3 },
  { date: '2026-11-30', role: 'front', text: 'Исправление багов интерфейса', stage: 3 },
  { date: '2026-11-30', role: 'qa',    text: 'Проверка работы с картой', stage: 3 },
  { date: '2026-11-30', role: 'tl',    text: 'Финальное ревью', stage: 3 },
  { date: '2026-12-01', role: 'front', text: 'Production-сборка', stage: 3 },
  { date: '2026-12-01', role: 'qa',    text: 'Проверка создания маршрутов', stage: 3 },
  { date: '2026-12-02', role: 'qa',    text: 'Регрессионное тестирование', stage: 3 },
  { date: '2026-12-02', role: 'arch',  text: 'Проверка безопасности', stage: 3 },
  { date: '2026-12-03', role: 'qa',    text: 'Проверка всех сценариев ролей', stage: 3 },
  { date: '2026-12-03', role: 'tl',    text: 'Подготовка релиза', stage: 3 },
  { date: '2026-12-04', role: 'qa',    text: 'Финальный отчёт', stage: 3 },
  { date: '2026-12-04', role: 'arch',  text: 'Финальная проверка Docker и Nginx', stage: 3 },
];

const CHECKPOINTS = [
  { date: '2026-10-03' }, { date: '2026-10-10' }, { date: '2026-10-17' },
  { date: '2026-10-24' }, { date: '2026-10-31' }, { date: '2026-11-07' },
  { date: '2026-11-14' }, { date: '2026-11-21' }, { date: '2026-11-28' },
  { date: '2026-12-05' },
];

const CFG_KEY = 'planner-github-config';
const LOCAL_KEY = 'planner-state';

let state = { taskStatus: {}, notes: {}, updatedAt: null };
let config = { user: '', repo: '', branch: 'main', token: '' };
let fileSha = null;
let isSaving = false;

// ===== Утилиты =====
function taskKey(t) { return `${t.date}_${t.role}_${t.text}`; }
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
function setSync(cls, text) {
  document.getElementById('sync-dot').className = 'sync-dot ' + cls;
  document.getElementById('sync-text').textContent = text;
}

// ===== Настройки =====
function loadConfig() {
  try {
    const s = localStorage.getItem(CFG_KEY);
    if (s) config = { ...config, ...JSON.parse(s) };
  } catch (e) {}
}
function saveConfig() { localStorage.setItem(CFG_KEY, JSON.stringify(config)); }

function openSettings() {
  document.getElementById('cfg-user').value = config.user;
  document.getElementById('cfg-repo').value = config.repo;
  document.getElementById('cfg-branch').value = config.branch;
  document.getElementById('cfg-token').value = config.token;
  document.getElementById('settings-modal').classList.add('active');
}
function closeSettings() { document.getElementById('settings-modal').classList.remove('active'); }
function saveSettings() {
  config.user = document.getElementById('cfg-user').value.trim();
  config.repo = document.getElementById('cfg-repo').value.trim();
  config.branch = document.getElementById('cfg-branch').value.trim() || 'main';
  config.token = document.getElementById('cfg-token').value.trim();
  saveConfig();
  closeSettings();
  loadFromGitHub();
}

// ===== GitHub API =====
function apiUrl(path) {
  return `https://api.github.com/repos/${config.user}/${config.repo}/contents/${path}`;
}

async function loadFromGitHub(showToast = false) {
  if (!config.user || !config.repo) {
    // fallback на localStorage
    try {
      const s = localStorage.getItem(LOCAL_KEY);
      if (s) state = { ...state, ...JSON.parse(s) };
    } catch (e) {}
    renderCalendar();
    updateProgress();
    setSync('', 'Локальный режим');
    return;
  }

  setSync('syncing', 'Загрузка...');
  try {
    const headers = { 'Accept': 'application/vnd.github+json' };
    if (config.token) headers['Authorization'] = `Bearer ${config.token}`;
    const res = await fetch(`${apiUrl('data.json')}?ref=${config.branch}`, { headers });
    if (res.status === 404) {
      // файла нет — начинаем с пустого
      state = { taskStatus: {}, notes: {}, updatedAt: null };
      fileSha = null;
    } else if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    } else {
      const data = await res.json();
      fileSha = data.sha;
      const decoded = decodeURIComponent(escape(atob(data.content.replace(/\n/g, ''))));
      state = { ...state, ...JSON.parse(decoded) };
    }
    renderCalendar();
    updateProgress();
    setSync('', 'Синхронизировано');
    if (showToast) console.log('Обновлено');
  } catch (e) {
    console.error(e);
    setSync('error', 'Ошибка загрузки');
  }
}

async function saveToGitHub() {
  if (isSaving) return;
  if (!config.user || !config.repo || !config.token) {
    alert('Настрой GitHub в разделе «Настроить GitHub»');
    openSettings();
    return;
  }

  isSaving = true;
  document.getElementById('save-btn').disabled = true;
  setSync('syncing', 'Сохранение...');

  try {
    state.updatedAt = new Date().toISOString();
    const content = btoa(unescape(encodeURIComponent(JSON.stringify(state, null, 2))));

    const body = {
      message: `Обновление календаря — ${new Date().toLocaleString('ru-RU')}`,
      content: content,
      branch: config.branch
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

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`HTTP ${res.status}: ${err}`);
    }

    const result = await res.json();
    fileSha = result.content.sha;
    setSync('', 'Сохранено ✓');
    setTimeout(() => setSync('', 'Синхронизировано'), 2000);
  } catch (e) {
    console.error(e);
    setSync('error', 'Ошибка сохранения');
    alert('Не удалось сохранить: ' + e.message);
  } finally {
    isSaving = false;
    document.getElementById('save-btn').disabled = false;
  }
}

// ===== Рендер =====
function renderCalendar() {
  const grid = document.getElementById('days-grid');
  grid.innerHTML = '';
  const start = new Date(2026, 8, 28);
  const end = new Date(2026, 11, 6);
  const startDay = start.getDay();
  const offset = startDay === 0 ? 6 : startDay - 1;
  const cursor = new Date(start);
  cursor.setDate(cursor.getDate() - offset);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  while (cursor <= end) {
    const dateStr = formatDate(cursor);
    const dayEl = document.createElement('div');
    dayEl.className = 'day';

    if (cursor < start || cursor > end) {
      dayEl.classList.add('empty');
      dayEl.innerHTML = `<div class="day-number">${cursor.getDate()}</div>`;
    } else {
      if (dateStr === formatDate(today)) dayEl.classList.add('today');
      if (CHECKPOINTS.find(c => c.date === dateStr)) dayEl.classList.add('checkpoint');

      const roleFilter = state.rolesFilter || {};
      const dayTasks = TASKS.filter(t => t.date === dateStr && roleFilter[t.role] !== false);
      const tasksHtml = dayTasks.slice(0, 4).map(t => {
        const key = taskKey(t);
        const status = state.taskStatus[key] || 'pending';
        const role = ROLES[t.role];
        return `<div class="task-chip ${status}" title="${role.name}: ${t.text}">
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

let currentDate = null;
function openModal(dateStr) {
  currentDate = dateStr;
  const date = new Date(dateStr + 'T00:00:00');
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  document.getElementById('modal-title').textContent = date.toLocaleDateString('ru-RU', options);

  const tasks = TASKS.filter(t => t.date === dateStr);
  const container = document.getElementById('modal-tasks');

  if (tasks.length === 0) {
    container.innerHTML = '<div class="empty-state">Нет задач на этот день</div>';
  } else {
    container.innerHTML = tasks.map(t => {
      const key = taskKey(t);
      const status = state.taskStatus[key] || 'pending';
      const role = ROLES[t.role];
      const isDone = status === 'done';
      return `
        <div class="modal-task ${isDone ? 'done' : ''}">
          <input type="checkbox" ${isDone ? 'checked' : ''} onchange="toggleTask('${key}')">
          <div class="modal-task-content">
            <div class="modal-task-role" style="color:${role.color}">${role.name}</div>
            <div class="modal-task-text">${escapeHtml(t.text)}</div>
          </div>
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

function toggleTask(key) {
  const cur = state.taskStatus[key] || 'pending';
  const next = cur === 'pending' ? 'in-progress' : cur === 'in-progress' ? 'done' : 'pending';
  state.taskStatus[key] = next;
  renderCalendar();
  updateProgress();
  if (currentDate) openModal(currentDate);
}

function saveNotes() {
  if (!currentDate) return;
  state.notes[currentDate] = document.getElementById('notes-area').value;
  closeModal();
}

function updateProgress() {
  const total = TASKS.length;
  const done = TASKS.filter(t => state.taskStatus[taskKey(t)] === 'done').length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  document.getElementById('overall-percent').textContent = percent + '%';
  document.getElementById('overall-progress').style.width = percent + '%';
  document.getElementById('overall-done').textContent = done;
  document.getElementById('overall-total').textContent = total;

  [1, 2, 3].forEach(stage => {
    const st = TASKS.filter(t => t.stage === stage);
    const sd = st.filter(t => state.taskStatus[taskKey(t)] === 'done').length;
    const p = st.length ? Math.round((sd / st.length) * 100) : 0;
    document.getElementById(`stage${stage}-percent`).textContent = p + '%';
    document.getElementById(`stage${stage}-progress`).style.width = p + '%';
  });
}

// ===== События =====
document.getElementById('role-filter').addEventListener('change', (e) => {
  if (e.target.type === 'checkbox') {
    if (!state.rolesFilter) state.rolesFilter = {};
    state.rolesFilter[e.target.dataset.role] = e.target.checked;
    renderCalendar();
  }
});

document.getElementById('modal').addEventListener('click', (e) => {
  if (e.target.id === 'modal') closeModal();
});
document.getElementById('settings-modal').addEventListener('click', (e) => {
  if (e.target.id === 'settings-modal') closeSettings();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeModal(); closeSettings(); }
});

// ===== Инициализация =====
loadConfig();
loadFromGitHub().then(() => {
  renderCalendar();
  updateProgress();
});