import request from 'superagent'
import path from 'path'
import _ from 'underscore'

// let findAndUpdate = function (tags, new_tag) {
//   console.log(tags);
//   for (let i = 0; i < tags.length; i++) {
//     if (tags[i].name === new_tag.name) {
//       tags[i].total_prob += new_tag.prob
//       tags[i].total_pics++
//       tags[i].probIndex = tags[i].total_prob / tags.length
//       return tags
//     }
//   }
// }

export default class {
  constructor (url) {
    this.URL = url
  }
  req ({action, endpoint, headers = [], params = []}, res, resPipe = true) {
    let that = this
    let reqPath = 'https://' + path.join(that.URL, endpoint)
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
  mergeTags ({id, new_tags}, res) {
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

      // for (let i = 0; i < new_tags.length; i++) {
      //   let new_tag = new_tags[i]
      //   if (tags.length === 0) {
      //     tags.push({
      //       name: new_tag.name,
      //       total_prob: new_tag.prob,
      //       total_pics: 1
      //     })
      //   }
      //   for (let j = 0; j < tags.length; j++) {
      //     if (tags[j].name === new_tag.name) {
      //       tags[j].total_prob += new_tag.prob
      //       tags[j].total_pics++
      //       break
      //     } else if (j === tags.length - 1) {
      //       tags.push({
      //         name: new_tag.name,
      //         total_prob: new_tag.prob,
      //         total_pics: 1
      //       })
      //       break
      //     } else {
      //       continue
      //     }
      //   }
      // }

      // for (let i = 0; i < tags.length; i++) {
      //   tags[i].prob_index = tags[i].total_prob / tags[i].total_pics
      // }

      console.log(tags)

      // Update tags
      return this.req({
        action: 'patch',
        endpoint: path.join('users', `${id}.json`),
        headers: [['Accept', 'application/json']],
        params: [{tags: tags}]
      }, res)
    }, false)
  }
}
