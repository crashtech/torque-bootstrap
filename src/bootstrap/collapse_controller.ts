// Bootstrap Collapse
import { Controller } from "@hotwired/stimulus"
import { resolveTarget, toggleAttribute } from "./helpers"

export default class CollapseController extends Controller {
  static targets = ["targets"]
  static values = { dimension: { type: String, default: "height" } }

  static dimensionToSize = {
    width: "scrollWidth",
    height: "scrollHeight",
  } as const

  declare readonly targetsTargets: HTMLElement[]
  declare readonly hasTargetsTarget: boolean

  declare dimensionValue: "width" | "height"

  // Properties
  get dimensionParam() {
    return `data-${this.identifier}-dimension-param`
  }

  // Callbacks
  targetsTargetConnected(element: HTMLElement) {
    element.hasAttribute(this.dimensionParam) || element.setAttribute(this.dimensionParam, this.dimensionValue)
  }

  // Actions
  show(value: string): void
  show(value: UIEvent): void
  show(value: string, ...others: string[]): void
  show(value: UIEvent | string, ...others: string[]) {
    this._toggle(this._resolveTargets(value, others), true)
  }

  hide(value: string): void
  hide(value: UIEvent): void
  hide(value: string, ...others: string[]): void
  hide(value: UIEvent | string, ...others: string[]) {
    this._toggle(this._resolveTargets(value, others), false)
  }

  toggle(value: string): void
  toggle(value: UIEvent): void
  toggle(value: string, ...others: string[]): void
  toggle(value: UIEvent | string, ...others: string[]) {
    this._toggle(this._resolveTargets(value, others))
  }

  // Internals
  private _resolveTargets(value: UIEvent | string, others?: string[]): Set<string> {
    value = (typeof value === "string") ? value : resolveTarget(value.target as HTMLElement, "aria-controls")
    return new Set([...value.split(/,|\s+/), ...(others || [])])
  }

  private _toggle(ids: Set<string>, isOpen?: boolean) {
    this.hasTargetsTarget && this.targetsTargets.forEach(element => {
      ids.has(element.id) && !element.classList.contains("collapsing") && this._setState(element, isOpen)
    })
  }

  private _setState(element: HTMLElement, isOpen?: boolean) {
    const dimension = element.getAttribute(this.dimensionParam) as typeof this.dimensionValue
    isOpen = (typeof isOpen === "boolean") ? isOpen : !element.classList.contains("show")

    element.style[dimension] = isOpen ? "0" : this._getFullSizeOf(element, dimension, false)
    element.offsetHeight // Trigger reflow

    element.classList.add("collapsing")
    element.classList.remove("collapse", "show")
    toggleAttribute(element, "aria-expanded", isOpen)

    element.addEventListener("transitionend", () => {
      element.classList.add("collapse")
      element.classList.remove("collapsing")
      isOpen && element.classList.add("show")

      if (isOpen) {
        element.style[dimension] = ''
      }
    }, { once: true })

    console.log(this._getFullSizeOf(element, dimension, true))
    element.style[dimension] = isOpen ? this._getFullSizeOf(element, dimension, true) : ""
  }

  private _getFullSizeOf(element: HTMLElement, dimension: "width" | "height", isOpen: boolean): string {
    if (isOpen) {
      return `${element[CollapseController.dimensionToSize[dimension]]}px`
    } else {
      return `${element.getBoundingClientRect()[dimension]}px`
    }
  }
}
