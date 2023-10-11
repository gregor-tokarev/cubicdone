export function focusOnEditableElement(
  el: HTMLElement,
  pos: "start" | "end" = "end",
) {
  const range = document.createRange();
  const sel = document.getSelection();
  if (sel) {
    sel.removeAllRanges();
    range.selectNodeContents(el);
    range.collapse(pos === "start");
    sel.addRange(range);
    el.focus();
  }
}
