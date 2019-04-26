(function(env) {
  "use strict";

  Handlebars.registerHelper('get_icon', function(iconType, options) {
    var iconFiletype = 'svg';
    var iconPath = 'assets/';
    return iconPath + iconFiletype + '/' + iconType + '.' + iconFiletype;
  });
  var usTZ = {
    "America/New_York" : 1,
    "America/Detroit" : 1,
    "America/Kentucky/Louisville" : 1,
    "America/Kentucky/Monticello" : 1,
    "America/Indiana/Indianapolis" : 1,
    "America/Indiana/Vincennes" : 1,
    "America/Indiana/Winamac" : 1,
    "America/Indiana/Marengo" : 1,
    "America/Indiana/Petersburg" : 1,
    "America/Indiana/Vevay" : 1,
    "America/Chicago" : 1,
    "America/Indiana/Tell_City" : 1,
    "America/Indiana/Knox" : 1,
    "America/Menominee" : 1,
    "America/North_Dakota/Center" : 1,
    "America/North_Dakota/New_Salem" : 1,
    "America/North_Dakota/Beulah" : 1,
    "America/Denver" : 1,
    "America/Boise" : 1,
    "America/Phoenix" : 1,
    "America/Los_Angeles" : 1,
    "America/Anchorage" : 1,
    "America/Juneau" : 1,
    "America/Sitka" : 1,
    "America/Yakutat" : 1,
    "America/Nome" : 1,
    "America/Adak" : 1,
    "America/Metlakatla" : 1,
    "Pacific/Honolulu" : 1
  };
  var getHoursGraphOptions = function() {
    var e = {
      maintainAspectRatio: false,
      responsive: true,
      plugins: {
        filler: {
          propagate: false
        }
      },
      layout: {
        padding: {
          top: 4,
          bottom: 4
        }
      },
      legend: {
        display: false
      },
      scales: {
        xAxes: [{
          display: false,
          gridLines: {
            drawBorder: false
          },
          ticks: {
            display: false
          }
        }],
        yAxes: [{
          display: false,
          gridLines: {
            drawBorder: false
          },
          ticks: {
            display: false
          }
        }]
      },
      animation: {
        duration: 0
      },
      hover: {
        animationDuration: 0
      },
      responsiveAnimationDuration: 0,
      elements: {
        point: {
          radius: 0,
          hoverRadius: 0
        }
      },
      tooltips: {
        enabled: false
      }
    };
    return e;
  };

  var windStringLocale = {
    en: 'Wind',
    da: 'Vind',
  };

  var humidityStringLocale = {
    en: 'Humidity',
    da: 'Luftfugtighed',
  };

  env.ddg_spice_forecast = function(api_result, city, country, language) {
    moment.locale(language);
    // Set up some stuff we'll need
    var weatherData = {},
      unit_labels = {
        'us': {
          speed: 'mph',
          temperature: 'F'
        },
        'si': {
          speed: 'm/s',
          temperature: 'C'
        },
        'ca': {
          speed: 'km/h',
          temperature: 'C'
        },
        'uk': {
          speed: 'mph',
          temperature: 'C'
        },
        'uk2': {
          speed: 'mph',
          temperature: 'C'
        }
      },
      units = api_result.flags && api_result.flags.units;

    // Check if the unit that we got is actually in the hash.
    // If the API changes the api_result.flags or api_result.flags.units, it will break everything.
    if (!(units in unit_labels)) {
      units = 'us';
    }

    var availableIcons = [
      'rain', 'snow', 'sleet', 'wind', 'fog', 'cloudy', 'partly-cloudy-day',
      'partly-cloudy-night', 'clear-day', 'clear-night', 'hail', 'thunderstorm', 'tornado'
    ];

    var getIconType = function(icon) {
      if ($.inArray(icon, availableIcons) === -1) {
        icon = 'cloudy';
      }
      return icon;
    };

    // Convert a wind bearing in degrees to a string
    var wind_bearing_to_str = function(bearing) {
      var wind_i = Math.round(bearing / 45);
      return ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'N'][wind_i];
    };

    // Build the current conditions
    var build_currently = function(f, i) {
      var now = moment().tz(f.timezone),
        speed_units = unit_labels[units].speed,
        currentObj = {},
        tmp_date,
        wind_speed;

      currentObj.isCurrent = 1;

      tmp_date =  moment(now).add(i, 'days');


      if (i === 0 || i === '0') {
        currentObj.summary = tmp_date.format('dddd') + ' &middot; ' + moment().format('LT') + ' &middot; ' + f.currently.summary;
        currentObj.temp = Math.round(f.currently.temperature) + '&deg;';
        currentObj.icon = getIconType(f.currently.icon);
        if (f.currently.windSpeed) {
          wind_speed = Math.round(f.currently.windSpeed);

          if (wind_speed !== 0 && f.currently.windBearing) {
            wind_speed += ' ' + speed_units + ' (' + wind_bearing_to_str(f.currently.windBearing) + ')';
          } else {
            wind_speed += ' ' + speed_units;
          }
          currentObj.wind = windStringLocale[language] || windStringLocale['en'];
          currentObj.wind += ': ' + wind_speed;

          currentObj.windSpeed = Math.round(f.currently.windSpeed);
          currentObj.windBearing = f.currently.windBearing;
        }
        if (f.currently.humidity) {
          currentObj.humidity = humidityStringLocale[language] || humidityStringLocale['en'];
          currentObj.humidity += ': ' + Math.round(f.currently.humidity * 100) + '%';
        }
      } else {
        currentObj.summary = tmp_date.format('dddd') + ' &middot; ' + f.daily.data[i].summary;
        currentObj.temp = Math.round((f.daily.data[i].temperatureMax + f.daily.data[i].temperatureMin) / 2)  + '&deg;';
        currentObj.icon = getIconType(f.daily.data[i].icon);
        if (f.daily.data[i].windSpeed) {
          wind_speed = Math.round(f.daily.data[i].windSpeed);

          if (wind_speed !== 0 && f.daily.data[i].windBearing) {
            wind_speed += ' ' + speed_units + ' (' + wind_bearing_to_str(f.daily.data[i].windBearing) + ')';
          } else {
            wind_speed += ' ' + speed_units;
          }
          currentObj.wind = windStringLocale[language] || windStringLocale['en'];
          currentObj.wind += ': ' + wind_speed;
          currentObj.windSpeed = Math.round(f.daily.data[i].windSpeed);
          currentObj.windBearing = f.daily.data[i].windBearing;
        }
        if (f.daily.data[i].humidity) {
          currentObj.humidity = humidityStringLocale[language] || humidityStringLocale['en'];
          currentObj.humidity += ': ' + Math.round(f.daily.data[i].humidity * 100) + '%';
        }
      }

      if (city && country) {
        currentObj.city = city + ', ' + country;
      } else if (city) {
        currentObj.city = city;
      }
      currentObj.daysourceUrl = 'https://darksky.net/' + f.latitude + ',' + f.longitude + '/' + tmp_date.format("YYYY-MM-DD");
      currentObj.hourly = rowHourly(f, i);
      return currentObj;
    };

    var build_daily = function(f) {
      var dailyObj = [],
        today = moment().tz(f.timezone),
        days = f.daily.data,
        num_days = Math.max(8, days.length),
        day;

      // store daily values
      for (var i = 0, tmp_date; i < num_days; i++)(function(i) {

        dailyObj[i] = days[i];
        day = days[i];
        tmp_date = moment(today).add(i, 'days');
        dailyObj[i].highTemp = Math.round(day.temperatureMax) + '&deg;';
        dailyObj[i].lowTemp = Math.round(day.temperatureMin) + '&deg;';
        dailyObj[i].icon = getIconType(days[i].icon);
        dailyObj[i].day = tmp_date.format("ddd");
        dailyObj[i].index = i;

      })(i);

      return dailyObj;
    };
    var rowHourly = function (f, index) {
      var hourlyObj = [],
        hours = f.hourly.data,
        days = f.daily.data,
        date,
        hours_date,
        hoursStep = 3;
      if (index === 0 || index === '0') {
        for (var i = 0, tmp_date; i < 8 * hoursStep; i += hoursStep ) {
          tmp_date = moment.unix(hours[i].time).tz(f.timezone);
          hourlyObj.push({temp: Math.round(hours[i].temperature), time: tmp_date.format('LT')});
        }
      } else {
        for (var k = 0; k < hours.length; k++) {

            date = moment.unix(days[index].time).tz(f.timezone);
            hours_date = moment.unix(hours[k].time).tz(f.timezone);
            if ((date.format('l') === hours_date.format('l')) && (hours_date.hours() % hoursStep === 0)) {
              hourlyObj.push({temp: Math.round(hours[k].temperature), time: hours_date.format('LT')});
            }

        }
      }
      return hourlyObj;
    };
    var getHoursGraphDefaults = function () {
      return {
        borderColor: "#aaa",
        backgroundColor: "#f2f2f2",
        borderWidth: 2,
        borderCapStyle: "round",
        borderJoinStyle: "round",
        fill: "start",
        label: "",
        spanGaps: true
      }
    };
    var renderChart = function (data) {
      var options = getHoursGraphOptions();
      var labels = data.hourly.map(function(labels) {
        return labels.time;
        }
      );
      var items = data.hourly.map(function(items) {
          return items.temp;
        }
      );
      var datasets = getHoursGraphDefaults();
      datasets.data = items;

      var ctx = document.getElementById('myChart').getContext('2d');
      ctx.canvas.style.width = "100%";
      ctx.canvas.style.height = "100%";
      setTimeout(function() {
        new Chart(ctx, {
          type: 'line',
          data: {
            labels: labels,

            datasets: [datasets]
          },
          options: options
        });
      }, 0);
    };

    var uom = unit_labels[units].temperature === 'F' ? 'F' : 'C';

    weatherData.daily = build_daily(api_result);
    weatherData.activeUnit = unit_labels[units].temperature;
    var updateTempSwitch = function(new_unit) {
      if (new_unit === "F") {
        $('.module__temperature-unit[data-unit="f"]').addClass('module__temperature-unit--on');
        $('.module__temperature-unit[data-unit="c"]').removeClass('module__temperature-unit--on');
      } else {
        $('.module__temperature-unit[data-unit="c"]').addClass('module__temperature-unit--on');
        $('.module__temperature-unit[data-unit="f"]').removeClass('module__temperature-unit--on');
      }
    };

    var setActiveItem = function(i) {
      $('.js-forecast-module-item').removeClass('active');
      $(".js-forecast-module-item[data-item-index=" + i +"]").addClass('active');
    };

    //convert temperature to specified unit
    var convertTemp = function(unit, d) {
      if (unit === 'C') {
        return (d - 32) * (5 / 9);
      } else if (unit === 'F') {
        return d * (9 / 5) + 32;
      }
    };

    var convertSpeed = function(from, to, val) {
      // http://en.wikipedia.org/wiki/Miles_per_hour#Conversions
      var conversionFactors = {
        'mph-m/s': 0.4471,
        'm/s-mph': 2.237,
        'mph-km/h': 1.609,
        'km/h-mph': 0.6214
      };
      return val * conversionFactors[from + '-' + to];
    };


    //update the style of the F/C (make one bold and the other grayed out)


    var updateUnitOfMeasure = function(data) {
      //initialize the temperatures with the API data
      var temps = {
        current: parseInt(data.temp),
        daily: $.map(api_result.daily.data, function(e) {
          return {
            'tempMin': e.temperatureMin,
            'tempMax': e.temperatureMax
          };
        }),
        hourly: $.map(data.hourly, function (k) {
          return {
            'temp': parseInt(k.temp)
          };
        }),
        wind: parseInt(data.windSpeed)
      };



      //if they want the units that aren't given by the API, calculate the new temps
      if (uom !== unit_labels[units].temperature) {
        temps.current = convertTemp(uom, temps.current);
        temps.daily = $.map(temps.daily, function(e) {
          var tempMin = convertTemp(uom, e.tempMin),
            tempMax = convertTemp(uom, e.tempMax);
          return {
            'tempMin': tempMin,
            'tempMax': tempMax
          };
        });
        temps.hourly = $.map(temps.hourly, function(k) {
          var temp = convertTemp(uom, k.temp);
          return {
            'temp': temp
          };
        });
      }

      //decide which wind speed unit they want
      var given_wind_uom = unit_labels[units].speed,
        wind_uom;

      if (uom === 'F') {
        wind_uom = 'mph';
      } else if (given_wind_uom === 'mph') {
        //when the user switches from a given F -> C, we assume they want m/s
        //TODO: make this smarter somehow
        wind_uom = 'm/s';
      } else {
        wind_uom = given_wind_uom;
      }

      if (wind_uom !== given_wind_uom) {
        temps.wind = convertSpeed(given_wind_uom, wind_uom, temps.wind);
      }

      var day_class = '.module__items-item';
      var hours_class = '.module__detail__temp-label';
      var detailed_module_class= '.js-forecast-module-detail';

      $(detailed_module_class).find('.module__temperature-value').html(Math.round(temps.current) + '&deg;');
      $(day_class).each(function(i) {
        var day = temps.daily[i],
          $this = $(this);
        $this.find('.module__items-unit--on').html(Math.round(day.tempMax) + '&deg;');
        $this.find('.module__items-unit--low').html(Math.round(day.tempMin) + '&deg;');
      });
      $(hours_class).each(function (i) {
        var hour = temps.hourly[i],
          $this = $(this);
        $this.html(Math.round(hour.temp) + '&deg;');
      });
      var windWord = windStringLocale[language] || windStringLocale['en'];
      $(detailed_module_class).find('.module__winds--val').html(windWord + ': ' + Math.round(temps.wind) + ' ' + wind_uom +
        ' (' + wind_bearing_to_str(data.windBearing) + ')');

      updateTempSwitch(uom);
    };

    // If there is celsius or fahrenheit mentioned in the query, do use that
    // unit of measurement. If the metric setting is enabled or the user's
    // region is not USA and the API returned temps in F, switch to 'C':


    var createHtmlDetailedItem = function (data) {
      var rawTemplate = document.getElementById("template-detailed-item").innerHTML;
      var compiledTemplate = Handlebars.compile(rawTemplate);
      var generatedHTML = compiledTemplate(data);
      var resultContainer = document.getElementById("forecast-today");
      resultContainer.innerHTML = generatedHTML;
      renderChart(data);

      //when we press the small button, switch the temperature units
      $('.module__temperature-unit').click(function() {
        uom = uom === 'F' ? 'C' : 'F';
        updateUnitOfMeasure(data);
      });
    };
    createHtmlDetailedItem(build_currently(api_result, 0));
    var updateDetailedItemData = function (data) {
      createHtmlDetailedItem(data);
      updateUnitOfMeasure(data);
    };
    var createHtmlDailyItem = function (data) {
      var rawTemplate = document.getElementById("template-item").innerHTML;
      var compiledTemplate = Handlebars.compile(rawTemplate);
      var generatedHTML = compiledTemplate(data);
      var resultContainer = document.getElementById("forecast-daily");
      resultContainer.innerHTML = generatedHTML;
      setActiveItem(0);
      $('.js-forecast-module-item').click(function(e) {
        var index = parseInt($(this).attr('data-item-index'));
        updateDetailedItemData(build_currently(api_result, index));
        setActiveItem(index);
      });
    };
    createHtmlDailyItem(build_daily(api_result));

    var response_timezone = api_result.timezone;
    if(!usTZ[response_timezone]) {
      uom = 'C';
      updateUnitOfMeasure(build_currently(api_result, 0));
    } else {
      updateTempSwitch(uom);
    }
  };

  env.givero = {
    showForecastInAddress: function(address) {
      var language = 'en';
      IA.imports.getVariable('USER_BROWSER_LANGUAGE', function (value) {
        if (value) {
          language = value.split('-')[0];
        }
        callGoogle();
      });
      function getComponentByType(type, address_components){
        for (var i=0; i < address_components.length; i++) {
          for (var j=0; j < address_components[i].types.length; j++) {
            if (address_components[i].types[j] === type) {
              return address_components[i].long_name
            }
          }
        }
      }
      function callGoogle() {
        $.ajax({
          url: '/ia/forecast/google/&address=' + address,
          success: function(data) {
            if (data && data.results && data.results[0].formatted_address && data.results[0].geometry && data.results[0].geometry.location) {
              var country = getComponentByType('country', data.results[0].address_components);
              var city = getComponentByType('locality', data.results[0].address_components);
              env.givero.callDarksky(
                data.results[0].geometry.location.lat,
                data.results[0].geometry.location.lng,
                language,
                city,
                country
              )
            } else {
              window.IA.failed();
            }
          },
          error: function(error) {
            env.givero.showCurrentForecast();
          },
        });
      }

    },
    showCurrentForecast: function() {
      var language = 'en';
      var latitude = null;
      var longitude = null;
      var city = '';
      var country = '';
      IA.imports.getVariable('USER_BROWSER_LANGUAGE', function (value) {
        if (!value) {
          language = value.split('-')[0];
        }
      });
      IA.imports.getVariable('USER_CITY_NAME', function (value) {
        city = value;
      });
      IA.imports.getVariable('USER_COUNTRY_NAME', function (value) {
        country = value;
      });
      IA.imports.getVariable('USER_GEOLOCATION_LATITUDE', function (value) {
        if (!value) {
          window.IA.failed();
        } else {
          latitude = value;
          env.givero.callDarksky(latitude, longitude, language, city, country);
        }
      });
      IA.imports.getVariable('USER_GEOLOCATION_LONGITUDE', function (value) {
        if (!value) {
          window.IA.failed();
        } else {
          longitude = value;
          env.givero.callDarksky(latitude, longitude, language, city, country);
        }
      });
    },
    callDarksky: function (latitude, longitude, language, city, country) {
      if (latitude && longitude) {
        $.ajax({
          url: '/ia/forecast/darksky//' + latitude + ',' + longitude + '?lang=' + language + '&extend=hourly',
          success: function(data) {
            // Exit if we've got a bad forecast
            if (!data || !data.hourly || !data.hourly.data || !data.daily || !data.daily.data) {
              window.IA.failed();
              throw Error('IA:forecast Wrong data from feed');
            } else {
              env.ddg_spice_forecast(data, city, country, language);
              window.IA.ready();
            }
          },
          error: function() {
            window.IA.failed();
            throw Error('IA:forecast Cannot retrieve data from feed');
          },
        });
      }
    },
    getAddressFromQuery: function () {
      var query = window.IA.getQuery();
      var address = query
      // 0. handles main trigger words
        .replace(/weather/g, '')
        .replace(/forecast/g, '')
        .replace(/weather forecast/g, '')
        .replace(/weer/g, '')
        .replace(/meteo/g, '')
        .replace(/wetter/g, '')
        .replace(/clima/g, '')
        .replace(/vejr/g, '')
        .replace(/vejret/g, '')
        .replace(/vejrudsigt/g, '')
        .replace(/vejrudsigten/g, '')

        // 1. handles option trigger words
        .replace(/local/g, '')
        .replace(/near me/g, '')
        .replace(/nearby me/g, '')
        .replace(/current/g, '')

        .trim();
      return address;
    }
  };

  $(document).ready(function () {
    var address = env.givero.getAddressFromQuery();
    if (address) {
      env.givero.showForecastInAddress(address);
    } else {
      env.givero.showCurrentForecast();
    }
  });

}(this));

