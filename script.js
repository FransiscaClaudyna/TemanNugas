// LocalStorage Data Management
let tasks = JSON.parse(localStorage.getItem('temanNugasTasks')) || [];
let schedules = JSON.parse(localStorage.getItem('temanNugasSchedules')) || [];
let currentFilter = 'Semua';

// DOM Elements - Tugas
const taskForm = document.getElementById('form-tugas');
const taskTitle = document.getElementById('nama-tugas');
const mataKuliah = document.getElementById('mata-kuliah');
const taskDeadline = document.getElementById('deadline-tugas');
const taskPriority = document.getElementById('prioritas-tugas');
const taskList = document.getElementById('list-tugas');
const filterBtns = document.querySelectorAll('.filter-tugas button');

// DOM Elements - Jadwal
const scheduleForm = document.getElementById('form-jadwal');
const scheduleName = document.getElementById('nama-kegiatan');
const scheduleDay = document.getElementById('hari-kegiatan');
const scheduleStart = document.getElementById('jam-mulai');
const scheduleEnd = document.getElementById('jam-selesai');
const scheduleNotes = document.getElementById('catatan-kegiatan');
const scheduleList = document.getElementById('list-jadwal');

// DOM Element - Dark/Light Mode
const themeToggleBtn = document.getElementById('themeToggle');

// Fungsi Pengaturan Tema (Dark / Light Mode)
function updateThemeUI(isDark) {
  if (isDark) {
    document.body.classList.add('dark-mode');
    if (themeToggleBtn) themeToggleBtn.innerHTML = '☀️ Light Mode';
  } else {
    document.body.classList.remove('dark-mode');
    if (themeToggleBtn) themeToggleBtn.innerHTML = '🌙 Dark Mode';
  }
}

// Cek tema tersimpan di LocalStorage
const savedTheme = localStorage.getItem('temanNugasTheme');
if (savedTheme === 'dark') {
  updateThemeUI(true);
} else {
  updateThemeUI(false);
}

// Event Toggle Tema
if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('temanNugasTheme', isDark ? 'dark' : 'light');
    updateThemeUI(isDark);
  });
}

// Simpan Data
function saveTasks() {
  localStorage.setItem('temanNugasTasks', JSON.stringify(tasks));
}

function saveSchedules() {
  localStorage.setItem('temanNugasSchedules', JSON.stringify(schedules));
}

// Render Daftar Tugas
function renderTasks() {
  updateSummary();
  if (!taskList) return;
  taskList.innerHTML = '';

  const filteredTasks = tasks.filter(task => {
    if (currentFilter === 'Semua') return true;
    return task.priority === currentFilter;
  });

  if (filteredTasks.length === 0) {
    const emptyMessage = currentFilter === 'Semua' 
      ? 'Belum ada tugas. Yuk, segera tambahkan tugasmu!' 
      : `Belum ada tugas untuk prioritas <strong>${currentFilter}</strong>.`;

    taskList.innerHTML = `<div class="empty-state"><p>${emptyMessage}</p></div>`;
    return;
  }

  filteredTasks.forEach((task) => {
    const realIndex = tasks.indexOf(task);
    const card = document.createElement('div');
    
    let priorityClass = 'priority-low';
    if (task.priority === 'Tinggi') priorityClass = 'priority-high';
    if (task.priority === 'Sedang') priorityClass = 'priority-medium';

    card.className = `task-card ${task.completed ? 'completed' : ''} ${priorityClass}-border`;
    
    card.innerHTML = `
      <div class="task-info">
        <div class="task-header">
          <h3 class="task-name">${task.title}</h3>
          <span class="badge ${priorityClass}">${task.priority}</span>
        </div>
        ${task.course ? `<p class="task-course">📚 ${task.course}</p>` : ''}
        <p class="task-date">📅 Tenggat: ${task.deadline || 'Tidak ada tenggat'}</p>
      </div>
      <div class="task-actions">
        <button type="button" class="btn-action btn-complete" onclick="toggleTask(${realIndex})">
          ${task.completed ? '↩️ Batal' : '✅ Selesai'}
        </button>
        <button type="button" class="btn-action btn-delete" onclick="deleteTask(${realIndex})">
          🗑️ Hapus
        </button>
      </div>
    `;
    taskList.appendChild(card);
  });
}

