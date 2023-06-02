const { spawn } = require('child_process')

// install dependencies every time package.json changes
const npmProcess = spawn('nodemon --polling-interval 10000 -L -w package.json --exec "npm i"', {
  stdio: 'inherit',
  shell: true,
})

// restart node when a source file changes, plus
// restart when `npm install` ran based on `package-lock.json` changing
const appProcess = spawn('nodemon --polling-interval 2000 -L --inspect -e js,json --ignore package.json ./proj/index.js', {
  stdio: 'inherit',
  shell: true,
})

process.on('SIGTERM', async () => {
  npmProcess.kill('SIGTERM')
  appProcess.kill('SIGTERM')
})
