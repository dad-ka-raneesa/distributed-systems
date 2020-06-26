const processImages = function(image) {
  return new Promise((resolve, reject) => {
    let b = 0;
    let c = 0;
    for (let index = 0; index < +image.count; index++) {
      for (let x = 0; x < +image.width; x++) {
        for (let y = 0; y < +image.height; y++) {
          b = 1 - b;
          c = b * b;
        }
      }
    }
    let tags = image.tags.split('_');
    resolve(tags);
  });
};

module.exports = { processImages };