const express = require('express');
const redis = require('redis');
const imageSets = require("./imageSets");
const { Scheduler } = require("./scheduler");
const { Agent } = require("./agent");
const app = express();
const redisClient = redis.createClient({ db: 1 });


const getAgentOptions = (port) => {
  return {
    host: 'localhost',
    port: port,
    method: 'post',
    path: '/process'
  };
};

const scheduler = new Scheduler();
scheduler.addAgent(new Agent(1, getAgentOptions(5000)));
scheduler.addAgent(new Agent(2, getAgentOptions(5001)));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
})

app.post('/completed-job/:agentId/:id', (req, res) => {
  let data = '';
  req.on('data', (chunk) => (data += chunk));
  req.on('end', () => {
    const tags = JSON.parse(data);
    imageSets.completeProcessing(redisClient, req.params.id, tags);
    scheduler.setAgentFree(req.params.agentId);
    res.end();
  });
});

app.get('/status/:id', (req, res) => {
  imageSets.get(redisClient, req.params.id).then((imageSet) => {
    res.write(JSON.stringify(imageSet));
    res.end();
  })
})

app.post('/process/:name/:count/:width/:height/:tags', (req, res) => {
  imageSets.addImageSet(redisClient, req.params)
    .then((job) => {
      res.send(`id:${job.id}`);
      res.end();
      scheduler.schedule(job);
    })
});

app.listen(8000, () => console.log('Listening on 8000...'));