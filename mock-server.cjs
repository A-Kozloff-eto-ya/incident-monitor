const http = require('node:http')

const regions = ['Центральный', 'Северо-Западный', 'Приволжский', 'Уральский']
const departments = ['Транспорт', 'Энергетика', 'Безопасность', 'Связь']
const severities = ['info', 'warning', 'critical']

const server = http.createServer((req, res) => {
  if (req.url !== '/api/events') {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Not found')
    return
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'X-Accel-Buffering': 'no',
  })
  res.write(': connected\n\n')

  const interval = setInterval(() => {
    const batchSize = Math.floor(Math.random() * 20) + 10
    for (let i = 0; i < batchSize; i += 1) {
      const payload = JSON.stringify({
        id: globalThis.crypto.randomUUID(),
        region: regions[Math.floor(Math.random() * regions.length)],
        department: departments[Math.floor(Math.random() * departments.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        message: `Инцидент #${Math.floor(Math.random() * 9000) + 1000}`,
        timestamp: Date.now(),
      })
      res.write(`data: ${payload}\n\n`)
    }
  }, 200)

  req.on('close', () => {
    clearInterval(interval)
    if (!res.writableEnded) res.end()
  })
})

const port = Number(process.env.PORT ?? 3001)
server.listen(port, '127.0.0.1', () => {
  console.log(`Mock SSE server is listening on http://127.0.0.1:${port}/api/events`)
})

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)))
}
