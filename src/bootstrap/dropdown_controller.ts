// Bootstrap Dropdown
import { createPopper, Instance } from "@popperjs/core"
import { Controller } from "@hotwired/stimulus"
import { isFormControl, toggleAttribute } from "./helpers"

import { PopperConfig } from "./tooltip_controller"

export default class DropdownController extends Controller {
  static targets = ["reference", "menu", "button"]
  static values = {
    boundary: { type: String, default: "clippingParents" },
    display: { type: String, default: "dynamic" },
    autoClose: { type: Boolean, default: true },
    offset: Array,
    open: Boolean,
  }

  declare readonly buttonTarget: HTMLElement
  declare readonly hasButtonTarget: boolean

  declare readonly menuTarget: HTMLElement
  declare readonly hasMenuTarget: boolean

  declare readonly referenceTarget: HTMLElement
  declare readonly hasReferenceTarget: boolean

  declare boundaryValue: string
  declare displayValue: string
  declare offsetValue: [number, number]
  declare autoCloseValue: boolean
  declare openValue: boolean

  declare hasOffsetValue: boolean

  popper?: Instance

  // Properties
  get isInNavBar() {
    return this.element.closest(".navbar") !== null
  }

  get isOpen() {
    return !!this.openValue
  }

  get isReady() {
    return this.hasMenuTarget && (this.hasReferenceTarget || this.hasButtonTarget)
  }

  get isEndPositioned() {
    return this.hasMenuTarget && (this.menuTarget.style.getPropertyValue("--bs-position") || "").trim() === "end"
  }

  // TODO: Resolve RTL support
  get placement(): PopperConfig["placement"] {
    const element = this.element as HTMLElement
    if (element.classList.contains("dropend")) {
      return "right-start"
    } else if (element.classList.contains("dropstart")) {
      return "left-start"
    } else if (element.classList.contains("dropup-center")) {
      return "top"
    } else if (element.classList.contains("dropdown-center")) {
      return "bottom"
    } else if (element.parentElement?.classList.contains("dropup")) {
      return this.isEndPositioned ? "top-end" : "top-start"
    } else {
      return this.isEndPositioned ? "bottom-end" : "bottom-start"
    }
  }

  get popperLocalOptions(): PopperConfig {
    const options: PopperConfig = { placement: this.placement, modifiers: [] }

    if (this.isInNavBar || this.displayValue === "static") {
      options.modifiers.push({ name: "applyStyles", enabled: false })
    } else {
      this.hasOffsetValue &&
        options.modifiers.push({
          name: "offset",
          options: { offset: this.offsetValue },
        })

      options.modifiers.push({
        name: "preventOverflow",
        options: { boundary: this.boundaryValue },
      })
    }

    return options
  }

  get popperOptions(): PopperConfig {
    return { ...this.popperLocalOptions }
  }

  // Callbacks
  connect(): void {
    document.addEventListener("click", this._autoClose)
    document.addEventListener("keyup", this._autoClose)
  }

  disconnect(): void {
    document.removeEventListener("click", this._autoClose)
    document.removeEventListener("keyup", this._autoClose)
  }

  openValueChanged(newValue: boolean) {
    newValue ? this._show() : this._hide()
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
    this.openValue = typeof value === "boolean" ? value : !this.openValue
  }

  refresh() {
    if (this.openValue) {
      this._dispose()
      this._show()
    }
  }

  // Internals
  private _autoClose = (event: MouseEvent | KeyboardEvent) => {
    if (
      !this.isOpen ||
      !this.autoCloseValue ||
      (event instanceof MouseEvent && event.button === 2) ||
      (event instanceof KeyboardEvent && event.key !== "Tab")
    ) {
      return
    }

    const path = event.composedPath()
    if (
      path.includes(this.element) ||
      (this.hasMenuTarget && this.menuTarget.contains(event.target as Node)) ||
      (event instanceof KeyboardEvent && isFormControl(event.target as HTMLElement))
    ) {
      return
    }

    this.hide()
  }

  private _show() {
    if (!this.isReady) {
      return
    }

    const reference = this.hasReferenceTarget ? this.referenceTarget : this.buttonTarget
    this.popper = createPopper(reference, this.menuTarget, this.popperOptions)
    this.element instanceof HTMLElement && this.element.focus()
    this._toggle(true)
  }

  private _hide() {
    if (!this.popper) {
      return
    }

    this._dispose()
    this._toggle(false)
  }

  private _toggle(state: boolean) {
    toggleAttribute(this.element, "aria-expanded", state)
    this.hasMenuTarget && this.menuTarget.classList.toggle("show", state)
    this.hasButtonTarget && this.buttonTarget.classList.toggle("show", state)
  }

  private _dispose() {
    if (this.popper) {
      this.popper.destroy()
      this.popper = undefined
    }
  }
}
