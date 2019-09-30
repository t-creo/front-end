const axios = require('axios')

module.exports = {
  getHealth: function () {
    const url = process.env.API_URL + '/health'
    return new Promise((resolve, reject) => {
      axios.get(url).then(response => {
        resolve((response.status))
      }).catch(error => {
        reject(error)
      })
    })
  },

  getCalculatePlainText: function (queryParameters) {
    const url = process.env.API_URL + '/calculate/plain-text'
    return new Promise((resolve, reject) => {
      axios.get(url, { params: queryParameters }).then(async (response) => {
        resolve(response.data)
      }).catch(function (error) {
        reject(error)
      })
    })
  },

  getCalculateTwitterUser: function (userId) {
    const url = process.env.API_URL + '/calculate/twitter/user/:userId'
    return new Promise((resolve, reject) => {
      axios.get(url).then(async (response) => {
        resolve(response.data)
      }).catch(function (error) {
        reject(error)
      })
    })
  },

  getCalculateTwitterSocial: function (userId) {
    const url = process.env.API_URL + '/calculate/twitter/social/:userId'
    return new Promise((resolve, reject) => {
      axios.get(url).then(async (response) => {
        resolve(response.data)
      }).catch(function (error) {
        reject(error)
      })
    })
  },

  getCalculateTwitterTweets: function (queryParameters) {
    const url = process.env.API_URL + '/calculate/twitter/tweets'
    return new Promise((resolve, reject) => {
      axios.get(url, { params: queryParameters }).then(async (response) => {
        resolve(response.data)
      }).catch(function (error) {
        reject(error)
      })
    })
  }
}
