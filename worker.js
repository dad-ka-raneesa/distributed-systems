const http = require('http');
const express = require('express');
const app = express();
const processImages = require('./processImages').processImages;

const PORT = 5000;

const getServerOptions = () => {
  return {
    host: 'localhost',
    port: 8000,
    method: 'post'
  };
};

const informWorkerFree = ({ id, tags }) => {
  const options = getServerOptions();
  options.path = `/completed-job/${id}`;
  const req = http.request(options, (res) => { });
  req.write(JSON.stringify(tags));
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
    processImages(params)
      .then((tags) => {
        console.log(tags);
        return { id: params.id, tags: tags };
      })
      .then(informWorkerFree);
  })
  res.end();
})

app.listen(PORT, () => console.log(`Listening on ${PORT}...`));
