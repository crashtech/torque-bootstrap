import resolve from "@rollup/plugin-node-resolve"
import typescript from "@rollup/plugin-typescript"
import { terser } from "rollup-plugin-terser"
import { version } from "./package.json"

const banner = `/*\nTorque Bootstrap ${version}\n */`

export default [
  {
    input: "src/index.js",
    output: [
      {
        name: "Torque Bootstrap",
        file: "dist/bootstrap.umd.js",
        format: "umd",
        banner
      },
      {
        file: "dist/bootstrap.js",
        format: "es",
        banner
      },
    ],
    context: "window",
    external: ["@hotwired/stimulus"],
    plugins: [
      resolve(),
      typescript()
    ]
  },
  {
    input: "src/index.js",
    output: {
      file: "dist/bootstrap.min.js",
      format: "es",
      banner,
      sourcemap: true
    },
    context: "window",
    external: ["@hotwired/stimulus"],
    plugins: [
      resolve(),
      typescript(),
      terser({
        mangle: true,
        compress: true
      })
    ]
  }
]
