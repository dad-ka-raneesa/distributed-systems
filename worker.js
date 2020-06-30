const http = require('http');
const redis = require('redis');
const express = require('express');
const app = express();
const processImages = require('./processImages').processImages;
const imageSets = require('./imageSets');

const redisClient = redis.createClient({ db: 1 });

const getServerOptions = () => {
  return {
    host: 'localhost',
    port: 8000,
    method: 'post'
  };
};

let agentId;

const informWorkerFree = () => {
  const options = getServerOptions();
  options.path = `/completed-job/${agentId}`;
  const req = http.request(options, (res) => { });
  req.end();
}

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.post('/process', (req, res) => {
  let data = '';
  req.on('data', (chunk) => data += chunk);
  req.on('end', () => {
    const params = JSON.parse(data);
    imageSets.get(redisClient, params.id)
      .then((imageSet) => processImages(imageSet))
      .then((tags) => imageSets.completeProcessing(redisClient, params.id, tags))
      .then(() => informWorkerFree());
  })
  res.end();
})

const main = (port, id) => {
  const PORT = port || 5000;
  agentId = id;
  app.listen(PORT, () => console.log(`Listening on ${PORT}...`));
}

main(+process.argv[2], +process.argv[3])