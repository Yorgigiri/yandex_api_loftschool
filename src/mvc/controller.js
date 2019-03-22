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
    });

    this.yandexApi.events.add("click", async e => {

      this.position = await this.myApiMap.getMapPosition(e);

      if (this.Balloon) {
        this.Balloon.close();
      }

      this.Balloon = await this.myApiMap.createBalloon(this.position);

    });

    document.addEventListener('click', async e => {
      e.preventDefault();

      let link = document.getElementById('openBalloon');

      if (e.target === link) {
        let data = e.target.getAttribute('coords');

        if (this.Balloon) {
          this.Balloon.close();
        }
  
        this.Balloon = await this.myApiMap.createBalloon(this.position, data);
        
        function getReviews(value) {
          // Получаем отзывы из localStorage

          let localValue = localStorage.getItem(value);
          let data = JSON.parse(localValue || '{}');
          let objKeys = Object.keys(data);
          let array = [];

          if (localValue) {

            for (let i = 0; i < objKeys.length; i++) {
              array.push([data[objKeys[i]].userName, data[objKeys[i]].userPoint, data[objKeys[i]].userMessage]);
            }

            return array;
          }
        }

        const body = document.querySelector(".modal__result");
        let dataCoords = e.target.getAttribute('data-coords');
        let reviewsArray = getReviews(dataCoords);

        if (reviewsArray.length > 0) {

          body.innerHTML = '';

          for (let i = 0; i < reviewsArray.length; i++) {
            let element = document.createElement('div');

            element.innerHTML = `<div><b>${reviewsArray[i][0]}</b> ${reviewsArray[i][1]}</div><div>${reviewsArray[i][2]}</div>`;
            body.appendChild(element);
          }

        }
      }

    });


  }

}