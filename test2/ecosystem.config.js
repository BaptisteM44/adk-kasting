module.exports = {
  apps: [{
    name: 'adk-kasting',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/adk-kasting/test2',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
