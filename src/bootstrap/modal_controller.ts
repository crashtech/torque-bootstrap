// Bootstrap Modal
import { Controller } from "@hotwired/stimulus"
import { toggleAttribute } from "./helpers"

export default class ModalController extends Controller {
  static targets = ["modal"]
  static values = {
    open: Boolean,
    backdrop: { type: Boolean, default: true },
    dismissible: { type: Boolean, default: true },
  }

  declare readonly modalTarget: HTMLElement
  declare readonly hasModalTarget: boolean

  declare openValue: boolean
  declare backdropValue: boolean
  declare dismissibleValue: boolean

  declare backdrop?: HTMLElement
  declare backdropClick: (event: UIEvent) => void

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
    if (this.hasModalTarget && typeof oldValue !== "undefined") {
      this._setState(newValue)
    }
  }

  modalTargetConnected(element: HTMLElement) {
    this.backdropClick = (event) => {
      if (event.target === element) {
        this.isDismissible ? this.hide() : this.highlight()
      }
    }

    element.addEventListener("click", this.backdropClick)
  }

  modalTargetDisconnected(element: HTMLElement) {
    element.removeEventListener("click", this.backdropClick)
  }

  // Actions
  show() {
    this.openValue = true
  }

  hide() {
    this.openValue = false
  }

  highlight() {
    if (this.isOpen && this.hasModalTarget) {
      this.modalTarget.style.overflowY = "hidden"
      this.modalTarget.classList.add("modal-static")

      this.modalTarget.addEventListener("transitionend", () => {
        this.modalTarget.classList.remove("modal-static")
        this.modalTarget.style.overflowY = ""
      }, { once: true })
    }
  }

  toggle(value: UIEvent): void
  toggle(value?: boolean): void
  toggle(value?: UIEvent | boolean) {
    this.openValue = (typeof value === "boolean") ? value : !this.openValue
  }

  // Internals
  private _setState(isOpen: boolean) {
    this.hasBackdrop && (isOpen ? this._createBackdrop() : this._removeBackdrop())

    this.modalTarget.style.display = "block"
    toggleAttribute(this.modalTarget, "aria-hidden", !isOpen)
    toggleAttribute(this.modalTarget, "aria-modal", isOpen)
    toggleAttribute(this.modalTarget, "role", isOpen, "dialog")

    this.modalTarget.offsetHeight // Trigger reflow
    this.modalTarget.classList.toggle("show", isOpen)

    if (!isOpen) {
      this.modalTarget.addEventListener("transitionend", () => {
        this.modalTarget.style.display = "none"
      }, { once: true })
    }
  }

  private _createBackdrop() {
    this.backdrop = document.createElement("div")
    this.backdrop.classList.add("modal-backdrop", "fade", "show")
    this.modalTarget.insertAdjacentElement("afterend", this.backdrop)
  }

  private _removeBackdrop() {
    if (this.backdrop) {
      this.backdrop.addEventListener("transitionend", () => {
        this.backdrop?.remove()
        this.backdrop = undefined
      }, { once: true })

      this.backdrop.classList.remove("show")
    }
  }
}
