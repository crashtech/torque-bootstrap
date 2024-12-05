// A series of generic helpers to share similar behaviors

// See: https://github.com/twbs/bootstrap/blob/main/js/src/dom/selector-engine.js#L10
export function resolveTarget(element: HTMLElement, baseAttribute: string): string {
  let target = element.getAttribute(baseAttribute)

  if ((!target || target === "#") && element.hasAttribute("href")) {
    const hrefValue = element.getAttribute("href")

    if (!hrefValue || !hrefValue.includes("#")) {
      return ""
    }

    target = hrefValue.split("#")[1].trim()
  }

  return target || ""
}

export function onTransitionEnd(element: Element, callback: () => void): void {
  element.addEventListener("transitionend", callback, { once: true })
}

export function toggleAttribute(element: Element, attribute: string, state: boolean, activeValue = ""): void {
  if (state) {
    element.setAttribute(attribute, activeValue)
  } else {
    element.removeAttribute(attribute)
  }
}

export function isFormControl(element: Element): boolean {
  return /input|select|option|textarea|form/i.test(element.tagName)
}
