export const QueueManager = {
  getQueues() {
    return JSON.parse(
      localStorage.getItem("ds_queues") || "[]"
    );
  },

  saveQueues(queues) {
    localStorage.setItem(
      "ds_queues",
      JSON.stringify(queues)
    );
  },

  generateNumber() {
    const queues = this.getQueues();

    if (!queues.length) {
      return "A-001";
    }

    const lastQueue = queues[queues.length - 1];

    const lastNumber = parseInt(
      lastQueue.number.replace("A-", "")
    );

    return `A-${String(lastNumber + 1).padStart(3, "0")}`;
  },

  addQueue(data) {
    const queues = this.getQueues();

    const queue = {
      id: Date.now(),

      orderId: data.orderId || null,

      number: this.generateNumber(),

      customerName: data.customerName,

      phone: data.phone,

      items: data.items || [],

      total: data.total || 0,

      status: "waiting",

      createdAt: new Date().toISOString(),
    };

    queues.push(queue);

    this.saveQueues(queues);

    return queue;
  },

  updateStatus(id, status) {
    const queues = this.getQueues();

    const queue = queues.find(
      (q) => q.id === id
    );

    if (!queue) return null;

    queue.status = status;

    this.saveQueues(queues);

    return queue;
  },

  getByStatus(status) {
    return this.getQueues().filter(
      (q) => q.status === status
    );
  },

  getById(id) {
    return this.getQueues().find(
      (q) => q.id === id
    );
  },

  deleteQueue(id) {
    const queues = this.getQueues().filter(
      (q) => q.id !== id
    );

    this.saveQueues(queues);
  },
};