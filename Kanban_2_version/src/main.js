Vue.component('task-form', {
    props: [],
    template: `
      <div class="content_form">
      <form @submit.prevent="addTask">
        <div class="new_text">
          <label for="task-name">Заголовок новой задачи:</label>
          <input class="input" id="task-name" type="text" v-model="taskName" required><br><br></div>
        <div class="new_desc">
          <label for="task-desc">Описание задачи:</label>
          <textarea id="task-desc" v-model="description" required></textarea><br><br></div>
        <div class="new_deadline">

          <div class="new_human">
            <label for="human">Ответственный:</label>
            <select id="human" v-model="human" required>
              <option value="Ivanov">Иванов</option>
              <option value="Petrov">Петров</option>
              <option value="Sidorov">Сидоров</option>
            </select>
          </div>
          
          <div class="new_priority">
            <label for="priority">Приоритетность:</label>
            <select id="priority" v-model="priority" required>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
          </div>
          
          <label for="deadline">Срок сдачи:</label>
          <input type="date" id="deadline" v-model="deadline" name="deadline-task" min="2024-01-01" max="2025-12-31" required />
          <button type="submit">Создать</button>
        </div>
      </form>
      </div>
    `,
    data() {
        return {
            taskName: '',
            description: '',
            deadline: '',
            priority: 1,
            human: 'Ivanov',
        };
    },
    methods: {
        addTask() {
            if (this.taskName !== '') {
                const newTask = {
                    title: this.taskName,
                    description: this.description,
                    deadline: this.deadline,
                    priority: this.priority,
                    human: this.human,
                    reason: ''
                };
                newTask.createdDate = new Date().toLocaleDateString();
                this.$emit('add', newTask);
                this.taskName = '';
                this.description = '';
                this.deadline = '';
                this.priority = '';
                this.human = '';
            } else {
                alert("Введите название задачи");
            }
        }
    }
});

Vue.component('task', {
    props: ['task', 'type', 'tasks'],
    data() {
        return {
            editingDescription: false,
            editedDescription: '',
            returnReason: ''
        };
    },
    methods: {
        handleEditDescription() {
            if (this.editingDescription) {
                this.task.description = this.editedDescription;
                this.task.lastEdited = new Date().toLocaleString();
            }
            this.editingDescription = !this.editingDescription;
        },
        handleMoveTask() {
            if (this.type === 'plan') {
                this.$emit('move', this.task);
            } else if (this.type === 'work') {
                this.$emit('move-to-next', this.task);
            }
        },
        handleMoveToNext() {
            if (this.type === 'work') {
                this.$emit('move-to-next', this.task);
            }
        },
        handleReturnToPrevious() {
            if (this.returnReason !== '') {
                this.task.reason = this.returnReason;
                this.$emit('return', this.task);
            } else {
                alert("Введите причину возврата");
            }
        },
        handleDeleteTask() {
            this.$emit('delete', this.task);
        },
        handleCompleteTask() {
            this.$emit('complete', this.task);
        },

    },

    template: `
      <div class="task" draggable="true" @dragstart="handleDragStart" @dragover="handleDragOver" @dragend="handleDrop
">
        <span>Создано: {{ task.createdDate }}</span>
        <h3>{{ task.title }}</h3>
        <p v-if="!editingDescription">{{ task.description }}</p>
        <textarea v-model="editedDescription" v-if="editingDescription"></textarea>
        <span v-if="task.lastEdited">Отредактировано: {{ task.lastEdited }}</span><br><br>
        <span>Срок сдачи: {{ task.deadline }}</span><br><br>
        <span>Приоритетность: {{ task.priority }}</span><br><br>
        <span>Ответственный: {{ task.human }}</span><br><br>
        <!--        <button v-if="type === 'plan'" @click="handleDeleteTask">Удалить</button>-->
        <!--        <button v-if="type !== 'completed'" @click="handleEditDescription">{{ editingDescription ? 'Сохранить' : 'Редактировать' }}</button>-->
        <button v-if="type === 'plan'" @click="handleMoveTask">Вперёд</button>
        <button v-if="type === 'work'" @click="handleMoveToNext">Вперёд</button>
        <button v-if="type === 'testing'" @click="handleReturnToPrevious">Откат</button>
        <button v-if="type === 'testing'" @click="handleCompleteTask">Выполнено</button>
        <br>
        <textarea v-if="type === 'testing'" v-model="returnReason" placeholder="Введите причину отката"></textarea>
        <span v-if="type === 'work' && task.reason">Причина отката: {{ task.reason }}</span>
        <span v-if="type === 'completed'">{{ task.check }}</span>
      </div>
    `
});

