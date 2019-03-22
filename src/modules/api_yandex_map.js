module.exports = class {
  initMap(settings, objects) {
    return new Promise((resolve, reject) => ymaps.ready(resolve)).then(() => {
      const clustererLayout = ymaps.templateLayoutFactory.createClass(
        '<h1>{{properties.point|raw}}</h1>' + '<div><a href="#" data-coords="{{properties.coords|raw}}" class="openBalloon">{{properties.address|raw}}</a></div>' + '<div>{{properties.message|raw}}</div>', {
          build: function () {
            clustererLayout.superclass.build.call(this);
            const that = this;

            console.log(ymaps);


            // jQuery('.openBalloon').on("click", function () {
            //   // Определяем по какой метке произошло событие.

            //   let coord = jQuery(this).data().coords;
            //   console.log(coord);
            //   console.log(objects.yandexApi.geoObjects);
              
            //   objects.yandexApi.geoObjects.each(function (geoObject) {
            //     // console.log(geoObject.balloon);
            //     let obj = geoObject._objects;
            //     let keys = Object.keys(obj);
            //     // console.log(obj);
                
            //     for(let i =0; i < keys.length; i++){
            //       let key = keys[i];
            //       console.log(obj.getObjectState([key]));
            //       // console.log(obj);
            //       // console.log(obj[key].geoObject);
            //       // obj[key].geoObject.balloon.open();
            //       // let coord = obj[key].geoObject.geometry._coordinates;
            //       // obj[key].geoObject.balloon.open(coord);
            //     }

            //   });
            // });

          }
        }
      );


      this.map = new ymaps.Map("map", settings);
      this.cluster = new ymaps.Clusterer({
        clusterDisableClickZoom: true,
        clusterBalloonContentLayout: 'cluster#balloonCarousel',
        clusterBalloonItemContentLayout: clustererLayout
      });

      this.map.events.add('click', function (e) {
        const that = this;
      });

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
      geocode,
      address
    };
  }

  async createBalloon(options) {
    const clusterNem = this.cluster;
    const mapName = this.map;

    var BalloonLayout = await ymaps.templateLayoutFactory.createClass(
      `<div class="modal" id="myModal" data-coords="${options.coords}">
      <div class="modal__header">
          <div id="modalAdress">${options.address}</div><span class="modal__close"></span>
          </div>
          <div class="modal__inner">
          <div class="modal__result">
            {% for review in properties.reviews %}
              <div><b>{{ review[0] }}</b> {{ review[1] }}</div><div>{{ review[2] }}</div>
            {% endfor %}
          </div>
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
          // console.log();
          const closeBtn = document.querySelector(".modal__close");
          const button = document.getElementById("addReview");
          const body = document.querySelector(".modal__result");
          let storage = localStorage;
          let coords = options.coords;


          if (!storage.getItem(coords)) {
            body.textContent = 'Отзывов пока нет...';
          }

          button.addEventListener('click', function (e) {
            e.preventDefault();

            let localValue = storage.getItem(coords);
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
              let placemarkId;

              if (!localValue) {
                console.log('нетууу ');
                storageData = JSON.stringify({
                  review: {
                    userName: name,
                    userPoint: point,
                    userMessage: message,
                    address: options.address
                  }
                });

                localStorage.setItem(options.coords, storageData);
                body.innerHTML = '';
                placemarkId = 0;
              } else {
                console.log('естььь ');
                let data = JSON.parse(localValue || '{}');

                let objLen = that.objLength(data); // длина объекта (кол-во отзывов)
                let newReview = 'review_' + (objLen + 1);
                data[newReview] = {
                  userName: name,
                  userPoint: point,
                  userMessage: message,
                  address: options.address
                };

                storageData = JSON.stringify(data);

                localStorage.setItem(options.coords, storageData);
                placemarkId = objLen + 1;
              }

              div.innerHTML = `<div><b>${name}</b> ${point}</div><div>${message}</div>`;
              body.appendChild(div);
              that.addPlacemark(name, point, message, options.coords, options.address, placemarkId);

            }
          });

          closeBtn.addEventListener('click', function (e) {
            e.preventDefault();
            that.events.fire('userclose');
          });

        },

        // clear: function () {
        //   this._$element.find('.close')
        //     .off('click');

        //   this.constructor.superclass.clear.call(this);
        // },

        objLength: function (obj) {
          var key, len = 0;
          for (key in obj) {
            len += Number(obj.hasOwnProperty(key));
          }
          return len;
        },

        getReviews: function (coord, container) {
          // Получаем отзывы из localStorage
          const that = this;

          let localValue = localStorage.getItem(coord);
          let data = JSON.parse(localValue || '{}');
          // let reviewsLength = that.objLength(data);
          let objKeys = Object.keys(data);
          let array = [];

          if (localValue) {
            // console.log(objKeys);
            for (let i = 0; i < objKeys.length; i++) {
              // console.log(objKeys[i]);
              array.push([data[objKeys[i]].userName, data[objKeys[i]].userPoint, data[objKeys[i]].userMessage]);
              // console.log(data[objKeys[i]].userName);
              // console.log(data[objKeys[i]].userPoint);
              // console.log(data[objKeys[i]].userMessage);
            }

            return array;
          }

        },

        addPlacemark: function (name, point, message, coords, address, placemarkId) {
          const that = this;
          const reviews = that.getReviews(coords);


          var myPlacemark = new ymaps.Placemark(
            coords, {
              name: name,
              point: point,
              message: message,
              address: address,
              coords: coords,
              placemarkId: placemarkId,
              reviews: reviews
            }, {
              balloonLayout: BalloonLayout,
              hasBalloon: true
            }
          );

          clusterNem.add(myPlacemark);
          mapName.geoObjects.add(clusterNem);
          console.log(options.geocode);
          return [myPlacemark, clusterNem];
        }


      }
    );

    let balloon = new ymaps.Balloon(this.map, {
      layout: BalloonLayout,
      closeButton: false
    });

    await balloon.options.setParent(this.map.options);

    this.cluster.events.add('click', function (e) {
      console.log('clicked cluster');
      balloon.close();
    });

    jQuery(document).on("click", '.openBalloon', function () {

    });

    await balloon.open(options.coords);

    return await balloon;

  }

};