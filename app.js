import dotenv from 'dotenv'
import express from 'express'
import Clarifai from './lib/clarifai_node.js'
import request from 'superagent'
import bodyParser from 'body-parser'
import path from 'path'
import FireAPI from './lib/fire_api.js'

dotenv.config()
const CLARIFAI_TOKEN_URL = 'https://api.clarifai.com/v1/token/'
const CLARIFAI_TAG_URL = 'https://api.clarifai.com/v1/tag/'

if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
  console.log('ERROR: Clarifai CLIENT_ID and CLIENT_SECRET required')
  process.exit(1)
}

if (!process.env.FIREBASE_URL) {
  console.log("ERROR: Cannot find FIREBASE_URL in '.env'")
  process.exit(1)
}

// Init Clarifai -------------------------
Clarifai.initAPI(process.env.CLIENT_ID, process.env.CLIENT_SECRET)

let CLARIFAI_ACCESS_TOKEN

let GetToken = function () {
  request
    .post(CLARIFAI_TOKEN_URL)
    .type('form')
    .send({grant_type: 'client_credentials'})
    .send({client_id: process.env.CLIENT_ID})
    .send({client_secret: process.env.CLIENT_SECRET})
    .end((err, res) => {
      if (err) {
        throw err
      } else {
        CLARIFAI_ACCESS_TOKEN = res.res.body.access_token
        console.log('Clarify token update:', CLARIFAI_ACCESS_TOKEN)
        setTimeout(GetToken, 30000)
      }
    })
}

GetToken()

// Init FireAPI

let Fire = new FireAPI(process.env.FIREBASE_URL)

let app = express()
app.use(bodyParser.json())

app.all('/test', (req, res) => {
  console.log(req.body)
  return res.json({data: req.body})
})

app.get('/user/list', (req, res) => {
  return Fire.req({
    action: 'get',
    endpoint: 'users.json?shallow=true',
    headers: [['Accept', 'application/json']]
  }, res)
})

app.put('/user/update', (req, res) => {
  if (req.body.id && req.body.name) {
    return Fire.req({
      action: 'patch',
      endpoint: path.join('users', `${req.body.id}.json`),
      headers: [['Accept', 'application/json']],
      params: [{name: req.body.name}]
    }, res)
  } else {
    return res.json({err: '`id` or `name` not specified'})
  }
})

app.get('/user/info', (req, res) => {
  if (req.body.id) {
    return Fire.req({
      action: 'get',
      endpoint: path.join('users', `${req.body.id}.json`),
      headers: [['Accept', 'application/json']]
    }, res)
  } else {
    return res.json({err: '`id` not specified'})
  }
})

app.get('/user/info/name', (req, res) => {
  if (req.body.id) {
    return Fire.req({
      action: 'get',
      endpoint: path.join('users', req.body.id, 'name.json'),
      headers: [['Accept', 'application/json']]
    }, res)
  } else {
    return res.json({err: '`id` not specified'})
  }
})

app.get('/user/info/tags', (req, res) => {
  if (req.body.id) {
    return Fire.req({
      action: 'get',
      endpoint: path.join('users', req.body.id, 'tags.json'),
      headers: [['Accept', 'application/json']]
    }, res)
  } else {
    return res.json({err: '`id` not specified'})
  }
})

app.post('/user/match', (req, res) => {
  if (req.body.id) {

  }
})

app.post('/user/addimage', (req, res) => {
  let imageData = req.body.image_data
  if (req.body.id && imageData) {
    // Clarifai
    request
      .post(CLARIFAI_TAG_URL)
      .set('Authorization', `Bearer ${CLARIFAI_ACCESS_TOKEN}`)
      .send({encoded_data: imageData})
      .end((err, data) => {
        if (err) {
          return res.json({err: err})
        } else {
          // tags: {classes:[[String]], probs:[[String]]}
          let tags = JSON.parse(data.text).results[0].result.tag

          let probTags = [] // [{name: String, prob: Float}]
          for (var i = 0; i < tags.classes[0].length; i++) {
            probTags.push({
              name: tags.classes[0][i],
              prob: tags.probs[0][i]
            })
          }

          // Firebase: push image to images under user
          return Fire.req({
            action: 'post',
            endpoint: path.join('users', req.body.id, 'images.json'),
            headers: [['Accept', 'application/json']],
            params: [{image_data: imageData, tags: probTags}]
          }, (err, data) => {
            if (err) {
              return res.json({err: err})
            } else {
              return Fire.mergeTags({
                id: req.body.id,
                new_tags: probTags
              }, res)
            }
          }, false)
        }
      })
  } else {
    return res.json({err: '`id` or `image_data` not specified'})
  }
})

let server = app.listen(process.env.port || 8000, () => {
  console.log(`Listening on port ${server.address().port}`)
})
