// Bootstrap Toast
import { Controller } from "@hotwired/stimulus"

export default class ToastController extends Controller {
  static targets = ["toasts"]
  static values = {
    autoHide: { type: Boolean, default: true },
    delay: { type: Number, default: 3000 },
  }

  declare readonly toastsTargets: HTMLElement[]
  declare readonly hasToastsTarget: boolean

  declare autoHideValue: boolean
  declare delayValue: number

  // Properties
  get hasAutoHide() {
    return this.autoHideValue
  }

  // Callbacks
  toastsTargetConnected(element: HTMLElement) {
    !element.classList.contains("show") && element.classList.add("show")

    const [delay, autoHide] = this._resolveOptions(element)
    autoHide && setTimeout(() => this._hide(element), delay)
  }

  // Actions
  dismiss(value: HTMLElement | UIEvent) {
    if (value instanceof Element) {
      return this._hide(value)
    }

    const toast = (value.target as HTMLElement).closest<HTMLElement>(`[data-${this.identifier}-target="toasts"]`)
    if (!toast) {
      return console.warn("No toast found to dismiss")
    }

    this._hide(toast)
  }

  // Internals
  private _resolveOptions(element: HTMLElement): [number, boolean] {
    let delay = this.delayValue
    let autoHide = this.autoHideValue

    if (element.hasAttribute(`data-${this.identifier}-delay-param`)) {
      delay = parseInt(element.getAttribute(`data-${this.identifier}-delay-param`) || "0")
    }

    if (element.hasAttribute(`data-${this.identifier}-autohide-param`)) {
      const value = element.getAttribute(`data-${this.identifier}-autohide-param`)
      autoHide = !(value == "0" || String(value).toLowerCase() == "false")
    }

    return [delay, autoHide]
  }

  private _hide(element: HTMLElement) {
    element.classList.remove("show")

    if (element.classList.contains("fade")) {
      element.classList.add("hide")
      element.style.display = "block"
      element.addEventListener(
        "transitionend",
        () => {
          element.remove()
        },
        { once: true }
      )
    } else {
      element.remove()
    }
  }
}
