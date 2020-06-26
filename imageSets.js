class ImageSets {
  constructor() {
    this.ImageSets = {};
    this.id = 0;
  }

  addImageSet(imageSet) {
    let jobToSchedule = Object.assign({ id: this.id }, imageSet);
    this.ImageSets[this.id] = Object.assign({}, imageSet);
    this.ImageSets[this.id].status = 'scheduled';
    this.ImageSets[this.id].receivedAt = new Date();
    this.id++;
    return jobToSchedule;
  }

  completeProcessing(id, tags) {
    this.ImageSets[id].tags = tags;
    this.ImageSets[id].status = 'completed';
  }

  get(id) {
    return Object.assign({}, this.ImageSets[id]);
  }
}

module.exports = { ImageSets };