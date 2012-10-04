
$(function(){
  window.Mavelous = window.Mavelous || {};

  /*Options
    @param lat   The initial latitude
    @param lon   The initial longitude
    @param zooom The initial zoom

    Description.
    This provides "the "model"

    The intent of the options is to be able to save them to local storage
    and resume. */
  Mavelous.MMapModel = Backbone.Model.extend({
    WIDE_ZOOM: 2,
    TIGHT_ZOOM: 16,
    gotgps: false,

    /* The defaults (overrided by the passed options */
    defaults: function () {
      return { lat: 44.7486, lon: -93.29, zoom: this.WIDE_ZOOM };
    },

    validate: function ( attrs ) {
//      if ( attrs.zoom > 18 ) return "zoom too high";
      if ( attrs.zoom < 1 )  return "zoom too low";
    },

    initialize: function () {
      var mavlink = this.get('mavlinkSrc');
      this.gotgps = false;
      this.gps = mavlink.subscribe('GPS_RAW_INT', this.onGps, this);
    },

   // A helper function to configure the map
   lateInit: function (options) {
      var options = options || {};
      var tmp = options.lat;
      if (typeof tmp !== "undefined"){
         this.set('lat', tmp);
      }
      tmp = options.lon;
      if (typeof tmp !== "undefined"){
         this.set('lon', tmp);
      }
      tmp = options.zoom;
      if (typeof tmp !== "undefined"){
         this.set('zoom', tmp);
      }
    },

    onGps: function () {
      var gpslat = this.gps.get('lat');
      var gpslon = this.gps.get('lon');
      var state = { lat: gpslat / 1.0e7, lon: gpslon / 1.0e7 };

      if ( gpslat !== 0 && gpslon !== 0 && this.gotgps === false ) {
        this.gotgps = true;
        state.zoom = this.TIGHT_ZOOM;
      }
      this.set(state);
      // Save this in the local storage
      Mavelous.setPref('center', state);
    },

    zoomBy: function (delta) {
      var v = this.get('zoom') + parseFloat(delta);
      this.set('zoom', v);
      // Save this in the local storage
      Mavelous.setPref('zoom', v);
    },

    setZoom: function (z) {
      var v=parseFloat(z) || 0;
      this.set('zoom', v);
      // Save this in the local storage
      Mavelous.setPref('zoom', v);
    },

    getZoom: function () {
      return this.get('zoom');
    }
  });
});