// Update Ringkasan Dashboard
function updateSummary() {
  const totalEl = document.querySelector('.kartu-ringkasan:nth-child(1) p');
  const completedEl = document.querySelector('.kartu-ringkasan:nth-child(2) p');
  const nearestEl = document.querySelector('.kartu-ringkasan:nth-child(3) p');

  if (totalEl) totalEl.innerText = `${tasks.length} tugas`;
  if (completedEl) {
    const completedCount = tasks.filter(t => t.completed).length;
    completedEl.innerText = `${completedCount} tugas`;
  }
  if (nearestEl) {
    const activeTasks = tasks.filter(t => !t.completed && t.deadline).sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    nearestEl.innerText = activeTasks.length > 0 ? activeTasks[0].deadline : 'Belum ada tenggat';
  }
}

// Tambah Tugas
if (taskForm) {
  taskForm.addEventListener('submit', function(e) {
    e.preventDefault();
    if (!taskTitle.value.trim()) return;

    const newTask = {
      title: taskTitle.value.trim(),
      course: mataKuliah ? mataKuliah.value.trim() : '',
      deadline: taskDeadline.value,
      priority: taskPriority.value || 'Sedang',
      completed: false
    };

    tasks.push(newTask);
    saveTasks();
    renderTasks();
    taskForm.reset();
  });
}

// Filter Event Button
filterBtns.forEach(btn => {
  btn.addEventListener('click', function() {
    filterBtns.forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    currentFilter = this.getAttribute('data-filter') || this.innerText.trim();
    renderTasks();
  });
});

filterBtns.forEach(b => {
  if (b.getAttribute('data-filter') === 'Semua' || b.innerText.trim() === 'Semua') {
    b.classList.add('active');
  }
});

// Toggle Selesai & Hapus Tugas
window.toggleTask = function(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  renderTasks();
};

window.deleteTask = function(index) {
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
};

// Render Jadwal
function renderSchedules() {
  if (!scheduleList) return;
  scheduleList.innerHTML = '';

  if (schedules.length === 0) {
    scheduleList.innerHTML = '<p>Belum ada kegiatan. Tambahkan jadwal pertamamu!</p>';
    return;
  }

  schedules.forEach((sch, index) => {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.innerHTML = `
      <div class="task-info">
        <div class="task-header">
          <h3 class="task-name">${sch.name}</h3>
          <span class="badge priority-low">${sch.day}</span>
        </div>
        <p class="task-date">⏰ ${sch.start} - ${sch.end}</p>
        ${sch.notes ? `<p class="task-course">📝 ${sch.notes}</p>` : ''}
      </div>
      <div class="task-actions">
        <button type="button" class="btn-action btn-delete" onclick="deleteSchedule(${index})">
          🗑️ Hapus
        </button>
      </div>
    `;
    scheduleList.appendChild(card);
  });
}

if (scheduleForm) {
  scheduleForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const newSchedule = {
      name: scheduleName.value.trim(),
      day: scheduleDay.value,
      start: scheduleStart.value,
      end: scheduleEnd.value,
      notes: scheduleNotes.value.trim()
    };
    schedules.push(newSchedule);
    saveSchedules();
    renderSchedules();
    scheduleForm.reset();
  });
}

window.deleteSchedule = function(index) {
  schedules.splice(index, 1);
  saveSchedules();
  renderSchedules();
};

// Popup Pengingat Close
const popupBtn = document.getElementById('tutup-popup');
if (popupBtn) {
  popupBtn.addEventListener('click', () => {
    const popup = document.getElementById('popup-notifikasi');
    if (popup) popup.style.display = 'none';
  });
}

// Navigasi Halaman Aktif berdasarkan URL
const currentPath = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('header nav a').forEach(link => {
  if (link.getAttribute('href') === currentPath) {
    link.classList.add('active');
  }
});

// Inisialisasi
document.addEventListener('DOMContentLoaded', () => {
  renderTasks();
  renderSchedules();
});
// Event Listener Logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    // Arahkan pengguna kembali ke halaman login
    window.location.href = 'login.html';
  });
}
