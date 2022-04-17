const http = require('http')
const PORT = process.env.PORT || '8080'
const todoRoute = require('./router')

const server = http.createServer(todoRoute)
server.listen(PORT, console.log(`Server is running at PORT ${PORT}`))