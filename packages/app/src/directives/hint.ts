import { Directive } from "vue";

export const hint: Directive = {
  mounted(el, binding) {
    if (!binding.value) return;

    const tooltip = document.createElement("div");
    tooltip.className =
      "flex absolute py-0.5 px-1.5 top-0 transition-opacity rounded-lg bg-gray-900 translate-x-[10px] text-gray-300 text-xs";

    tooltip.innerHTML = binding.value;
    tooltip.insertAdjacentHTML(
      "afterbegin",
      `<svg class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[4px]" width="6" height="7" viewBox="0 0 6 7" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1.29115 4.33863C0.684092 3.94433 0.684092 3.05567 1.29115 2.66137L4.45529 0.606201C5.12057 0.174095 6 0.651544 6 1.44483L6 5.55517C6 6.34846 5.12057 6.82591 4.4553 6.3938L1.29115 4.33863Z" fill="#292929"/>
</svg>
`,
    );

    document.body.appendChild(tooltip);
    tooltip.style.opacity = "0";
    tooltip.style.zIndex = "-999";

    el.addEventListener("mouseenter", () => {
      const rect = el.getBoundingClientRect();

      tooltip.style.left = rect.left + rect.width + "px";
      tooltip.style.top =
        rect.top - tooltip.offsetHeight / 2 + rect.height / 2 + "px";

      tooltip.style.opacity = "1";
      tooltip.style.zIndex = "999";
    });

    el.addEventListener("mouseleave", () => {
      tooltip.style.opacity = "0";
      tooltip.style.zIndex = "-999";
    });

    // Cleanup on unmount
    el._hoverHintCleanup = () => {
      document.body.removeChild(tooltip);
      el.removeEventListener("mouseenter", () => {});
      el.removeEventListener("mouseleave", () => {});
    };
  },
  unmounted(el) {
    if (el._hoverHintCleanup) {
      el._hoverHintCleanup();
    }
  },
};
