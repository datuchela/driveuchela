const express = require('express')
// set up plain http server
const app = express()

// set up a route to redirect http to https
app.get('*', function (req, res) {
  console.log('someone hit http server')
  res.redirect('https://' + req.headers.host + req.url)
})

// have it listen on 8080
app.listen(8080, console.log('http server is listening on 8080'))
