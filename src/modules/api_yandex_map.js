module.exports = class {
  initMap(settings) {
    return new Promise((resolve, reject) => ymaps.ready(resolve)).then(() => {
      const clustererLayout = ymaps.templateLayoutFactory.createClass(
        '<h1>{{properties.point|raw}}</h1>' + '<div><a href="#" data-coords="{{properties.coords|raw}}" id="openBalloon">{{properties.address|raw}}</a></div>' + '<div>{{properties.message|raw}}</div>', {
          build: function () {
            clustererLayout.superclass.build.call(this);
            const that = this;

            document.addEventListener('click', function (e) {
              e.preventDefault();

              let link = document.getElementById('openBalloon');

              if (e.target === link) {

                that.events.fire('userclose');

              }

            });

          }
        });

      this.map = new ymaps.Map("map", settings);
      this.objectManager = new ymaps.ObjectManager({
        clusterize: true
      });

      this.cluster = new ymaps.Clusterer({
        clusterDisableClickZoom: true,
        clusterBalloonContentLayout: 'cluster#balloonCarousel',
        clusterBalloonItemContentLayout: clustererLayout
      });

      this.map.geoObjects.add(this.objectManager);
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

  async createBalloon(options, customCoords) {
    const clusterNem = this.cluster;
    const mapName = this.map;
    const objManager = this.objectManager;
    const coords = options.coords;

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
          that.events.fire('userclose');
          const closeBtn = document.querySelector(".modal__close");
          const button = document.getElementById("addReview");
          const body = document.querySelector(".modal__result");
          let storage = localStorage;

          if (!storage.getItem(coords)) {
            body.textContent = 'Отзывов пока нет...';
          }

          document.addEventListener('click', function (e) {
            e.preventDefault();

            let link = document.getElementById('openBalloon');

            if (e.target === link) {
              that.events.fire('userclose');
            }

          });

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
                body.innerHTML = '';

              } else {
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
              }

              div.innerHTML = `<div><b>${name}</b> ${point}</div><div>${message}</div>`;
              body.appendChild(div);
              that.addPlacemark(name, point, message, options.coords, options.address);

            }
          });

          closeBtn.addEventListener('click', function (e) {
            e.preventDefault();
            that.events.fire('userclose');
          });

        },

        objLength: function (obj) {
          var key, len = 0;
          for (key in obj) {
            len += Number(obj.hasOwnProperty(key));
          }
          return len;
        },

        getReviews: function (coord) {
          // Получаем отзывы из localStorage

          let localValue = localStorage.getItem(coord);
          let data = JSON.parse(localValue || '{}');
          let objKeys = Object.keys(data);
          let array = [];

          if (localValue) {

            for (let i = 0; i < objKeys.length; i++) {
              array.push([data[objKeys[i]].userName, data[objKeys[i]].userPoint, data[objKeys[i]].userMessage]);
            }

            return array;
          }

        },

        addPlacemark: function (name, point, message, coords, address) {
          const that = this;
          const reviews = that.getReviews(coords);

          var myPlacemark = new ymaps.Placemark(
            coords, {
              name: name,
              point: point,
              message: message,
              address: address,
              coords: coords,
              reviews: reviews
            }, {
              balloonLayout: BalloonLayout,
              hasBalloon: true
            }
          );

          clusterNem.add(myPlacemark);
          mapName.geoObjects.add(clusterNem);

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
      balloon.close();
    });

    if (await balloon) {
      await balloon.close();
    }

    if (customCoords) {
      await balloon.open(customCoords);
    } else {
      await balloon.open(coords);
    }

    return await balloon;

  }

};