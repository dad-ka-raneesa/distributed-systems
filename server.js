const http = require('http');
const express = require('express');
const app = express();
const { ImageSets } = require("./imageSets");

let isWorkerFree = true;
const jobs = [];
const imageSets = new ImageSets();

setInterval(() => {
  if (isWorkerFree && jobs.length > 0) {
    const job = jobs.shift();
    console.log('Scheduling job on worker: ', job.id);
    delegateToWorker(job);
  }
}, 1000);

const getWorkerOptions = () => {
  return {
    host: 'localhost',
    port: 5000,
    method: 'post'
  };
};

const delegateToWorker = ({ id, width, height, count, tags }) => {
  const options = getWorkerOptions();
  options.path = `/process/${id}/${count}/${width}/${height}/${tags}`;
  const req = http.request(options, (res) => {
    console.log('Scheduled on worker', res.statusCode);
  });
  req.end();
  isWorkerFree = false;
}

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
})

app.post('/completed-job/:id', (req, res) => {
  let data = '';
  req.on('data', (chunk) => (data += chunk));
  req.on('end', () => {
    const tags = JSON.parse(data);
    imageSets.completeProcessing(req.params.id, tags);
    isWorkerFree = true;
    res.end();
  });
});

app.get('/status/:id', (req, res) => {
  const imageSet = imageSets.get(req.params.id);
  res.write(JSON.stringify(imageSet));
  res.end();
})

app.post('/process/:name/:count/:width/:height/:tags', (req, res) => {
  const job = imageSets.addImageSet(req.params);
  res.send(`id:${job.id}`);
  res.end();
  jobs.push(job);
});

app.listen(8000, () => console.log('Listening on 8000...'));