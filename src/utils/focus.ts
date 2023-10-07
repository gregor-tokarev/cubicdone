export function focusOnEditableElement(el: HTMLElement) {
    const range = document.createRange()
    const sel = window.getSelection();
    if (sel) {
        sel.removeAllRanges();
        range.selectNodeContents(el);
        range.collapse(false)
        sel.addRange(range);
        el.focus()
    }
}
