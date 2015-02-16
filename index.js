(function () {
    var API_TIMEWORLD_KEY = "d6a4075ceb419113c64885d9086d5";
    var API_TIMEWORLD_URL = "https://api.worldweatheronline.com/free/v2/tz.ashx?format=json&key=" + API_TIMEWORLD_KEY + "&q=";
    var API_WEATHER_KEY = "80114c7878f599621184a687fc500a12";
    var API_WEATHER_URL = "http://api.openweathermap.org/data/2.5/weather?APPID=" + API_WEATHER_KEY + "&";
    var API_WEATHER_IMG = "http://openweathermap.org/img/w/";
    
    var today = new Date().toLocaleTimeString();
    var $body = $("body"); 
    var $loader = $(".loader");
    var $nombreNuevaCiudad = $("[data-input='cityAdd']");
    var $buttonAdd = $("[data-button='add']");
    var $buttonLoad = $("[data-saved-cities]");
   
    var cities = [];
    
    var cityWeather = {};
    cityWeather.zone;
    cityWeather.icon;
    cityWeather.temp;
    cityWeather.tempMax;
    cityWeather.tempMin;
    cityWeather.main;
    
    $buttonAdd.on("click", addNewCity);
    $nombreNuevaCiudad.on("keypress", function(event) {
        if (event.which === 13){
         addNewCity(event);   
        }
    });
    $buttonLoad.on("click", loadNewCities);
    
    function errorFound(error) {
        var errorString;
        if (error.code === 0) {
            errorString = "Desconocido";
        } else if (error.code === 1) {
            errorString = "Acceso denegado";
        } else if (error === 2) {
            errorString = "Posición desconocida";
        }  else if (error === 3) {
            errorString = "Timeout";
        }
        alert("Error: " + errorString);
        
    };
    
    function getCoords(position) {
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;
        $.getJSON(API_WEATHER_URL + "lat=" + lat + "&lon=" + lon, getCurrentWeather);
    };
    
    function getCurrentWeather (data) {
        cityWeather.zone = data.name;
        cityWeather.icon = API_WEATHER_IMG + data.weather[0].icon + ".png";
        cityWeather.temp = data.main.temp - 273.15;
        cityWeather.tempMax = data.main.temp_max - 273.15;
        cityWeather.tempMin = data.main.temp_min - 273.15;
        cityWeather.main = data.weather[0].main;
        renderTemplate(cityWeather, today);
    };
        
    function activateTemplate (id) {
        var template = document.querySelector(id);
        return document.importNode(template.content, true);
    };
    
    function renderTemplate (cityWeather, time) {
        var clone = activateTemplate("#template--city");
        clone.querySelector("[data-time]").innerHTML = time;
        clone.querySelector("[data-city]").innerHTML = cityWeather.zone;
        clone.querySelector("[data-icon]").src = cityWeather.icon;
        clone.querySelector("[data-temp='max']").innerHTML = cityWeather.tempMax.toFixed(1);
        clone.querySelector("[data-temp='min']").innerHTML = cityWeather.tempMin.toFixed(1);
        clone.querySelector("[data-temp='current']").innerHTML = cityWeather.temp.toFixed(1);
        $loader.hide();
        $body.append(clone);
    };
    
    function addNewCity(event) {
      event.preventDefault();
      $.getJSON(API_WEATHER_URL + "q=" + $nombreNuevaCiudad.val(), getNewCityWeather);
    };
    
    function getNewCityWeather (data) {
        var localTime;
        $.getJSON(API_TIMEWORLD_URL + $nombreNuevaCiudad.val(), function(resp) {
          $nombreNuevaCiudad.val("");
          cityWeather.zone = data.name;
          cityWeather.icon = API_WEATHER_IMG + data.weather[0].icon + ".png";
          cityWeather.temp = data.main.temp - 273.15;
          cityWeather.tempMax = data.main.temp_max - 273.15;
          cityWeather.tempMin = data.main.temp_min - 273.15;
          cityWeather.main = data.weather[0].main;
          localTime = resp.data.time_zone[0].localtime.split(" ")[1];
          renderTemplate(cityWeather, localTime);  
            
          cities.push(cityWeather);
            console.log(cities);
            localStorage.setItem("cities", JSON.stringify(cities));
        })
    }
    
    function loadNewCities(event){
        event.preventDefault();
        
        function renderCities(cities){
            cities.forEach(function(city) {
                renderTemplate(city);
            });
        };
        var cities = JSON.parse(localStorage.getItem("cities"));
        renderCities(cities);
    }
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(getCoords, errorFound);
    } else {
        alert("Actualiza tu Navegador");
    }
})();