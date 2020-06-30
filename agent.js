class Agent {
  constructor(agentId, options) {
    this.agentId = agentId;
    this.options = options;
    this.isFree = true;
  }

  getOptions() {
    return Object.assign({}, this.options);
  }

  setBusy() {
    this.isFree = false;
  }
}

module.exports = { Agent };