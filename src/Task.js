class Task {
    static queue = []

    static add = function (fn) {
        this.queue.push(fn);

        return this;
    }

    static start() {
        const task = this.queue.shift();

        task && task();
    }

    static resolve() {
        const task = this.queue.shift();

        task && task();
    }
}

export default Task;