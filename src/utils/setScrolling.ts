export function setScrolling(allow: boolean) {
  const scrollContainer = document.querySelector("[data-scroll-container]");
  if (!scrollContainer) return;

  [scrollContainer].forEach((el) => {
    if (allow) {
      el.classList.contains("overflow-y-hidden") &&
        el.classList.remove("overflow-y-hidden");
    } else {
      !el.classList.contains("overflow-y-hidden") &&
        el.classList.add("overflow-y-hidden");
    }
  });
}
