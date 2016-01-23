import dotenv from 'dotenv'
import express from 'express'
import Clarifai from './lib/clarifai_node.js'
import request from 'superagent'
import bodyParser from 'body-parser'
import path from 'path'

dotenv.config()

if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
  console.log('ERROR: Clarifai CLIENT_ID and CLIENT_SECRET required')
  process.exit(1)
}

if (!process.env.FIREBASE_URL) {
  console.log('ERROR: Cannot find FIREBASE_URL in \'.env\'')
  process.exit(1)
}

Clarifai.initAPI(process.env.CLIENT_ID, process.env.CLIENT_SECRET)

let app = express()
app.use(bodyParser.json())

app.post('/uploadimage', (req, res) => {
  console.log(req.body)
})

app.put('/user/update', (req, res) => {
  console.log(req.body)
  if (req.body.id && req.body.name) {
    let reqPath = 'https://' +
      path.join(
        process.env.FIREBASE_URL,
        'users',
        `${req.body.id}.json`)
    console.log(reqPath)
    request
      .put(reqPath)
      .set('Accept', 'application/json')
      .send({name: req.body.name})
      .end((err, data) => {
        if (err) {
          return res.json({err: err})
        } else {
          return res.json({data: JSON.parse(data.text)})
        }
      })
  } else {
    return res.json({err: '`id` or `name` not specified'})
  }
})

app.get('/user/info', (req, res) => {
  if (req.body.id) {
    let reqPath = 'https://' +
      path.join(
        process.env.FIREBASE_URL,
        'users',
        `${req.body.id}.json`)
    request
      .get(reqPath)
      .set('Accept', 'application/json')
      .end((err, data) => {
        if (err) {
          return res.json({err: err})
        } else {
          return res.json({data: JSON.parse(data.text)})
        }
      })
  } else {
    return res.json({err: '`id` not specified'})
  }
})

app.post('/user/match', (req, res) => {

})

app.post('/user/addimage', (req, res) => {

})

let server = app.listen(process.env.port || 8000, () => {
  console.log(`Listening on port ${server.address().port}`)
})
