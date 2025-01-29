module.exports = {
  apps: [
    {
      name: "🛠️ Core",
      cwd: "rob-core",
      script: "yarn build",
      stop_exit_codes: [0],
      watch: [
        "src"
      ]
    },
    {
      name: "🛠️ Server",
      cwd: "rob-server",
      script: "yarn build",
      stop_exit_codes: [0],
      watch: [
        "src",
        "../rob-web/dist"
      ]
    },
    {
      name: "🌐 Server",
      cwd: "rob-server",
      script: "dist/main.js",
      watch: ["dist"],
      kill_timeout: 3000
    },
    {
      cwd: "rob-client",
      name: "🌐 Client",
      script: "yarn start",
      watch: [
        "../rob-web/dist"
      ]
    }
  ]
}
