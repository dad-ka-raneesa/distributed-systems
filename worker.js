const redis = require('redis');
const processImages = require('./processImages').processImages;
const imageSets = require('./imageSets');

const redisClient = redis.createClient({ db: 1 });

const getJOb = () => {
  return new Promise((resolve, reject) => {
    redisClient.brpop("ipQueue", 1, (err, res) => {
      if (res) resolve(res[1]);
      else reject('no Job');
    })
  })
}

const runLoop = () => {
  getJOb().then((id) => {
    imageSets.get(redisClient, id)
      .then((imageSet) => processImages(imageSet))
      .then((tags) => imageSets.completeProcessing(redisClient, id, tags))
      .then(() => console.log("Finished", id))
      .then(() => runLoop())
  }).catch(() => runLoop());
}

runLoop();