export function setScrolling(allow: boolean) {
  const body = document.body;
  const scrollContainer = document.querySelector("[data-scroll-container]");
  if (!scrollContainer) return;

  [body, scrollContainer].forEach((el) => {
    if (allow) {
      el.classList.remove("overflow-y-hidden");
    } else {
      el.classList.add("overflow-y-hidden");
    }
  });
}
