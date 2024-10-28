// Bootstrap Tooltip
import { createPopper, Options, Instance } from "@popperjs/core"
import { Controller } from "@hotwired/stimulus"
import { onTransitionEnd } from "./helpers"

export type PopperConfig = Partial<Options> & Pick<Options, "modifiers">

export default class TooltipController extends Controller {
  static values = {
    placement: String,
    fallbackPlacements: String,
    offset: Array,
    boundary: String,
    delay: Number,

    animation: { type: Boolean, default: true },
    enabled: { type: Boolean, default: true },
    customClass: String,
    display: Object,
    title: String,
    html: Boolean,

    show: Boolean,
  }

  static templates = new Map<Function, HTMLTemplateElement>()
  static popperConfig: PopperConfig = {
    placement: "top",
    modifiers: [
      { name: "flip", options: { fallbackPlacements: ["top", "right", "bottom", "left"] } },
      { name: "offset", options: { offset: [0, 6] } },
      { name: "preventOverflow", options: { boundary: "clippingParents" } },
    ]
  }

  declare animationValue: boolean
  declare boundaryValue: string
  declare customClassValue: string
  declare delayValue: number
  declare fallbackPlacementsValue: string
  declare htmlValue: boolean
  declare offsetValue: [number, number]
  declare placementValue: "auto" | "top" | "right" | "bottom" | "left"
  declare triggerValue: string
  declare titleValue: string
  declare enabledValue: boolean
  declare displayValue: Record<string, string>
  declare showValue: boolean

  declare hasPlacementValue: boolean
  declare hasFallbackPlacementsValue: boolean
  declare hasOffsetValue: boolean
  declare hasBoundaryValue: boolean

  declare hasCustomClassValue: boolean
  declare hasDisplayValue: boolean
  declare hasTitleValue: boolean

  tipElement?: HTMLElement
  popper?: Instance
  timer?: ReturnType<typeof setTimeout>

  // Properties
  get fallbackPlacements(): string[] {
    return this.fallbackPlacementsValue.split(",")
  }

  get canShow(): boolean {
    return this.element.checkVisibility()
  }

  get isReady(): boolean {
    return (this.hasDisplayValue && Object.keys(this.displayValue).length > 0) || this.titleValue.length > 0
  }

  get template(): HTMLTemplateElement {
    return TooltipController.templates.get(this.constructor) || this._findOrCreateTemplate()
  }

  get tip(): HTMLElement {
    return this.tipElement || this._createTip()
  }

  get contentForTemplate(): Record<string, string> {
    return this.hasDisplayValue ? this.displayValue : { ".tooltip-inner": this.titleValue }
  }

  get popperLocalOptions(): PopperConfig {
    let options: PopperConfig = { modifiers: [] }

    // TODO: Resolve RTL support
    this.hasPlacementValue && (options.placement = this.placementValue)
    this.hasFallbackPlacementsValue && (options.modifiers.push({
      name: "flip", options: { fallbackPlacements: this.fallbackPlacements }
    }))

    this.hasOffsetValue && (options.modifiers.push({
      name: "offset", options: { offset: this.offsetValue }
    }))

    this.hasBoundaryValue && (options.modifiers.push({
      name: "preventOverflow", options: { boundary: this.boundaryValue }
    }))

    return options
  }

  get popperOptions(): PopperConfig {
    const custom = this.popperLocalOptions
    return {
      ...TooltipController.popperConfig,
      ...custom,
      modifiers: [
        ...TooltipController.popperConfig.modifiers,
        ...custom.modifiers,
        { name: "arrow", options: { element: ".tooltip-arrow" } },
        { name: "preSetPlacement", enabled: true, phase: "beforeMain", fn: (data) => {
          this.tip.setAttribute("data-popper-placement", data.state.placement)
        }},
      ],
    }
  }

  get autoClass(): string {
    return "bs-tooltip-auto"
  }

  get HTMLTemplate(): string {
    return `
      <div class="tooltip" role="tooltip">
        <div class="tooltip-arrow"></div>
        <div class="tooltip-inner"></div>
      </div>
    `
  }

  // Callbacks
  connect(): void {
    if (!(this.hasTitleValue || this.hasDisplayValue)) {
      this.titleValue = this.element.getAttribute("title") || ""
      this.element.removeAttribute("title")
    }
  }

  showValueChanged(newValue: boolean) {
    if (!newValue) {
      this._hide()
    } else if (!this.delayValue) {
      this._show()
    } else {
      this.timer = setTimeout(this._show.bind(this), this.delayValue)
    }
  }

  contentValueChanged() {
    this.refresh()
  }

  titleValueChanged() {
    this.refresh()
  }

  // Actions
  enabled() {
    this.toggleEnabled(true)
  }

  disabled() {
    this.toggleEnabled(false)
  }

  toggleEnabled(value?: boolean) {
    this.enabledValue = value ?? !this.enabledValue
  }

  show() {
    this.showValue = true
  }

  hide() {
    this.showValue = false
  }

  toggle(value: boolean): void
  toggle(value: UIEvent): void
  toggle(value: UIEvent | boolean) {
    this.showValue = typeof value === "boolean" ? value : !this.showValue
  }

  refresh() {
    if (this.showValue) {
      this._dispose()
      this._show()
    }
  }

  // Internals
  private _show() {
    if (!this.canShow) {
      throw new Error("Please use show on visible elements")
    } else if (!this.isReady || !this.enabledValue) {
      return
    }

    this.timer = undefined
    this.popper = createPopper(this.element, this.tip, this.popperOptions)
    this.tip.classList.add("show")
  }

  private _hide() {
    if (this.timer) {
      clearTimeout(this.timer)
      return
    } else if (!this.popper) {
      return
    }

    this.tip.classList.remove("show")
    this.animationValue ? onTransitionEnd(this.tip, this._dispose.bind(this)) : this._dispose()
  }

  private _dispose() {
    if (this.popper) {
      this.popper.destroy()
      this.popper = undefined
    }

    if (this.tipElement) {
      this.tipElement.remove()
      this.tipElement = undefined
    }
  }

  private _findOrCreateTemplate(): HTMLTemplateElement {
    let element = document.querySelector(`template#${this.identifier}-template`) as HTMLTemplateElement
    if (!element) {
      element = document.createElement("template")
      element.setAttribute("id", `${this.identifier}-template`)
      element.innerHTML = this.HTMLTemplate
      document.body.appendChild(element)
    }

    TooltipController.templates.set(this.constructor, element)
    return element
  }

  private _createTip(): HTMLElement {
    const tip = this.template.content.firstElementChild!.cloneNode(true) as HTMLElement
    this.hasCustomClassValue && tip.classList.add(this.customClassValue)
    tip.classList.toggle("fade", this.animationValue)
    tip.classList.remove("show")
    tip.classList.add(this.autoClass)

    for (const [selector, content] of Object.entries(this.contentForTemplate)) {
      const element = tip.querySelector(selector)
      if (element) {
        this.htmlValue ? element.innerHTML = content : element.textContent = content
      }
    }

    document.body.appendChild(tip)
    return this.tipElement = tip
  }
}
