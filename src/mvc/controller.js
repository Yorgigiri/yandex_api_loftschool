const Map = require("../modules/api_yandex_map");
// const Modal = require("../modules/modal");
// const Placemarks = require("../modules/clusters");

export default class {
  constructor() {
    this.myApiMap = new Map();

    this.init();
  }

  async init() {
    this.yandexApi = await this.myApiMap.initMap({
      center: [59.945, 30.264],
      zoom: 15,
      controls: ["zoomControl", "fullscreenControl"]
    });

    this.Placemarks = await this.myApiMap.createPlacemarks();

    this.yandexApi.events.add("click", async e => {
      // console.log(this.yandexApi.balloon.events.types);
      this.position = await this.myApiMap.getMapPosition(e);

      // this.template = await this.modal.createTemplate(this.position);

      // // placemark
      // var Placemark = new ymaps.Placemark(this.position.coords, {
      //   name: 'test'
      // }, {
      //   balloonLayout: this.template,
      //   openEmptyBalloon: true,
      //   balloonCloseButton: false
      // });


      // this.yandexApi.geoObjects.add(Placemark);
      // console.log(this.yandexApi.geoObjects);

      // Placemark.balloon.open();
      // if(balloon.isOpen()){
      //   console.log('opened');
      // }
      this.Balloon = await this.myApiMap.createBalloon(this.position);

    });

  }

}