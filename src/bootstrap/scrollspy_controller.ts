// Bootstrap Scrollspy
import { Controller } from "@hotwired/stimulus"
import { resolveTarget } from "./helpers"

export default class ScrollspyController extends Controller {
  static targets = ["scroll", "items", "targets"]
  static values = {
    rootMargin: { type: String, default: "0px 0px -25%" },
    threshold: { type: String, default: "0.1,0.5,1" },
  }

  declare readonly scrollTarget: HTMLElement
  declare readonly hasScrollTarget: boolean

  declare readonly itemsTargets: HTMLElement[]
  declare readonly hasItemsTarget: boolean

  declare readonly targetsTargets: HTMLElement[]
  declare readonly hasTargetsTarget: boolean

  declare rootMarginValue: string
  declare thresholdValue: string
  declare observer?: IntersectionObserver

  itemsMap: Map<string, HTMLElement> = new Map()

  visibleEntryTop = 0
  previousScrollTop = 0

  // Properties
  get thresholdValues(): number[] {
    return this.thresholdValue.split(",").map((value) => parseFloat(value))
  }

  get scrollElement(): Element {
    return this.hasScrollTarget ? this.scrollTarget : this.element
  }

  get intersectionOptions(): IntersectionObserverInit {
    return {
      root: this.scrollElement,
      threshold: this.thresholdValues,
      rootMargin: this.rootMarginValue,
    }
  }

  // Callbacks
  connect(): void {
    !this.observer && this._refresh()
  }

  scrollTargetConnected() {
    this._refresh()
  }

  scrollTargetDisconnected() {
    this._refresh()
  }

  rootMarginValueChanged() {
    this._refresh()
  }

  thresholdValueChanged() {
    this._refresh()
  }

  itemsTargetConnected(element: HTMLElement) {
    this.itemsMap.set(this._resolveTarget(element), element)
  }

  itemTargetDisconnected(element: HTMLElement) {
    this.itemsMap.delete(this._resolveTarget(element))
  }

  // Internals
  private _resolveTarget(value: HTMLElement | string): string {
    return typeof value === "string" ? value : resolveTarget(value, `data-${this.identifier}-target-param`)
  }

  private _isDisabled(element: HTMLElement): boolean {
    return (
      element.classList.contains("disabled") ||
      (typeof element.ariaDisabled === "string" && element.ariaDisabled !== "false") ||
      (element.hasAttribute("disabled") && element.getAttribute("disabled") !== "false")
    )
  }

  private _refresh() {
    this.observer?.disconnect()
    const observer = (this.observer = new IntersectionObserver(this._callback.bind(this), this.intersectionOptions))

    this.hasTargetsTarget && this.targetsTargets.forEach((element) => observer.observe(element))
  }

  private _callback(entries: IntersectionObserverEntry[]) {
    const scrollTop = this.scrollElement.scrollTop
    const direction = scrollTop >= this.previousScrollTop ? "down" : "up"
    this.previousScrollTop = scrollTop

    for (const entry of entries) {
      const target = entry.target as HTMLElement
      if (!entry.isIntersecting) {
        this._toggle(target, false)
      } else if (direction === "down" && target.offsetTop >= this.visibleEntryTop) {
        this._toggle(target, true)
        if (!scrollTop) {
          return
        }
      } else if (direction === "up" && target.offsetTop < this.visibleEntryTop) {
        this._toggle(target, true)
      }
    }
  }

  private _toggle(element: HTMLElement, isActive: boolean) {
    const item = this.itemsMap.get(element.id)

    if (isActive) {
      this.visibleEntryTop = element.offsetTop
    }

    if (!item || this._isDisabled(item)) {
      return
    }

    item.classList.toggle("active", isActive)
    if (item.classList.contains("dropdown-item")) {
      item.closest(".dropdown")?.querySelector(".dropdown-toggle")?.classList.toggle("active", isActive)
    } else {
      // TODO: I need an example to test this
    }
  }
}
