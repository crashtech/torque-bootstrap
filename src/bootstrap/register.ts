// Responsible for registering all necessary controllers into the provided Stimulus application instance.

import type { Application } from "@hotwired/stimulus"

import * as controllers from "./controllers"

export function eagerLoadBootstrapControllers(application: Application, prefix: String = "bs"): void {
  for (const [key, controller] of Object.entries(controllers)) {
    application.register(`${prefix}-${key.toLocaleLowerCase()}`, controller)
  }
}
