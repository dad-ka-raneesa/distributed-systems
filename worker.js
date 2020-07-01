const http = require('http');
const redis = require('redis');
const express = require('express');
const app = express();
const processImages = require('./processImages').processImages;
const imageSets = require('./imageSets');
const { resolve } = require('path');
const { rejects } = require('assert');

const redisClient = redis.createClient({ db: 1 });

const getServerOptions = () => {
  return {
    host: 'localhost',
    port: 8000,
    path: '/request-job'
  };
};

const getJOb = () => {
  return new Promise((resolve, reject) => {
    http.get(getServerOptions(), (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (JSON.parse(data).id !== undefined) resolve(data)
        else reject('No job');
      });
    })
  })
}

const runLoop = () => {
  getJOb().then((data) => {
    const params = JSON.parse(data);
    imageSets.get(redisClient, params.id)
      .then((imageSet) => processImages(imageSet))
      .then((tags) => imageSets.completeProcessing(redisClient, params.id, tags))
      .then(() => console.log("Finished", params.id))
      .then(() => runLoop())
  }).catch(() => {
    setInterval(() => {
      runLoop();
    }, 1000);
  });
}

runLoop();