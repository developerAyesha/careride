import { helpers } from "gmap-vue";
const { MapElementFactory } = helpers;

export default MapElementFactory({
  name: "directionsRenderer",
  ctr: () => google.maps.DirectionsRenderer,
  events: ["directions_changed"],
  mappedProps: {
    routeIndex: { type: Number },
    options: { type: Object },
    panel: {},
    directions: { type: Object },
  },
  props: {
    locations: { type: [Array], default: () => [] },
    travelMode: { type: String, default: "DRIVING" },
    cachedRoute: { type: Object, default: null },
  },
  beforeCreate(options) {},
  afterCreate(directionsRenderer) {
    let directionsService = new window.google.maps.DirectionsService();

    this.$watch(
      () => [this.locations, this.travelMode, this.cachedRoute],
      () => {
        let { locations, travelMode, cachedRoute } = this;

        // render only cachedRoute, else calc route = directionsService.route() and render
        if (cachedRoute) {
          console.log("DirectionsRenderer, show cachedRoute...");
          directionsRenderer.setDirections(cachedRoute);
        } else {
          if (locations.length < 2 || !travelMode) return;

          // origin - start point, 1st point
          const origin = {
            lat: locations[0].position.lat,
            lng: locations[0].position.lng,
          };

          // destination - last point
          const destination = {
            lat: locations[locations.length - 1].position.lat,
            lng: locations[locations.length - 1].position.lng,
          };

          // waypoints - other transit points, between first and last
          const waypoints = [];
          locations.map((loc, i) => {
            if (i > 0 && i < locations.length - 1) {
              waypoints.push({
                location: loc.location,
                stopover: true,
              });
            }
          });

          directionsService.route(
            {
              origin,
              waypoints,
              destination,
              travelMode,
            },
            (response, status) => {
              if (status !== "OK") return;
              // eslint-disable-next-line no-debugger
              // debugger;
              // console.log("directionsService.route, response: ", response);
              this.$emit("update", response);
              directionsRenderer.setDirections(response);
            }
          );
        }
      },
      { immediate: true }
    );
  },
});
