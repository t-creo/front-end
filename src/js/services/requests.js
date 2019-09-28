
const axios = require('axios')

module.exports = {
  getHealth: function () {
    const url = process.env.API_URL + process.env.HEALTH_API
    return new Promise((resolve, reject) => {
      axios.get(url).then(response => {
        resolve((response.status))
      }).catch(error => {
        reject(error)
      })
    })
  },

  getCalculatePlainText: function (queryParameters) {
    const url = process.env.API_URL + process.env.CALCULATE_PLAIN_TEXT
    return new Promise((resolve, reject) => {
      axios.get(url).then(async (response) => {
        resolve(response)
      }).catch(function (error) {
        reject(error)
      })
    })
  },

  getCalculateTwitterUser: function (userId) {
    const url = process.env.API_URL + process.env.CALCULATE_TW_USER
    return new Promise((resolve, reject) => {
      axios.get(url).then(async (response) => {
        resolve(response)
      }).catch(function (error) {
        reject(error)
      })
    })
  },

  getCalculateTwitterSocial: function (userId) {
    const url = process.env.API_URL + process.env.CALCULATE_TW_SOCIAL
    return new Promise((resolve, reject) => {
      axios.get(url).then(async (response) => {
        resolve(response)
      }).catch(function (error) {
        reject(error)
      })
    })
  },

  getCalculateTwitterTweets: function (queryParameters) {
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
