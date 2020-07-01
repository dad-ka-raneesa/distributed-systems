const express = require('express');
const redis = require('redis');
const imageSets = require("./imageSets");
const app = express();
const redisClient = redis.createClient({ db: 1 });

const jobs = [];

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
})

app.get('/request-job', (req, res) => {
  let job = {};
  if (jobs.length > 0) {
    job = jobs.shift();
  }
  res.write(JSON.stringify(job));
  res.end();
})

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
      jobs.push(job);
    })
});

app.listen(8000, () => console.log('Listening on 8000...'));