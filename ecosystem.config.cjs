module.exports = {
  apps: [{
    name: 'chainflow-website',
    script: './dist/server/entry.mjs',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      HOST: '127.0.0.1',
      PORT: 4321
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '500M',
    watch: false
  }]
}
