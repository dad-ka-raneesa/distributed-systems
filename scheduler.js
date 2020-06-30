const http = require('http');

class Scheduler {
  constructor() {
    this.isWorkerFree = true;
    this.jobs = [];
    this.agents = [];
  }

  addAgent(agent) {
    this.agents.push(agent);
  }

  schedule(job) {
    const agent = this.agents.find((agent) => agent.isFree);
    if (agent) this.delegateToAgent(job, agent);
    else this.jobs.push(job);
  }

  delegateToAgent(data, agent) {
    const options = agent.getOptions();
    const req = http.request(options, (res) => {
      console.log('Scheduled on worker', res.statusCode);
    });
    req.write(JSON.stringify(data));
    req.end();
    this.isWorkerFree = false;
    agent.setBusy();
  }

  setAgentFree(agentId) {
    const agent = this.agents.find((agent) => agent.agentId == agentId);
    agent.isFree = true;
    if (this.jobs.length > 0) {
      const job = this.jobs.shift();
      this.delegateToAgent(job, agent);
    }
  }
}

module.exports = { Scheduler };