// Bootstrap Alert
import { Controller } from "@hotwired/stimulus"
import { onTransitionEnd } from "./helpers"

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
      onTransitionEnd(this.element, this.element.remove)
      this.element.classList.remove("show")
    }
  }
}
