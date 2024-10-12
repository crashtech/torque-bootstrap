// Bootstrap Button
import { Controller } from "@hotwired/stimulus"

export default class ButtonController extends Controller {
  static values = { active: Boolean }

  declare activeValue: boolean

  // Initialization
  connect() {
    if (!this.activeValue) {
      this.activeValue = this.element.classList.contains("active")
    }
  }

  // Callbacks
  activeValueChanged(newValue: boolean, oldValue: boolean) {
    if (newValue !== oldValue && typeof oldValue !== "undefined") {
      this.element.classList.toggle("active", newValue)
    }
  }

  // Actions
  toggle(value?: boolean) {
    this.activeValue = typeof value === "boolean" ? value : !this.activeValue
  }
}
