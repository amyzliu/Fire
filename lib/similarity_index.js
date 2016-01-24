import _ from 'underscore'

export function compare (si1, si2) {
  let result = 0
  _.each(si1, (o1, i) => {
    let o2 = _.find(si2, (o2) => {
      // console.log('finding', o1.name, o2.name);
      return o2.name === o1.name
    })

    if (o2) {
      let current_index = 1 - Math.abs(o1.prob_index - o2.prob_index)
      // console.log(o1.prob_index, o2.prob_index, current_index)
      result += current_index
    }
  })
  return result
}
