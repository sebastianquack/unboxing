const http = require('http')
const port = 80

const requestHandler = (request, response) => {
  console.log(request.url)
  if (request.url == '/generate_204') {
    response.statusCode = 204;
    console.log('Mocking internet access')
    response.end()
  }
}

const server = http.createServer(requestHandler)

server.on('error', (error) => {
  console.warn("mock server could not start", error, error.code=='EADDRINUSE' && " ----> you need to run with admin privileges to use port 80")
})

server.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`Mock internet server is listening on ${port}`)
})
