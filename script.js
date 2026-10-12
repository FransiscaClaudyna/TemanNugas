// Data State & Load dari LocalStorage
let tasks = JSON.parse(localStorage.getItem('temanNugasTasks')) || [];
let currentFilter = 'Semua';

// Elemen DOM Tugas
const taskForm = document.getElementById('taskForm');
const taskTitle = document.getElementById('taskTitle');
const mataKuliah = document.getElementById('mata-kuliah');
const taskDeadline = document.getElementById('taskDeadline');
const taskPriority = document.getElementById('taskPriority');
const formError = document.getElementById('formError');
const taskList = document.getElementById('taskList') || document.getElementById('list-tugas');
const filterBtns = document.querySelectorAll('.filter-tugas button');

// Elemen DOM Navigasi Halaman
const navLinks = document.querySelectorAll('header nav a');
const sections = document.querySelectorAll('main section');

// Simpan ke LocalStorage
function saveTasks() {
    localStorage.setItem('temanNugasTasks', JSON.stringify(tasks));
}

// Render Daftar Tugas berdasarkan Filter
function renderTasks() {
    if (!taskList) return;
    taskList.innerHTML = '';

    // Filter array tugas berdasarkan tombol yang aktif
    const filteredTasks = tasks.filter(task => {
        if (currentFilter === 'Semua') return true;
        return task.priority === currentFilter;
    });

    // Jika tidak ada tugas pada filter yang dipilih
    if (filteredTasks.length === 0) {
        const emptyMessage = currentFilter === 'Semua' 
            ? 'Belum ada tugas. Yuk, segera tambahkan tugasmu!' 
            : `Belum ada tugas untuk prioritas <strong>${currentFilter}</strong>.`;

        taskList.innerHTML = `
            <div class="empty-state">
                <p>${emptyMessage}</p>
            </div>
        `;
        updateSummary();
        return;
    }

    // Tampilkan kartu tugas
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
                <button class="btn-action btn-complete" onclick="toggleTask(${realIndex})">
                    ${task.completed ? '↩️ Batal' : '✅ Selesai'}
                </button>
                <button class="btn-action btn-delete" onclick="deleteTask(${realIndex})">
                    🗑️ Hapus
                </button>
            </div>
        `;
        taskList.appendChild(card);
    });

    updateSummary();
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

// Tambah Tugas Baru
if (taskForm) {
    taskForm.addEventListener('submit', function(e) {
        e.preventDefault();

        if (!taskTitle.value.trim()) {
            if (formError) {
                formError.innerText = 'Judul tugas wajib diisi!';
                formError.style.display = 'block';
            }
            return;
        }

        if (formError) formError.style.display = 'none';

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

// Event Klik Tombol Filter (Semua, Tinggi, Sedang, Rendah)
filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        filterBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentFilter = this.getAttribute('data-filter') || this.innerText.trim();
        renderTasks();
    });
});

// Set tombol "Semua" aktif secara default
filterBtns.forEach(b => {
    if (b.getAttribute('data-filter') === 'Semua' || b.innerText.trim() === 'Semua') {
        b.classList.add('active');
    }
});

// Tandai Selesai / Batal
window.toggleTask = function(index) {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    renderTasks();
};

// Hapus Tugas
window.deleteTask = function(index) {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
};

// Logika Perpindahan Halaman (Tab Navigation)
function setHalamanAktif(targetId) {
    sections.forEach(sec => sec.classList.remove('active-section'));
    navLinks.forEach(nav => nav.classList.remove('active-nav'));

    const targetSection = document.getElementById(targetId);
    const targetNav = document.querySelector(`header nav a[href="#${targetId}"]`);

    if (targetSection) targetSection.classList.add('active-section');
    if (targetNav) targetNav.classList.add('active-nav');
}

navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').replace('#', '');
        setHalamanAktif(targetId);
    });
});

// Jalankan fungsi saat halaman pertama kali dimuat
document.addEventListener('DOMContentLoaded', () => {
    renderTasks();
    setHalamanAktif('dashboard');
});

// Fitur Toggle Dark Mode / Light Mode
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('temanNugasTheme');

// Cek tema yang tersimpan sebelumnya
if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    if (themeToggle) themeToggle.innerText = '☀️ Light Mode';
}

// Event saat tombol diklik
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        
        themeToggle.innerText = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
        localStorage.setItem('temanNugasTheme', isDark ? 'dark' : 'light');
    });
}
