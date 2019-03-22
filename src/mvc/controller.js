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
      zoom: 14,
      controls: ["zoomControl", "fullscreenControl"]
    }, this);

    this.yandexApi.events.add("click", async e => {

      this.position = await this.myApiMap.getMapPosition(e);

      console.log(e.get('target'));

      if (this.Balloon) {
        this.Balloon.close();
      }

      this.Balloon = await this.myApiMap.createBalloon(this.position);

      // jQuery(document).on("click", ".openBalloon", function () {
      //   // Определяем по какой метке произошло событие.
      //   // console.log(that.Balloon);
      //   let coords = jQuery(this).data().coords;
      //   that.Balloon = this.myApiMap.createBalloon(coords);

      //   // this.Balloon = await this.myApiMap.createBalloon(this.position);
      //   // var selectedPlacemark = placemarks[jQuery(this).data().placemarkid];
      //   // alert(selectedPlacemark.properties.get('balloonContentBody'));
      // });

    });

  }

}