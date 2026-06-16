// get city from Google Geolocation API result
function findAddressComponent(components, ...types) {
  if (!Array.isArray(components)) return null;
  for (const type of types) {
    const match = components.find((c) => c.types?.includes(type));
    if (match) return match;
  }
  return null;
}

function parseCityFromFormattedAddress(addr) {
  if (!addr) return [];
  const parts = String(addr).split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length < 2) return [];

  const cityPart = parts.length >= 3 ? parts[1] : parts[0];
  let statePart = "";
  if (parts.length >= 3) {
    statePart = (parts[2].match(/^([A-Z]{2})\b/) || [])[1] || "";
  }
  if (!cityPart) return [];
  return statePart ? [cityPart, statePart] : [cityPart];
}

export function getCity(place = null) {
  const city = [];
  const components = place?.address_components || [];

  const locality = findAddressComponent(
    components,
    "locality",
    "postal_town",
    "sublocality",
    "sublocality_level_1",
    "neighborhood",
    "administrative_area_level_2"
  );
  const state = findAddressComponent(components, "administrative_area_level_1");

  if (locality) city[0] = locality.short_name || locality.long_name;
  if (state) city[1] = state.short_name;

  const utc_offset_minutes = place?.utc_offset_minutes || "";

  if (city.filter(Boolean).join(", ").length >= 2) {
    return { name: city, utc_offset_minutes };
  }

  if (place?._fallbackCity && String(place._fallbackCity).trim().length >= 2) {
    const parts = String(place._fallbackCity).split(",").map((s) => s.trim()).filter(Boolean);
    return { name: parts.length ? parts : [String(place._fallbackCity).trim()], utc_offset_minutes };
  }

  const parsed = parseCityFromFormattedAddress(place?.formatted_address);
  if (parsed.join(", ").length >= 2) {
    return { name: parsed, utc_offset_minutes };
  }

  return { name: city, utc_offset_minutes };
}

export function getCityLabel(place = null) {
  return getCity(place).name.filter(Boolean).join(", ");
}

export function resolveCityLabel(city, address) {
  if (city && String(city).trim().length >= 2) return String(city).trim();
  const parsed = parseCityFromFormattedAddress(address);
  return parsed.filter(Boolean).join(", ");
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