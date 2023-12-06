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

export function setCursorPosition(node: HTMLElement, position: number) {
  const range = document.createRange();
  const sel = window.getSelection();

  range.setStart(node.childNodes[0], position);
  range.collapse(true);

  sel?.removeAllRanges();
  sel?.addRange(range);
}
