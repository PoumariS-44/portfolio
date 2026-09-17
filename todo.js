
let tasks = [];
let currentFilter = "all";
const STORAGE_KEY = "poumariTodoTasks";

const todoForm = document.getElementById("todo-form");
const todoInput = document.getElementById("todo-input");
const todoList = document.getElementById("todo-list");
const emptyMessage = document.getElementById("empty-message");
const totalCount = document.getElementById("total-count");
const activeCount = document.getElementById("active-count");
const completedCount = document.getElementById("completed-count");
const filterButtons = document.querySelectorAll(".filter-btn");
const clearCompletedButton = document.getElementById("clear-completed");

function loadTasks() {
    const savedTasks = localStorage.getItem(STORAGE_KEY);

    if (savedTasks) {
        try {
            tasks = JSON.parse(savedTasks);
        } catch (error) {
            console.error("Could not load saved tasks:", error);
            tasks = [];
        }
    } else {
        tasks = [];
    }
}

function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function addTask(text) {
    const newTask = {
        id: Date.now(),
        text: text,
        completed: false
    };

    tasks.push(newTask);
    saveTasks();
    renderTasks();
}

function getFilteredTasks() {
    if (currentFilter === "active") {
        return tasks.filter(task => !task.completed);
    }

    if (currentFilter === "completed") {
        return tasks.filter(task => task.completed);
    }

    return tasks;
}

function createTaskElement(task) {
    const listItem = document.createElement("li");
    listItem.className = "todo-item";
    listItem.dataset.id = task.id;

    if (task.completed) {
        listItem.classList.add("completed");
    }

    const taskContent = document.createElement("div");
    taskContent.className = "task-content";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", "Mark task as completed");

    const taskLabel = document.createElement("span");
    taskLabel.className = "task-text";
    taskLabel.textContent = task.text;

    taskContent.appendChild(checkbox);
    taskContent.appendChild(taskLabel);

    const taskActions = document.createElement("div");
    taskActions.className = "task-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "edit-btn";
    editButton.dataset.action = "edit";
    editButton.textContent = "Edit";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-btn";
    deleteButton.dataset.action = "delete";
    deleteButton.textContent = "Delete";

    taskActions.appendChild(editButton);
    taskActions.appendChild(deleteButton);

    listItem.appendChild(taskContent);
    listItem.appendChild(taskActions);

    return listItem;
}

function renderTasks() {
    todoList.innerHTML = "";

    const filteredTasks = getFilteredTasks();

    filteredTasks.forEach(task => {
        const taskElement = createTaskElement(task);
        todoList.appendChild(taskElement);
    });

    updateEmptyMessage(filteredTasks);
    updateTaskCounts();
    updateFilterButtons();
}

function updateEmptyMessage(filteredTasks) {
    if (filteredTasks.length === 0) {
        emptyMessage.hidden = false;

        if (currentFilter === "active") {
            emptyMessage.textContent = "No active tasks.";
        } else if (currentFilter === "completed") {
            emptyMessage.textContent = "No completed tasks.";
        } else {
            emptyMessage.textContent = "No tasks yet. Add your first task.";
        }
    } else {
        emptyMessage.hidden = true;
    }
}

function updateTaskCounts() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const active = total - completed;

    totalCount.textContent = total;
    activeCount.textContent = active;
    completedCount.textContent = completed;
}

function updateFilterButtons() {
    filterButtons.forEach(button => {
        const isActive = button.dataset.filter === currentFilter;

        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", isActive.toString());
    });
}

function toggleTask(taskId) {
    const task = tasks.find(task => task.id === taskId);

    if (!task) {
        return;
    }

    task.completed = !task.completed;
    saveTasks();
    renderTasks();
}

function editTask(taskId) {
    const task = tasks.find(task => task.id === taskId);

    if (!task) {
        return;
    }

    const updatedText = prompt("Edit your task:", task.text);

    if (updatedText === null) {
        return;
    }

    const trimmedText = updatedText.trim();

    if (trimmedText === "") {
        alert("Task cannot be empty.");
        return;
    }

    task.text = trimmedText;
    saveTasks();
    renderTasks();
}

function deleteTask(taskId) {
    const task = tasks.find(task => task.id === taskId);

    if (!task) {
        return;
    }

    const shouldDelete = confirm("Delete this task?");

    if (!shouldDelete) {
        return;
    }

    tasks = tasks.filter(task => task.id !== taskId);
    saveTasks();
    renderTasks();
}

function clearCompletedTasks() {
    const completedTasks = tasks.filter(task => task.completed);

    if (completedTasks.length === 0) {
        alert("There are no completed tasks to clear.");
        return;
    }

    const shouldClear = confirm("Remove all completed tasks?");

    if (!shouldClear) {
        return;
    }

    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
}

todoForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const text = todoInput.value.trim();

    if (text === "") {
        return;
    }

    addTask(text);
    todoInput.value = "";
    todoInput.focus();
});

todoList.addEventListener("click", function(event) {
    const taskItem = event.target.closest(".todo-item");

    if (!taskItem) {
        return;
    }

    const taskId = Number(taskItem.dataset.id);
    const action = event.target.dataset.action;

    if (action === "edit") {
        editTask(taskId);
    }

    if (action === "delete") {
        deleteTask(taskId);
    }
});

todoList.addEventListener("change", function(event) {
    if (!event.target.classList.contains("task-checkbox")) {
        return;
    }

    const taskItem = event.target.closest(".todo-item");

    if (!taskItem) {
        return;
    }

    const taskId = Number(taskItem.dataset.id);
    toggleTask(taskId);
});

filterButtons.forEach(button => {
    button.addEventListener("click", function() {
        currentFilter = button.dataset.filter;
        renderTasks();
    });
});

clearCompletedButton.addEventListener("click", clearCompletedTasks);

function initializeApp() {
    loadTasks();
    renderTasks();
}

initializeApp();