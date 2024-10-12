// Bootstrap Tab
import { Controller } from "@hotwired/stimulus"
import { resolveTarget, toggleAttribute } from "./helpers"

export default class TabController extends Controller {
  static targets = ["toggles", "panes"]
  static values = { current: String }

  declare readonly togglesTargets: HTMLElement[]
  declare readonly hasTogglesTarget: boolean

  declare readonly panesTargets: HTMLElement[]
  declare readonly hasPanesTarget: boolean

  declare currentValue: string

  // Initialization
  connect() {
    if (this.hasTogglesTarget && !this.currentValue) {
      const current = this.togglesTargets.findLast(toggle => toggle.classList.contains("active"))
      this.currentValue = current ? resolveTarget(current, "aria-controls") : ""
    }
  }

  // Callbacks
  currentValueChanged(newValue?: string, oldValue?: string) {
    this._deactivate(oldValue)
    this._activate(newValue)
  }

  // Actions
  show(value: string): void
  show(value: UIEvent): void
  show(value: UIEvent | string) {
    this.currentValue = this._resolveTarget(value)
  }

  hide(value: string): void
  hide(value: UIEvent): void
  hide(value: UIEvent | string) {
    if (this.currentValue === this._resolveTarget(value)) {
      this.currentValue = ""
    }
  }

  toggle(value: string): void
  toggle(value: UIEvent): void
  toggle(value: UIEvent | string) {
    const ref = this._resolveTarget(value)
    this.currentValue = (this.currentValue === ref) ? "" : ref
  }

  // Internals
  private _resolveTarget(value: UIEvent | string): string {
    return typeof value === "string" ? value : resolveTarget(value.target as HTMLElement, "aria-controls")
  }

  private _activate(id?: string) {
    id && this._setState(id, true)
  }

  private _deactivate(id?: string) {
    id && this._setState(id, false)
  }

  private _setState(id: string, isOpen: boolean) {
    this.hasTogglesTarget && this.togglesTargets.forEach((toggle) => {
      if (resolveTarget(toggle, "aria-controls") === id) {
        toggle.classList.toggle("active", isOpen)
        toggleAttribute(toggle, "aria-selected", isOpen)
        toggleAttribute(toggle, "tabindex", isOpen, "-1")
      }
    })

    this.hasPanesTarget && this.panesTargets.forEach((pane) => {
      if (pane.id === id) {
        pane.classList.toggle("active", isOpen)
        pane.classList.toggle("show", isOpen)
        pane.setAttribute("aria-hidden", (!isOpen).toString())
      }
    })
  }
}
