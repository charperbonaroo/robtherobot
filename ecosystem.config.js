module.exports = {
  apps: [
    {
      name: "🛠️ GUI",
      cwd: "rob-gui",
      script: "yarn build:skip-types",
      stop_exit_codes: [0],
      watch: [
        "src"
      ]
    },
    {
      name: "🌐 GUI",
      cwd: "rob-gui",
      script: "yarn dev",
      stop_exit_codes: [0],
      watch: []
    },
    {
      name: "🛠️ Client",
      cwd: "rob-client",
      script: "yarn build:skip-types",
      stop_exit_codes: [0],
      watch: [
        "src",
        "../rob-web/dist",
        "../rob-gui/dist",
      ]
    },
    {
      name: "🌐 Client",
      cwd: "rob-client",
      script: "yarn dev",
      stop_exit_codes: [0],
      watch: []
    },
    {
      name: "🛠️ Host",
      cwd: "rob-host",
      script: "yarn build:skip-types",
      stop_exit_codes: [0],
      watch: [
        "src"
      ]
    },
    {
      name: "🛠️ Web",
      cwd: "rob-web",
      script: "yarn build:skip-types",
      stop_exit_codes: [0],
      watch: [
        "src"
      ]
    },
    {
      name: "🛠️ Server",
      cwd: "rob-server",
      script: "yarn build:skip-types",
      stop_exit_codes: [0],
      watch: [
        "src",
        "../rob-web/dist",
        "../rob-host/dist",
      ]
    },
    {
      name: "🌐 Server",
      cwd: "rob-server",
      script: "node --no-deprecation dist/main.js",
      watch: ["dist"],
      kill_timeout: 3000
    }
  ]
}
