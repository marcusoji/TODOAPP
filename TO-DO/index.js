document.addEventListener('DOMContentLoaded', function() {
            // Elements
            const themeToggle = document.getElementById('themeToggle');
            const taskInput = document.getElementById('taskInput');
            const categorySelect = 

document.getElementById('categorySelect');
            const addTaskBtn = document.getElementById('addTaskBtn');
            const taskList = document.getElementById('taskList');
            const filterBtns = document.querySelectorAll('.filter-btn');
            const totalTasksEl = document.getElementById('totalTasks');
            const completedTasksEl = document.getElementById('completedTasks');
            const pendingTasksEl = document.getElementById('pendingTasks');
            const deleteAllBtn = document.getElementById('deleteAllBtn');
            
            // Modal elements
            const editTaskModal = document.getElementById('editTaskModal');

            const editTaskTitle = document.getElementById('editTaskTitle');
            const editTaskCategory = document.getElementById('editTaskCategory');
            const closeModal = document.getElementById('closeModal');
            const cancelEdit = document.getElementById('cancelEdit');
            const saveEdit = document.getElementById('saveEdit');
            
            // Delete All Modal elements
            const deleteAllModal = document.getElementById('deleteAllModal');
            const closeDeleteAllModal = document.getElementById('closeDeleteAllModal');
            const cancelDeleteAll = document.getElementById('cancelDeleteAll');

            const confirmDeleteAll = document.getElementById('confirmDeleteAll');
            
            // State
            let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
            let currentFilter = 'all';
            let currentEditId = null;
            
            // Initialize
            updateStats();
            renderTasks();
            
            // Theme toggle
            themeToggle.addEventListener('click', () => {
                document.body.classList.toggle('dark-mode');

                localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
            });
            
            // Load saved theme
            if (localStorage.getItem('darkMode') === 'true') {
                document.body.classList.add('dark-mode');
            }
            
            // Add task
            addTaskBtn.addEventListener('click', addTask);
            taskInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') addTask();
            });
            
            // Filter tasks

            filterBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    filterBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    currentFilter = btn.dataset.filter;
                    renderTasks();
                });
            });
            
            // Modal events
            closeModal.addEventListener('click', () => {
                editTaskModal.style.display = 'none';
            });
            
            cancelEdit.addEventListener('click', () => {
                editTaskModal.style.display = 'none';
            });

            
            saveEdit.addEventListener('click', saveEditedTask);
            
            // Delete All events
            deleteAllBtn.addEventListener('click', () => {
                deleteAllModal.style.display = 'flex';
            });
            
            closeDeleteAllModal.addEventListener('click', () => {
                deleteAllModal.style.display = 'none';
            });
            
            cancelDeleteAll.addEventListener('click', () => {
                deleteAllModal.style.display = 

'none';
            });
            
            confirmDeleteAll.addEventListener('click', () => {
                tasks = [];
                saveTasks();
                renderTasks();
                updateStats();
                deleteAllModal.style.display = 'none';
            });
            
            // Close modals when clicking outside
            window.addEventListener('click', (e) => {
                if (e.target === editTaskModal) {
                    editTaskModal.style.display = 'none';
                }

                if (e.target === deleteAllModal) {
                    deleteAllModal.style.display = 'none';
                }
            });
            
            function addTask() {
                const title = taskInput.value.trim();
                const category = categorySelect.value;
                
                if (title) {
                    const newTask = {
                        id: Date.now(),
                        title,
                        category,
                        completed: false,
                        date: new Date().toISOString()
                    };
                    
                    tasks.unshift(newTask);
                    saveTasks();

                    renderTasks();
                    updateStats();
                    
                    // Reset input
                    taskInput.value = '';
                    taskInput.focus();
                }
            }
            
            function deleteTask(id) {
                if (confirm('Are you sure you want to delete this task?')) {
                    tasks = tasks.filter(task => task.id !== id);
                    saveTasks();
                    renderTasks();
                    updateStats();
                }
            }
            
            function toggleComplete(id) {
                tasks = tasks.map(task => 
                    task.id === id ? { ...task, 

completed: !task.completed } : task
                );
                saveTasks();
                renderTasks();
                updateStats();
            }
            
            function editTask(id) {
                const task = tasks.find(task => task.id === id);
                if (task) {
                    currentEditId = id;
                    editTaskTitle.value = task.title;
                    editTaskCategory.value = task.category;
                    editTaskModal.style.display = 'flex';
                }
            }
            
            function saveEditedTask() {
                if (currentEditId) {

                    const title = editTaskTitle.value.trim();
                    const category = editTaskCategory.value;
                    
                    if (title) {
                        tasks = tasks.map(task => 
                            task.id === currentEditId ? { ...task, title, category } : task
                        );
                        
                        saveTasks();
                        renderTasks();
                        updateStats();
                        
                        // Close modal
                        editTaskModal.style.display = 'none';
                        currentEditId = null;
                    } else {
                        alert('Task title cannot be empty!');

                    }
                }
            }
            
            function saveTasks() {
                localStorage.setItem('tasks', JSON.stringify(tasks));
            }
            
            function updateStats() {
                totalTasksEl.textContent = tasks.length;
                const completed = tasks.filter(task => task.completed).length;
                completedTasksEl.textContent = completed;
                pendingTasksEl.textContent = tasks.length - completed;
                
                // Enable/disable delete all button
                deleteAllBtn.disabled = tasks.length === 0;

            }
            
            function renderTasks() {
                // Filter tasks based on current filter
                let filteredTasks = tasks;
                if (currentFilter === 'active') {
                    filteredTasks = tasks.filter(task => !task.completed);
                } else if (currentFilter === 'completed') {
                    filteredTasks = tasks.filter(task => task.completed);
                }
                
                // Clear task list
                taskList.innerHTML = '';
                
                if (filteredTasks.length === 0) {
                    taskList.innerHTML = `
                        <div class="empty-state" style="text-align: center; padding: 30px; 

color: var(--text-light);">
                            <i class="fas fa-clipboard-list" style="font-size: 3rem; margin-bottom: 15px;"></i>
                            <p>
                                ${currentFilter === 'all' ? 'No tasks yet. Add a new task to get started!' :
                                  currentFilter === 'active' ? 'No active tasks. Enjoy your free time!' :
                                  'No completed tasks. Keep working!'}
                            </p>
                        </div>
                    `;
                    return;
                }
                
                // Render tasks
                filteredTasks.forEach(task => {
                    const taskDate = new Date(task.date);

                    const formattedDate = formatDate(taskDate);
                    
                    const taskElement = document.createElement('div');
                    taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
                    taskElement.innerHTML = `
                        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                        <div class="task-content">
                            <div class="task-title">${task.title}</div>
                            <div class="task-details">
                                <span class="task-category">
                                    <i class="fas ${getCategoryIcon(task.category)}"></i> 
                                    ${capitalizeFirstLetter(task.category)}
                                </span>
                                <span>${formattedDate}

</span>
                            </div>
                        </div>
                        <div class="task-actions">
                            <button class="btn-edit">Edit<i class="fas fa-edit"></i></button>
                            <button class="btn-delete">Delete<i class="fas fa-trash-alt"></i></button>
                        </div>
                    `;
                    
                    // Add event listeners
                    taskElement.querySelector('.task-checkbox').addEventListener('change', () => toggleComplete(task.id));
                    taskElement.querySelector('.btn-edit').addEventListener('click', () => editTask(task.id));
                    

taskElement.querySelector('.btn-delete').addEventListener('click', () => deleteTask(task.id));
                    
                    taskList.appendChild(taskElement);
                });
            }
            
            function getCategoryIcon(category) {
                const icons = {
                    personal: 'fa-user',
                    work: 'fa-laptop-code',
                    shopping: 'fa-shopping-cart',
                    health: 'fa-heartbeat'
                };
                return icons[category] || 'fa-tasks';
            }
            
            function capitalizeFirstLetter(string) {

                return string.charAt(0).toUpperCase() + string.slice(1);
            }
            
            function formatDate(date) {
                const today = new Date();
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                
                if (date.toDateString() === today.toDateString()) {
                    return 'Today';
                } else if (date.toDateString() === yesterday.toDateString()) {
                    return 'Yesterday';
                } else {
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                }
            }
        });
