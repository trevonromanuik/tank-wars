const images = {};

export default class ResourceManager {

  static loadImage(key, path) {
    return new Promise((resolve) => {
      images[key] = new Image();
      images[key].onload = () => { resolve(); };
      images[key].src = path;
    });
  }

  static getImage(key) {
    return images[key];
  }

}