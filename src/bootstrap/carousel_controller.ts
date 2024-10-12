// Bootstrap Carousel
import { Controller } from "@hotwired/stimulus"
import { toggleAttribute } from "./helpers"

export type ToEvent = UIEvent & { params: { slide?: number } }

function clearAnimationClasses(this: HTMLElement) {
  this.classList.remove(
    CarouselController.cssClasses.directionLtr,
    CarouselController.cssClasses.directionRtl,
    CarouselController.cssClasses.orderLtr,
    CarouselController.cssClasses.orderRtl
  )
}

export default class CarouselController extends Controller {
  static targets = ["slides", "indicators"]
  static values = {
    current: Number,
    interval: { type: Number, default: 3000 },
    wrap: { type: Boolean, default: true },
    direction: { type: String, default: document.documentElement.dir === "rtl" ? "right" : "left" },
    paused: Boolean,
  }

  static cssClasses = {
    directionLtr: "carousel-item-start",
    directionRtl: "carousel-item-end",
    orderLtr: "carousel-item-next",
    orderRtl: "carousel-item-prev",
  }

  declare readonly slidesTargets: HTMLElement[]
  declare readonly hasSlidesTarget: boolean

  declare readonly indicatorsTargets: HTMLElement[]
  declare readonly hasIndicatorsTarget: boolean

  declare currentValue: number
  declare intervalValue: number
  declare pausedValue: boolean
  declare wrapValue: boolean
  declare directionValue: "left" | "right"

  declare wrapping: undefined | true
  declare interval?: ReturnType<typeof setInterval>

  // Properties
  get isPaused() {
    return !!this.pausedValue
  }

  // Callbacks
  pausedValueChanged(newValue: boolean) {
    if (!newValue) {
      this.interval = setInterval(this.next.bind(this), this.intervalValue)
    } else if (this.interval) {
      clearInterval(this.interval)
      this.interval = undefined
    }
  }

  intervalValueChanged(newValue: number) {
    if (!this.isPaused) {
      this.interval && clearInterval(this.interval)
      this.interval = newValue ? setInterval(this.next.bind(this), newValue) : undefined
    }
  }

  currentValueChanged(newValue: number, oldValue?: number) {
    let order = typeof oldValue === "undefined" ? oldValue : newValue > oldValue ? true : false
    order = this.wrapping ? !order : order

    if (typeof oldValue === "number") {
      this._update(oldValue, false, order)
    }
    if (typeof newValue === "number") {
      this._update(newValue, true, order)
    }

    this.wrapping = undefined
  }

  slidesTargetConnected(element: HTMLElement) {
    element.addEventListener("transitionend", clearAnimationClasses)
  }

  slidesTargetDisconnected(element: HTMLElement) {
    element.removeEventListener("transitionend", clearAnimationClasses)
  }

  // Actions
  toggle(value?: boolean) {
    this.pausedValue = typeof value === "boolean" ? value : !this.pausedValue
  }

  pause() {
    this.pausedValue = true
  }

  start() {
    this.pausedValue = false
  }

  next() {
    this[this.directionValue == "left" ? "_next" : "_prev"]()
  }

  prev() {
    this[this.directionValue == "left" ? "_prev" : "_next"]()
  }

  to(event: number): void
  to(event: ToEvent): void
  to(value: ToEvent | number) {
    const slide = typeof value === "number" ? value : value.params.slide

    if (typeof slide !== "number") {
      console.error(`You must provide a data-${this.identifier}-slide-param with a valid number.`)
    } else if (!this.hasSlidesTarget || slide < 0 || slide >= this.slidesTargets.length) {
      console.error(`The slide number must be between 0 and ${this.slidesTargets.length - 1}.`)
    } else {
      this.currentValue = slide
    }
  }

  // Internals
  private _next() {
    const last = this.hasSlidesTarget ? this.slidesTargets.length - 1 : 0

    this.intervalValue = 0
    if (this.currentValue < last) {
      this.currentValue++
    } else if (this.currentValue > 0 && this.wrapValue) {
      this.wrapping = true
      this.currentValue = 0
    } else if (!this.isPaused) {
      this.pause()
    }
  }

  private _prev() {
    this.intervalValue = 0
    if (this.currentValue > 0) {
      this.currentValue--
    } else if (this.wrapValue && this.hasSlidesTarget) {
      this.wrapping = true
      this.currentValue = this.slidesTargets.length - 1
    } else if (!this.isPaused) {
      this.pause()
    }
  }

  private _update(index: number, isVisible: boolean, animateLtr?: boolean) {
    if (this.hasIndicatorsTarget) {
      this._setState(this.indicatorsTargets[index], isVisible)
    }

    if (this.hasSlidesTarget) {
      const element = this.slidesTargets[index]
      const interval = this._getIntervalOf(element)

      this._setState(element, isVisible, animateLtr)

      if (isVisible && interval !== this.intervalValue) {
        this.intervalValue = interval
      }
    }
  }

  private _getIntervalOf(element: HTMLElement): number {
    const value = element.getAttribute(`data-${this.identifier}-interval-param`)
    return (typeof value === "string" && Number(value.replace(/_/g, ""))) || this.intervalValue
  }

  private _setState(element: HTMLElement, isVisible: boolean, animateLtr?: boolean) {
    toggleAttribute(element, "aria-current", isVisible)

    this.pause()
    if (typeof animateLtr === "boolean") {
      this._animate(element, isVisible, animateLtr)
    } else {
      element.classList.toggle("active", isVisible)
    }
  }

  private _animate(element: HTMLElement, isVisible: boolean, animateLtr: boolean) {
    const [directionClass, orderClass] = this._animationClasses(animateLtr)

    if (isVisible) {
      element.classList.add(orderClass)
      element.offsetHeight // Trigger reflow
      element.classList.add(directionClass)
    } else {
      element.classList.add(directionClass)
    }

    element.addEventListener("transitionend", () => element.classList.toggle("active", isVisible), { once: true })
  }

  private _animationClasses(ltr?: boolean): [string, string] {
    const values = CarouselController.cssClasses
    return ltr ? [values.directionLtr, values.orderLtr] : [values.directionRtl, values.orderRtl]
  }
}
