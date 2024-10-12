// Bootstrap Alert
import { Controller } from "@hotwired/stimulus"

export default class AlertController extends Controller {
  // Properties
  get isAnimated() {
    return this.element.classList.contains("fade")
  }

  // Actions
  close() {
    if (!this.isAnimated) {
      this.element.remove()
    } else {
      this.element.classList.remove("show")
      this.element.addEventListener("transitionend", this.element.remove, { once: true })
    }
  }
}
