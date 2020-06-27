const http = require('http');

const getWorkerOptions = () => {
  return {
    host: 'localhost',
    port: 5000,
    method: 'post'
  };
};

class Scheduler {
  constructor() {
    this.isWorkerFree = true;
    this.jobs = [];
  }

  schedule(job) {
    this.jobs.push(job);
  }

  delegateToWorker({ id, width, height, count, tags }) {
    const options = getWorkerOptions();
    options.path = `/process/${id}/${count}/${width}/${height}/${tags}`;
    const req = http.request(options, (res) => {
      console.log('Scheduled on worker', res.statusCode);
    });
    req.end();
    this.isWorkerFree = false;
  }

  start() {
    setInterval(() => {
      if (this.isWorkerFree && this.jobs.length > 0) {
        const job = this.jobs.shift();
        console.log('Scheduling job on worker: ', job.id);
        this.delegateToWorker(job);
      }
    }, 1000);
  }

  setWorkerFree() {
    this.isWorkerFree = true;
  }
}

module.exports = { Scheduler };