// Bootstrap Dropdown
import { Controller } from "@hotwired/stimulus"
import { toggleAttribute } from "./helpers"

// TODO: To be implemented, with Popper.js
export default class DropdownController extends Controller {
  static targets = ["menu", "button"]
  static values = { open: Boolean }

  declare readonly buttonTarget: HTMLElement
  declare readonly hasButtonTarget: boolean

  declare readonly menuTarget: HTMLElement
  declare readonly hasMenuTarget: boolean

  declare openValue: boolean

  // Properties
  get isOpen() {
    return !!this.openValue
  }

  // Callbacks
  openValueChanged(newValue: boolean) {
    if (this.hasButtonTarget) {
      toggleAttribute(this.buttonTarget, "aria-expanded", newValue)
      this.buttonTarget.classList.toggle("show", newValue)
    }

    if (this.hasMenuTarget) {
      this.menuTarget.classList.toggle("show", newValue)
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
    this.openValue = (typeof value === "boolean") ? value : !this.openValue
  }
}