Vue.component('task-column', {
    props: ['title', 'tasks', 'type'],
    template: `
    <div class="column">
<!--    реализация функции перемещения-->
        <h2 class="title_column">{{ title }}</h2>
        <task v-for="task in sortedTasks"  :key="task.id" :task="task" :type="type" @delete="handleDeleteTask" @move="moveTask" @move-to-next="moveToNext" @return="returnTask" @complete="completeTask" @drop="handleDrop" @dragover="handleDragOver"></task>
    </div>
    `,
    methods: {
// Функционал перемещения
//         handleDragOver(event) {
//             event.preventDefault();
//         },
        // handleDrop(event) {
        //     const taskData = JSON.parse(event.dataTransfer.getData('text/plain'));
        //     this.$emit('move-task', taskData);
        // },

        handleDeleteTask(task) {
            this.$emit('delete-task', task);
        },
        moveTask(task) {
            this.$emit('move-task', task);
        },
        moveToNext(task) {
            const indexTesting = this.tasks.indexOf(task);
            if (this.type === 'work' && indexTesting !== -1 && task.reason) {
                task.reason = '';
            }
            this.$emit('move-to-next', task);
        },
        returnTask(task) {
            this.$emit('return-task', task);
        },
        completeTask(task) {
            this.$emit('complete-task', task);
        }
    },

    computed: {
        sortedTasks() {
            return this.tasks.sort((a, b) => a.priority - b.priority);
        }
    },

});

