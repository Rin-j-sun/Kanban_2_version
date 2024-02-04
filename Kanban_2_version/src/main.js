Vue.component('app', {
    template: `
    <div id="app">
        <task-form @add="addTask"></task-form>
        <div class="board">
            <task-column title="Запланированные задачи" :tasks="planTask" type="plan" @delete-task="deleteTask" @move-task="moveTask" @move-to-next="moveToNext" @return-task="returnTask" @complete-task="completeTask"></task-column>
            <task-column title="В работе" :tasks="workTask" type="work" @delete-task="deleteTask" @move-task="moveTask" @move-to-next="moveToNext" @return-task="returnTask" @complete-task="completeTask"></task-column>
            <task-column title="Тестирование" :tasks="testingTask" type="testing" @delete-task="deleteTask" @move-task="moveTask" @move-to-next="moveToNext" @return-task="returnTask" @complete-task="completeTask"></task-column>
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
                if (task.deadline >= task.createdDate) {
                    task.check = 'Выполнено в срок';
                } else {
                    task.check = 'Просрочено';
                }
            }
            this.saveTasks();
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
                if (task.deadline >= task.createdDate) {
                    task.check = 'Выполнено в срок';
                } else {
                    task.check = 'Просрочено';
                }
            }
            this.saveTasks();
        },
        returnTask(task) {
            this.testingTask.splice(this.testingTask.indexOf(task), 1);
            this.workTask.push(task);
            this.saveTasks();
        },
        completeTask(task) {
            this.testingTask.splice(this.testingTask.indexOf(task), 1);
            this.completedTask.push(task);
            if (task.deadline >= task.createdDate) {
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