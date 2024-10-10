// A series of generic helpers to share similar behaviors

// See: https://github.com/twbs/bootstrap/blob/main/js/src/dom/selector-engine.js#L10
export const resolveTarget = (element: HTMLElement, baseAttribute: string): string => {
  let target = element.getAttribute(baseAttribute)

  if ((!target || target === "#") && element.hasAttribute("href")) {
    let hrefValue = element.getAttribute("href")

    if (!hrefValue || !hrefValue.includes('#')) {
      return ""
    }

    target = hrefValue.split('#')[1].trim()
  }

  return target || ""
}
