// Bootstrap Tab
import { Controller } from "@hotwired/stimulus"

export type ToggleEvent = UIEvent & { params: { id?: string } }

export class Tab extends Controller {
  static targets = ["toggles", "panes"]
  static values = { current: String }

  declare readonly togglesTargets: HTMLElement[]
  declare readonly hasTogglesTarget: boolean

  declare readonly panesTargets: HTMLElement[]
  declare readonly hasPanesTarget: boolean

  declare currentValue: string

  // Callbacks
  currentValueChanged(newValue?: string, oldValue?: string) {
    this.doHide(oldValue)
    this.doShow(newValue)
  }

  // Actions
  show({ params: { id } }: ToggleEvent) {
    this.currentValue = id ?? ''
  }

  hide({ params: { id } }: ToggleEvent) {
    if (this.currentValue === id) {
      this.currentValue = ''
    }
  }

  toggle(event: ToggleEvent) {
    this[this.currentValue === event.params.id ? 'hide' : 'show'](event)
  }

  // Internals
  private doShow(id?: string) {
    id && this.doToggle(id, true)
  }

  private doHide(id?: string) {
    id && this.doToggle(id, false)
  }

  private doToggle(id: string, state: boolean) {
    this.hasTogglesTarget && this.togglesTargets.forEach(toggle => {
      toggle.getAttribute("data-bs-tab-id-param") === id && toggle.classList.toggle("active", state)
    })

    this.hasPanesTarget && this.panesTargets.forEach(pane => {
      if (pane.id === id) {
        pane.classList.toggle("active", state)
        pane.classList.toggle("show", state)
      }
    })
  }
}
