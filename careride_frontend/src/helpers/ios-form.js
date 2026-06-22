/** iOS / touch input helpers for booking steps */

export function isTouchMobile() {
  if (typeof window === "undefined") return false;
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  return ios || window.matchMedia?.("(max-width: 768px) and (pointer: coarse)")?.matches;
}

export function scrollFieldIntoView(el) {
  if (!el?.scrollIntoView) return;
  setTimeout(() => {
    el.scrollIntoView({ block: "center", behavior: "smooth" });
  }, 320);
}

export const iosFormMixin = {
  data() {
    return { _iosFieldFocused: false };
  },
  methods: {
    isTouchMobile() {
      return isTouchMobile();
    },
    scrollFieldIntoView(el) {
      scrollFieldIntoView(el);
    },
    onIosFieldFocus(e) {
      this._iosFieldFocused = true;
      scrollFieldIntoView(e?.target);
    },
    onIosFieldBlur() {
      setTimeout(() => {
        this._iosFieldFocused = false;
      }, 200);
    },
  },
};
