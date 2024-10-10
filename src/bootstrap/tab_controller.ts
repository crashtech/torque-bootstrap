// Bootstrap Tab
import { Controller } from "@hotwired/stimulus"
import { resolveTarget } from "./helpers"

export class TabController extends Controller {
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
  show({ target }: UIEvent) {
    this.currentValue = resolveTarget(target as HTMLElement, "aria-controls")
  }

  hide({ target }: UIEvent) {
    if (this.currentValue === resolveTarget(target as HTMLElement, "aria-controls")) {
      this.currentValue = ""
    }
  }

  toggle({ target }: UIEvent) {
    const ref = resolveTarget(target as HTMLElement, "aria-controls")
    this.currentValue = (this.currentValue === ref) ? "" : ref
  }

  // Internals
  private _activate(id?: string) {
    id && this._setState(id, true)
  }

  private _deactivate(id?: string) {
    id && this._setState(id, false)
  }

  private _setState(id: string, state: boolean) {
    this.hasTogglesTarget && this.togglesTargets.forEach((toggle) => {
      if (resolveTarget(toggle, "aria-controls") === id) {
        toggle.classList.toggle("active", state)

        if(state) {
          toggle.setAttribute("aria-selected", "")
          toggle.removeAttribute("tabindex")
        } else {
          toggle.removeAttribute("aria-selected")
          toggle.setAttribute("tabindex", "-1")
        }
      }
    })

    this.hasPanesTarget && this.panesTargets.forEach((pane) => {
      if (pane.id === id) {
        pane.classList.toggle("active", state)
        pane.classList.toggle("show", state)
        pane.setAttribute("aria-hidden", (!state).toString())
      }
    })
  }
}
