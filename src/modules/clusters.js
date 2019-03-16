module.exports = class {
    createPlacemarks(yaApi) {

        let geoObjects = [];

        for (var i = 0; i < localStorage.length; i++) {
            let coords = localStorage.key(i).split(',');
            // let userData = localStorage.getItem(localStorage.key(i)).split(',');

            geoObjects[i] = new ymaps.Placemark([coords[0], coords[1]]);
            console.log(coords[0]);
        }

        return geoObjects;

    }

};