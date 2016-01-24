import request from 'superagent'
import path from 'path'
import _ from 'underscore'

export default class {
  constructor (url) {
    this.URL = url
  }
  req ({action, endpoint, headers = [], params = []}, res, resPipe = true) {
    let that = this
    let reqPath = 'https://' + path.join(that.URL, endpoint)
    console.log('FireAPI Request: ', reqPath)
    let r = request[action](reqPath)
    for (let i = 0; i < headers.length; i++) {
      r.set(headers[i][0], headers[i][1])
    }
    for (let i = 0; i < params.length; i++) {
      r.send(params[i])
    }
    r.end((err, data) => {
      if (resPipe) { // send res automatically
        if (err) {
          return res.json({err: err})
        } else {
          return res.json({data: JSON.parse(data.text)})
        }
      } else {
        return res(err, JSON.parse(data.text)) // return parsed data
      }
    })
  }
  mergeTags ({id, new_tags}, res, resPipe) {
    // get tags
    this.req({
      action: 'get',
      endpoint: path.join('users', id, 'tags.json'),
      headers: [['Accept', 'application/json']]
    }, (err, data) => {
      if (err) {
        return res.json({err: err})
      }
      // Manipulated tags
      let old_tags = data || []
      let tags = []

      _.each(new_tags, (new_tag, index) => {
        let old_tag = _.find(old_tags, (old_tag) => {
          return old_tag.name === new_tag.name
        })

        let tag = {}

        if (old_tag) {
          tag.name = new_tag.name
          tag.total_prob = old_tag.total_prob + new_tag.prob
          tag.total_pics = old_tag.total_pics + 1
          tag.prob_index = tag.total_prob / tag.total_pics
        } else {
          tag.name = new_tag.name
          tag.total_prob = new_tag.prob
          tag.total_pics = 1
          tag.prob_index = tag.total_prob
        }
        tags.push(tag)
      })

      // console.log(tags)

      // Update tags
      return this.req({
        action: 'patch',
        endpoint: path.join('users', `${id}.json`),
        headers: [['Accept', 'application/json']],
        params: [{tags: tags}]
      }, res, resPipe)
    }, false)
  }
}
