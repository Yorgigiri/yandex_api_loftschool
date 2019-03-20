module.exports = class {
  initMap(settings, objects) {
    return new Promise((resolve, reject) => ymaps.ready(resolve)).then(() => {
      this.map = new ymaps.Map("map", settings);
      this.cluster = new ymaps.Clusterer({
        clusterDisableClickZoom: true,
        clusterBalloonContentLayout: 'cluster#balloonCarousel',
      });

      this.map.events.add('click', function (e) {});

      this.map.geoObjects.add(this.cluster);
      return this.map;
    });
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

  async createBalloon(options) {
    const clusterNem = this.cluster;
    const mapName = this.map;

    var BalloonLayout = await ymaps.templateLayoutFactory.createClass(
      `<div class="modal" id="myModal">
      <div class="modal__header">
          <div id="modalAdress">${options.address}</div><span class="modal__close"></span>
          </div>
          <div class="modal__inner">
          <div class="modal__result"></div>
          <div class="modal__title">Ваш отзыв</div>
          <form id="modalForm">
            <input name="name" id="name" class="modal__input" type="text" placeholder="Ваше имя">
            <input name="point" id="point" class="modal__input" type="text" placeholder="Укажите место">
            <textarea name="message" id="message" class="modal__textarea" placeholder="Поделитесь впечатлениями"></textarea>
            <div class="modal__submit-wrapper">
                <button class="modal__submit" id="addReview">Добавить</button>
            </div>
          </form>
          </div>
      </div>`, {
        build: function () {
          BalloonLayout.superclass.build.call(this);
          var that = this;
          let storage = localStorage;
          let coords = options.coords;
          let localValue = storage.getItem(coords);
          const body = document.querySelector(".modal__result");

          if (!localValue) {
            body.textContent = 'Отзывов пока нет...';
          }

          document.addEventListener("click", function (e) {
            e.preventDefault();

            const closeBtn = document.querySelector(".modal__close");
            const button = document.getElementById("addReview");

            if (e.target === button) {
              const name = document.getElementById("name").value;
              const point = document.getElementById("point").value;
              const message = document.getElementById("message").value;
              const div = document.createElement("div");

              if (name === '') {
                alert('поле Имя не заполнено');
              } else if (point === '') {
                alert('поле Место не заполнено');
              } else if (message === '') {
                alert('поле Комментарий не заполнено');
              } else {

                let storageData;

                body.innerHTML = '';
                div.innerHTML = `<div><b>${name}</b> ${point}</div><div>${message}</div>`;
                body.appendChild(div);

                if (!localValue) {

                  storageData = JSON.stringify({
                    review: {
                      userName: name,
                      userPoint: point,
                      userMessage: message,
                      address: options.address
                    }
                  });

                  localStorage.setItem(options.coords, storageData);
                } else {
                  let data = JSON.parse(localValue || '{}');

                  var objLength = function (obj) {
                    var key, len = 0;
                    for (key in obj) {
                      len += Number(obj.hasOwnProperty(key));
                    }
                    return len;
                  };

                  let objLen = objLength(data); // длина объекта (кол-во отзывов)
                  let newReview = 'review_' + (objLen + 1);
                  data[newReview] = {
                    userName: name,
                    userPoint: point,
                    userMessage: message,
                    address: options.address
                  };

                  storageData = JSON.stringify(data);

                  localStorage.setItem(options.coords, storageData);
                }


                let ebobo = that.addPlacemark(name, point, message, options.coords, options.address);

                console.log(ebobo[0]);
                console.log(ebobo[1]);

                // clusterNem.add(ebobo[0]);
                mapName.geoObjects.add(ebobo[1]);
              }

            }

            if (e.target === closeBtn) {
              that.events.fire('userclose');
            }

          });
        },

        clear: function () {
          // Выполняем действия в обратном порядке - сначала снимаем слушателя,
          // а потом вызываем метод clear родительского класса.
          // document.removeEventListener("click", function (e) {

          // });
          BalloonLayout.superclass.clear.call(this);


        },

        addPlacemark: function (name, point, message, coords) {

          var myPlacemark = new ymaps.Placemark(
            coords, {
              balloonLayout: BalloonLayout,
              balloonPanelMaxMapArea: 0,
              hasBalloon: false
            }
          );

          clusterNem.add(myPlacemark);

          return [myPlacemark, clusterNem];
        }


      }
    );


    let balloon = await new ymaps.Balloon(this.map, {
      layout: BalloonLayout,
      closeButton: false
    });

    await balloon.options.setParent(this.map.options);

    await this.cluster.events.add('click', function (e) {
      balloon.close();
    });

    balloon.open(options.coords);



    // console.log(balloon.events);
    // balloon.events
    //   .add('close', function () {

    //     // alert('close')

    //   })
    //   .add('open', function () {

    //     // alert('open')

    //     if (!mapName.balloon.isOpen()) {
    //       console.log('балун не открыт');

    //     } else {
    //       balloon.close();
    //       console.log('балун открыт');
    //     }
    //   });

  }

};