Vue.component('app', {
    template: `
      <div id="app">
      <task-form @add="addTask"></task-form>
      <div class="board">
        <task-column title="Запланированные задачи" :tasks="planTask" type="plan" @delete-task="deleteTask" @move-task="moveTask" @move-to-next="moveToNext" @return-task="returnTask" @complete-task="completeTask" @drop="handleDrop" @dragover="handleDragOver"></task-column>
        <task-column title="В работе" :tasks="workTask" type="work" @delete-task="deleteTask" @move-task="moveTask" @move-to-next="moveToNext" @return-task="returnTask" @complete-task="completeTask" @drop="handleDrop" @dragover="handleDragOver"></task-column>
        <task-column title="Тестирование" :tasks="testingTask" type="testing" @delete-task="deleteTask" @move-task="moveTask" @move-to-next="moveToNext" @return-task="returnTask" @complete-task="completeTask" @drop="handleDrop" @dragover="handleDragOver"></task-column>
        <task-column title="Выполненные задачи" :tasks="completedTask" type="completed"></task-column>
      </div>
      </div>
    `,
    data() {
        return {
            planTask: [],
            workTask: [],
            testingTask: [],
            completedTask: []
        };
    },
    created() {
        this.loadTasks();
    },
    methods: {
        addTask(task) {
            this.planTask.push(task);
            this.saveTasks();
        },
        deleteTask(task) {
            const indexPlan = this.planTask.indexOf(task);
            const indexWork = this.workTask.indexOf(task);
            const indexTesting = this.testingTask.indexOf(task);
            const indexCompleted = this.completedTask.indexOf(task);

            if (indexPlan !== -1) {
                this.planTask.splice(indexPlan, 1);
            } else if (indexWork !== -1) {
                this.workTask.splice(indexWork, 1);
            } else if (indexTesting !== -1) {
                this.testingTask.splice(indexTesting, 1);
            } else if (indexCompleted !== -1) {
                this.completedTask.splice(indexCompleted, 1);
            }
            this.saveTasks();
        },
        // Перемещение по кнопке
        moveTask(task) {
            const indexPlan = this.planTask.indexOf(task);
            const indexWork = this.workTask.indexOf(task);
            const indexTesting = this.testingTask.indexOf(task);

            if (indexPlan !== -1) {
                this.planTask.splice(indexPlan, 1);
                this.workTask.push(task);
            } else if (indexWork !== -1) {
                this.workTask.splice(indexWork, 1);
                this.testingTask.push(task);
            } else if (indexTesting !== -1) {
                this.testingTask.splice(indexTesting, 1);
                this.completedTask.push(task);
                //
                // let currentDate = new Date();
                // let deadlineDate = new Date(task.deadline);
                //
                // if (deadlineDate.getFullYear() >= currentDate.getFullYear() &&
                //     deadlineDate.getMonth() >= currentDate.getMonth() &&
                //     deadlineDate.getDate() >= currentDate.getDate()) {
                //     task.check = 'Выполнено в срок';
                // } else {
                //     task.check = 'Просрочено';
                // }
                this.saveTasks();
            }
        },


        moveToNext(task) {
            const indexWork = this.workTask.indexOf(task);
            const indexTesting = this.testingTask.indexOf(task);

            if (indexWork !== -1) {
                this.workTask.splice(indexWork, 1);
                this.testingTask.push(task);
            } else if (indexTesting !== -1) {
                this.testingTask.splice(indexTesting, 1);
                this.completedTask.push(task);
                // let currentDate = new Date();
                // let deadlineDate = new Date(task.deadline);
                //
                // if (deadlineDate.getFullYear() >= currentDate.getFullYear() &&
                //     deadlineDate.getMonth() >= currentDate.getMonth() &&
                //     deadlineDate.getDate() >= currentDate.getDate()) {
                //     task.check = 'Выполнено в срок';
                // } else {
                //     task.check = 'Просрочено';
                // }
                this.saveTasks();
            }
        },

        handleDragStart(event) {
            event.dataTransfer.setData('text/plain', JSON.stringify(this.task));
            event.target.classList.add('dragging');
        },
        handleDragOver(event) {
            event.preventDefault();
        },
        handleDragEnter(event) {
            event.target.classList.add('drag-enter');
        },
        handleDragLeave(event) {
            event.target.classList.remove('drag-enter');
        },
        handleDrop(event) {
            event.preventDefault();
            event.target.classList.remove('drag-enter');

            const draggedTask = JSON.parse(event.dataTransfer.getData('text/plain'));
            // Удаление задачи из предыдущего столбца и добавление ее в новый столбец
        },


        // Функция для обновления счетчиков задач в каждом столбце
        updateTaskCounters() {
            const columnElements = document.querySelectorAll('.task-column');

            columnElements.forEach(columnElement => {
                const taskCount = columnElement.querySelectorAll('.task').length;
                columnElement.querySelector('.task-counter').textContent = taskCount;
            });
        },

        returnTask(task) {
            this.testingTask.splice(this.testingTask.indexOf(task), 1);
            this.workTask.push(task);
            this.saveTasks();
        },

        completeTask(task) {
            this.testingTask.splice(this.testingTask.indexOf(task), 1);
            this.completedTask.push(task);

            let currentDate = new Date();
            let deadlineDate = new Date(task.deadline);

            if (deadlineDate.getFullYear() >= currentDate.getFullYear() &&
                deadlineDate.getMonth() >= currentDate.getMonth() &&
                deadlineDate.getDate() >= currentDate.getDate()) {
                task.check = 'Выполнено в срок';
            } else {
                task.check = 'Просрочено';
            }
            this.saveTasks();
        },

        saveTasks() {
            localStorage.setItem('tasks', JSON.stringify({
                planTask: this.planTask,
                workTask: this.workTask,
                testingTask: this.testingTask,
                completedTask: this.completedTask
            }));
        },
        loadTasks() {
            const tasksData = JSON.parse(localStorage.getItem('tasks'));
            if (tasksData) {
                this.planTask = tasksData.planTask || [];
                this.workTask = tasksData.workTask || [];
                this.testingTask = tasksData.testingTask || [];
                this.completedTask = tasksData.completedTask || [];
            }
        }
    }
});

new Vue({
    el: '#app'
});