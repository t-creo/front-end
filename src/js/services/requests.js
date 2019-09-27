
const axios = require('axios')

module.exports = {
  get_health: function () {
    const url = process.env.API_URL + process.env.HEALTH_API
    return new Promise((resolve, reject) => {
      axios.get(url).then(response => {
        resolve((response.status))
      }).catch(error => {
        reject(error)
      })
    })
  },

  get_calculate_plain_text: function (queryParameters) {
    const url = process.env.API_URL + process.env.CALCULATE_PLAIN_TEXT
    return new Promise((resolve, reject) => {
      axios.get(url).then(async (response) => {
        resolve(response)
      }).catch(function (error) {
        reject(error)
      })
    })
  },

  get_calculate_twitter_user: function (userId) {
    const url = process.env.API_URL + process.env.CALCULATE_TW_USER
    return new Promise((resolve, reject) => {
      axios.get(url).then(async (response) => {
        resolve(response)
      }).catch(function (error) {
        reject(error)
      })
    })
  },

  get_calculate_twitter_social: function (userId) {
    const url = process.env.API_URL + process.env.CALCULATE_TW_SOCIAL
    return new Promise((resolve, reject) => {
      axios.get(url).then(async (response) => {
        resolve(response)
      }).catch(function (error) {
        reject(error)
      })
    })
  },

  get_calculate_twitter_tweets: function (queryParameters) {
    const url = process.env.API_URL + process.env.CALCULATE_TW_TWEETS
    return new Promise((resolve, reject) => {
      axios.get(url).then(async (response) => {
        resolve(response)
      }).catch(function (error) {
        reject(error)
      })
    })
  }
}
