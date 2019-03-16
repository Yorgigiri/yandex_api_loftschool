module.exports = class {
  initMap(settings, objects) {
    return new Promise((resolve, reject) => ymaps.ready(resolve)).then(() => {
      this.map = new ymaps.Map("map", settings);
      this.cluster = new ymaps.Clusterer({
        clusterDisableClickZoom: true,
        clusterBalloonContentLayout: 'cluster#balloonCarousel',
      });
      this.map.geoObjects.add(this.cluster);
      return this.map;
    });
  }

  async createPlacemarks() {
    let geoObjects = [];

    function createCoordinates() {
      let arrayOfcoords = [];
      for (var i = 0; i < localStorage.length; i++) {
        let array = [];
        let coords = localStorage.key(i).split(',');

        coords.forEach(function (item, i, arr) {
          let toNum = parseFloat(item);
          if (!isNaN(toNum)) {
            array.push(toNum);
          }
        });

        arrayOfcoords.push(array);
      }
      return arrayOfcoords;
    }

    let coordinatesArray = createCoordinates();

    for (var i = 0; i < localStorage.length; i++) {
      let userData = localStorage.getItem(localStorage.key(i)).split(',');
      let address = [];

      userData.forEach(function (item, i, array) {
        if (i > 2) {
          address.push(item);
        }
      });

      if (coordinatesArray[i].length > 1) {
        geoObjects[i] = new ymaps.Placemark(coordinatesArray[i], {
          // balloonContentBodyLayout: 'BalloonContentLayout',
          balloonContentHeader: userData[0],
          balloonContentBody: `<div>${userData[1]}</div> <div>${userData[2]}</div><a class="linckCoords" href="javascript:void(0);" data-coords="${coordinatesArray[i]}">${address}</a>`,
          balloonPanelMaxMapArea: 0,
          hasBalloon: false
        });
      }


    }

    this.cluster.add(geoObjects);
  }

  async getMapPosition(e) {
    const coords = e.get("coords");
    const geocode = await ymaps.geocode(coords);
    const address = geocode.geoObjects.get(0).properties.get("text");

    return {
      coords,
      address
    };
  }

  async createBalloon(tmp) {
    const clusterNem = this.cluster;

    var BalloonContentLayout = await ymaps.templateLayoutFactory.createClass(
      '<div class="form">' +
      '<div class="header">' +
      tmp.address +
      "</div>" +
      '<div class="body">' +
      "</div>" +
      '<p class="title">Ваш отзыв</p>' +
      '<div><input id="name" type="text" placeholder="Ваше имя"/></div>' +
      '<div><input id="point" type="text" placeholder="Укажите место" /></div>' +
      "<div>" +
      '<textarea id="message" placeholder="Поделись впечатлениями">' +
      " </textarea></div>" +
      '<div class="button">' +
      '<button id="btn">Отправить</button>' +
      "</div>" +
      "</div>", {
        build: function () {
          BalloonContentLayout.superclass.build.call(this);
          var that = this;

          document.addEventListener("click", function (e) {
            e.preventDefault();
            const name = document.getElementById("name").value;
            const point = document.getElementById("point").value;
            const message = document.getElementById("message").value;
            const body = document.querySelector(".body");
            const button = document.getElementById("btn");
            const div = document.createElement("div");

            if (e.target === button) {

              let dataArray = [];
              // div.innerHTML = `<div id="review"><b>${name}</b> <span>${point}</span><span class="data">${d.getDate()}.${d.getMonth()}.${d.getFullYear()} ${d.getHours()}.${d.getMinutes()}</span><p>${message}</p></div>`;

              if (name === '') {
                alert('поле Имя не заполнено');
              } else if (point === '') {
                alert('поле Место не заполнено');
              } else if (message === '') {
                alert('поле Комментарий не заполнено');
              } else {
                dataArray.push(name);
                dataArray.push(point);
                dataArray.push(message);
                dataArray.push(tmp.address);
                div.innerHTML = `<div><b>${name}</b> ${point}</div><div>${message}</div>`;
                body.appendChild(div);
                localStorage.setItem(tmp.coords, dataArray);
                that.onContent(name, point, message);

              }
            }

          });
        },

        clear: function () {
          // Выполняем действия в обратном порядке - сначала снимаем слушателя,
          // а потом вызываем метод clear родительского класса.
          BalloonContentLayout.superclass.clear.call(this);

          document.removeEventListener("click", function (e) {

          });
        },

        onContent: function (name, point, message) {

          var myPlacemark = new ymaps.Placemark(
            tmp.coords, {
              balloonContentHeader: `<b>${point}</b>`,
              balloonContentBody: `<div id="review"><a class="linckCoords" href="javascript:void(0);" data-coords="${tmp.coords}">${tmp.address}</a> <p>${message}</p></div>`,
              // balloonContentFooter: `${d.getDate()}.${d.getMonth()}.${d.getFullYear()} ${d.getHours()}.${d.getMinutes()}`
            }, {
              balloonContentBodyLayout: BalloonContentLayout,
              balloonPanelMaxMapArea: 0,
              hasBalloon: true
            }
          );

          clusterNem.add(myPlacemark);

          return [myPlacemark, this.cluster];
        }


      }
    );

    let balloon = await new ymaps.Balloon(this.map, {
      contentLayout: BalloonContentLayout
    });

    await balloon.options.setParent(this.map.options);
    await balloon.open(tmp.coords);

  }

};