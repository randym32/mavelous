
$(function(){ 
  // Access the preferences in the local storage
  Mavelous.setPref = function(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  };

  Mavelous.pref = function(key) {
     var value = localStorage.getItem(key);
    return value && JSON.parse(value);
  };

  var mavlinkAPI = new Mavelous.MavlinkAPI({ url: '/mavlink/' });

  var pfdSettingsModel = new Mavelous.PFDSettingsModel();
  var pfdView = new Mavelous.PFDView({
    mavlinkSrc: mavlinkAPI,
    settingsModel: pfdSettingsModel,
    drawingid: 'pfdview',
    blockel: $('#pfdblock'),
    statel: $('#pfdstatus')
  });

  var mmapModel = new Mavelous.MMapModel({ mavlinkSrc: mavlinkAPI });
  var mmapProviderModel = new Mavelous.MMapProviderModel();

  var guideModel = new Mavelous.GuideModel({ mavlinkSrc: mavlinkAPI });
  var guideAltView   = new Mavelous.GuideAltitudeView({
    model: guideModel,
    input: $('#guidealt-input'),
    submit: $('#guidealt-submit'),
    text: $('#guidealt-text')
  });
  var mapView = new Mavelous.MMapView({
    providerModel: mmapProviderModel,
    mapModel: mmapModel,
    guideModel: guideModel
  });

  var commStatusModel = new Mavelous.CommStatusModel({
    mavlinkSrc: mavlinkAPI
  });

  var packetLossModel = new Mavelous.PacketLossModel({
    mavlinkSrc: mavlinkAPI
  });

  var commStatusButtonView = new Mavelous.CommStatusButtonView({
    commStatusModel: commStatusModel,
    packetLossModel: packetLossModel,
    el: $('#navbar-btn-link')
  });

  var droneView = new Mavelous.DroneView({ mavlinkSrc: mavlinkAPI });
  
  var gpsButtonView = new Mavelous.GpsButtonView({
    mavlinkSrc: mavlinkAPI,
    el: $('#navbar-btn-gps')
  });

  var statustextView = new Mavelous.StatustextView({ mavlinkSrc: mavlinkAPI });

  var modeStringView = new Mavelous.ModeStringView({
    mavlinkSrc: mavlinkAPI,
    el: $('#pfd_modestringview')
  });

  var flightModeModel = new Mavelous.FlightModeModel({
    mavlinkSrc: mavlinkAPI
  });
  var flightCommandModel = new Mavelous.CommandLongModel({
    mavlinkSrc: mavlinkAPI
  });
  var flightModeButtonView = new Mavelous.FlightModeButtonView({
    el: $('#navbar-btn-mode'),
    modeModel: flightModeModel,
    commandModel: flightCommandModel
  });

  /* Radio view controller */
  var statusButtons = new Mavelous.StatusButtons({
    buttons: [ gpsButtonView, commStatusButtonView, flightModeButtonView ]
  });


  var batteryButton = new Mavelous.BatteryButton({
    mavlinkSrc: mavlinkAPI,
    el: $('#navbar-btn-battery')
  });

  var settingsView = new Mavelous.SettingsView({
    /* Map settings: */
    mapProviderModel:  mmapProviderModel,
    mapModel:          mmapModel,
    modalToggle:       $('#navbar-a-settings'),
    modal:             $('#settings-modal'),
    mapProviderPicker: $('#settings-mapproviderpicker'),
    mapZoomSlider:     $('#settings-mapzoom'),
    mapZoomValue:      $('#settings-mapzoom-value'),
    /* PFD settings: */
    pfdSettingsModel:  pfdSettingsModel,
    pfdPositionLeft:   $('#settings-pfdpos-left'),
    pfdPositionRight:  $('#settings-pfdpos-right'),
    pfdPositionUp:     $('#settings-pfdpos-up'),
    pfdPositionDown:   $('#settings-pfdpos-down')
  });

  window.router = new Mavelous.AppRouter({
    pfdSettingsModel: pfdSettingsModel
  });

  Backbone.history.start();

  if ($(window).width() > 767) {
    /* On the desktop, default to overview */
    router.navigate('overview', {trigger: true});
  } else {
    /* On tablets and phones, default to map only */
    router.navigate('maponly', {trigger: true});
  }

  setInterval(function() {
    mavlinkAPI.update();
  }, 100); 

  // default location
  // dummy for demo purposes
  var X = {lat: 44.7486, lon: -93.29, zoom: 16 };

  // Get the last location
  var center = Mavelous.pref('center');
  if (center) {
    X.lat = center.lat || X.lat;
    X.lon = center.lon || X.lon;
  }
  // Get the last zoom location
  var zoom = Mavelous.pref('zoom');
  X.zoom = zoom || X.zoom;

   // based on whether we can get the app's geolocation, use that
// REMOVE the false to use the local storage and/or geolocation.  
// It is there to make it easy to demo the zoom level
   if (navigator.geolocation && false) {
    var location_timeout = setTimeout(function(){mmapModel.lateInit(X);}, 10000);

    navigator.geolocation.getCurrentPosition(function(position) {
        clearTimeout(location_timeout);
        X.lat = position.coords.latitude;
        X.lon = position.coords.longitude;
        mmapModel.lateInit(X);
    }, function(error) {
        clearTimeout(location_timeout);
        mmapModel.lateInit(X);
    });
  } else {
    // Fallback for no geolocation
    mmapModel.lateInit(X);
  }


});
