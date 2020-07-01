const http = require('http');
const express = require('express');
const redis = require('redis');
const imageSets = require("./imageSets");
const app = express();
const redisClient = redis.createClient({ db: 1 });

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
})

app.get('/status/:id', (req, res) => {
  imageSets.get(redisClient, req.params.id).then((imageSet) => {
    res.write(JSON.stringify(imageSet));
    res.end();
  })
})

const getQueueBrokerOptions = () => ({
  host: 'localhost',
  port: 8001,
  path: '/queue-job/',
  method: 'post'
});

app.post('/process/:name/:count/:width/:height/:tags', (req, res) => {
  imageSets.addImageSet(redisClient, req.params)
    .then((job) => {
      res.send(`id:${job.id}`);
      res.end();
      const options = getQueueBrokerOptions();
      options.path = options.path + job.id;
      const req = http.request(options, (res) => {
        console.log("Got from queue broker", res.statusCode);
      });
      req.end();
    });
});

app.listen(8000, () => console.log('Listening on 8000...'));