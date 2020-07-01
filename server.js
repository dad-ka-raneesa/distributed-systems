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

app.post('/process/:name/:count/:width/:height/:tags', (req, res) => {
  imageSets.addImageSet(redisClient, req.params)
    .then((job) => {
      redisClient.lpush('ipQueue', job.id, () => {
        res.send(`id:${job.id}`);
        res.end();
      });
    });
});

app.listen(8000, () => console.log('Listening on 8000...'));