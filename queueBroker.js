const express = require('express');
const app = express();

const jobs = [];

app.get('/request-job', (req, res) => {
  let job = {};
  if (jobs.length > 0) {
    job = jobs.shift();
  }
  res.write(JSON.stringify(job));
  res.end();
})

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
})

app.post('/queue-job/:id', (req, res) => {
  jobs.push({ id: req.params.id });
  res.end();
})


app.listen(8001, () => console.log('QB: Listening on 8001...'));