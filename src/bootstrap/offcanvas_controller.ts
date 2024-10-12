// Bootstrap Offcanvas
import { Controller } from "@hotwired/stimulus"

export default class OffcanvasController extends Controller {
  static targets = ["canvas"]
  static values = {
    open: Boolean,
    backdrop: { type: Boolean, default: true },
    dismissible: { type: Boolean, default: true },
  }

  declare readonly canvasTarget: HTMLElement
  declare readonly hasCanvasTarget: boolean

  declare openValue: boolean
  declare backdropValue: boolean
  declare dismissibleValue: boolean
  declare backdrop?: HTMLElement

  // Properties
  get isOpen() {
    return !!this.openValue
  }

  get hasBackdrop() {
    return this.backdropValue
  }

  get isDismissible() {
    return this.dismissibleValue
  }

  // Callbacks
  disconnect() {
    this.isOpen && this.hide()
  }

  openValueChanged(newValue: boolean, oldValue?: boolean) {
    if (this.hasCanvasTarget && typeof oldValue !== "undefined") {
      newValue ? this._show() : this._hide()
    }
  }

  // Actions
  show() {
    this.openValue = true
  }

  hide() {
    this.openValue = false
  }

  toggle(value: UIEvent): void
  toggle(value?: boolean): void
  toggle(value?: UIEvent | boolean) {
    this.openValue = typeof value === "boolean" ? value : !this.openValue
  }

  // Internals
  private _show() {
    this.hasBackdrop && this._createBackdrop()

    this.canvasTarget.style.visibility = "visible"
    this.canvasTarget.removeAttribute("aria-hidden")
    this.canvasTarget.setAttribute("aria-modal", "")
    this.canvasTarget.setAttribute("role", "dialog")
    this.canvasTarget.classList.add("show")
  }

  private _hide() {
    this._removeBackdrop()

    this.canvasTarget.addEventListener(
      "transitionend",
      () => {
        this.canvasTarget.style.visibility = "hidden"
        this.canvasTarget.setAttribute("aria-hidden", "")
        this.canvasTarget.removeAttribute("aria-modal")
        this.canvasTarget.removeAttribute("role")
      },
      { once: true }
    )

    this.canvasTarget.classList.remove("show")
  }

  private _createBackdrop() {
    this.backdrop = document.createElement("div")
    this.backdrop.classList.add("offcanvas-backdrop", "fade", "show")
    this.isDismissible && this.backdrop.addEventListener("click", this.hide.bind(this))
    this.canvasTarget.insertAdjacentElement("afterend", this.backdrop)
  }

  private _removeBackdrop() {
    if (this.backdrop) {
      this.backdrop.addEventListener(
        "transitionend",
        () => {
          this.backdrop?.remove()
          this.backdrop = undefined
        },
        { once: true }
      )

      this.backdrop.classList.remove("show")
    }
  }
}
