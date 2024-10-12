// Bootstrap Scrollspy
import { Controller } from "@hotwired/stimulus"

// TODO: To be implemented
export default class ScrollspyController extends Controller {
  static targets = ["scroll", "items", "targets"]

  declare readonly scrollTarget: HTMLElement
  declare readonly hasScrollTarget: boolean

  declare readonly itemsTargets: HTMLElement[]
  declare readonly hasItemsTarget: boolean

  declare readonly targetsTargets: HTMLElement[]
  declare readonly hasTargetsTarget: boolean

  // Properties
  get scrollElement(): Element {
    return this.hasScrollTarget ? this.scrollTarget : this.element
  }
}
