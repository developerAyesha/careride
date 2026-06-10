// get city from Google Geolocation API result
export function getCity(place = null) {
  const city = [];

  place?.address_components?.map((a) => {
    if (a.types.indexOf("administrative_area_level_1") > -1) {
      if (!city[0]) {
        city[0] = a.long_name;
      }
      city[1] = a.short_name;
    }

    if (a.types.indexOf("locality") > -1) {
      city[0] = a.short_name;
    }
  });

  const utc_offset_minutes = place.utc_offset_minutes || "";

  // console.log("helper:getCity, city: ", city);
  // console.log("helper:getCity, utc_offset_minutes: ", utc_offset_minutes);
  return { name: city, utc_offset_minutes };
}

// formatted currency from cent, from stripe api
export function formatCurrencyCent(cent = null) {
  if (!cent) {
    return;
  }

  return (cent / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

// HELPERS GLOBAL
import { carTypes, orderStatuses } from "@/components/data";

export default {
  scrollTo: (x = 0, y = 0) => {
    window.scrollTo(x, y)
  },

  orderStatusLabel: (status) => {
    // set label via status
    const debug = process.env.VUE_APP_DEBUG_INFO
    return orderStatuses.find((o) => o.id === status)?.label + `${debug ? ` (${status})` : ''}`;
  },
  orderStatusClass: (status) => {
    // set class via status
    return orderStatuses.find((o) => o.id === status)?.class;
  },
  carTypesLabel(id) {
    return carTypes.find((t) => t.id === id).label;
  },


}

// use in SFC:
// this.$helpers.orderStatusLabel(status)