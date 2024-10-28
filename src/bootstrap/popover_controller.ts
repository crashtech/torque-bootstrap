// Bootstrap Popover
import TooltipController, { PopperConfig } from "./tooltip_controller"

export default class PopoverController extends TooltipController {
  static values = { ...TooltipController.values, content: String }

  declare contentValue: string
  declare hasContentValue: boolean

  get isReady(): boolean {
    return (this.hasDisplayValue && Object.keys(this.displayValue).length > 0) ||
      (this.titleValue.length > 0 && this.hasContentValue && this.contentValue.length > 0)
  }

  get contentForTemplate(): Record<string, string> {
    return this.hasDisplayValue ? this.displayValue : {
      ".popover-header": this.titleValue,
      ".popover-body": this.contentValue,
    }
  }

  get popperOptions(): PopperConfig {
    const custom = this.popperLocalOptions
    return {
      ...PopoverController.popperConfig,
      ...custom,
      modifiers: [
        ...PopoverController.popperConfig.modifiers,
        ...custom.modifiers,
        { name: "arrow", options: { element: ".popover-arrow" } },
        { name: "preSetPlacement", enabled: true, phase: "beforeMain", fn: (data) => {
          this.tip.setAttribute("data-popper-placement", data.state.placement)
        }},
      ],
    }
  }

  get autoClass(): string {
    return "bs-popover-auto"
  }

  get HTMLTemplate(): string {
    return `
      <div class="popover" role="tooltip">
        <div class="popover-arrow"></div>
        <h3 class="popover-header"></h3>
        <div class="popover-body"></div>
      </div>
    `
  }
}
