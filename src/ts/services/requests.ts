const axios = require('axios')

function getHealth() {
  const url = process.env.API_URL + '/health'
  return new Promise((resolve, reject) => {
    axios.get(url).then((response: { status: unknown; }) => {
      resolve((response.status))
    }).catch((error: any) => {
      reject(error)
    })
  })
}

function getCalculatePlainText(queryParameters :
  { text: string; weightBadWords: number; weightMisspelling: number; weightSpam: number; lang: string } ) :
  Promise<{ credibility: number }> {
  const url = process.env.API_URL + '/calculate/plain-text'
  return new Promise((resolve, reject) => {
    axios.get(url, { params: queryParameters }).
      then(async (response: any) => {
        resolve(response.data)
      }).catch((error : Error) => {
        reject(error)
      })
  })
}

function getCalculateTwitterUser(userId: string, queryParameters: any) : Promise<{ credibility: number }> {
  const url = process.env.API_URL + '/calculate/twitter/user/' + userId
  return new Promise((resolve, reject) => {
    axios.get(url, { params: queryParameters })
      .then(async (response: any) => {
        resolve(response.data)
      }).catch(function (error : Error) {
        reject(error)
      })
  })
}

function getCalculateTwitterSocial(userId: string, queryParameters: any) : Promise<{ credibility: number }> {
  const url = process.env.API_URL + '/calculate/twitter/social/' + userId
  return new Promise((resolve, reject) => {
    axios.get(url, { params: queryParameters })
      .then(async (response: any) => {
        resolve(response.data)
      }).catch(function (error : Error) {
        reject(error)
      })
  })
}

function getCalculateTwitterTweets(queryParameters :
  { tweetId: number; weightBadWords: number; weightMisspelling: number;
    weightSpam: number; weightText: number; weightUser: number;
    weightSocial: number; maxFollowers: number }) :
  Promise<{ credibility: number }> {
  const url = process.env.API_URL + '/calculate/twitter/tweets'
  return new Promise((resolve, reject) => {
    axios.get(url, { params: queryParameters })
      .then(async (response: any) => {
        resolve(response.data)
      }).catch(function (error : Error) {
        reject(error)
      })
  })
}

function getCalculateTweetsScrapped(queryParameters :
  { tweetText: string; weightSpam: number; weightBadWords: number;
    weightMisspelling: number; weightText: number; weightUser: number;
    weightSocial: number; followersCount: number;
    friendsCount: number; verified: boolean; yearJoined: number; lang: string, maxFollowers: number}) :
  Promise<{ credibility: number }> {
  const url = process.env.API_URL + '/calculate/tweets/scraped'
  return new Promise((resolve, reject) => {
    axios.get(url, { params: queryParameters })
      .then(async (response: any) => {
        resolve(response.data)
      }).catch(function (error : Error) {
        reject(error)
      })
  })
}
function getCalculateSocialScrape(queryParameters: any) {
  const url = process.env.API_URL + '/calculate/social/scrape'
  return new Promise((resolve, reject) => {
    axios.get(url, { params: queryParameters }).then(async (response: any) => {
      resolve(response.data)
    }).catch(function (error: Error) {
      reject(error)
    })
  })
}

function getCalculateUserScrape(queryParameters: any) {
  const url = process.env.API_URL + '/calculate/user/scrape'
  return new Promise((resolve, reject) => {
    axios.get(url, { params: queryParameters }).then(async (response: any) => {
      resolve(response.data)
    }).catch(function (error: Error) {
      reject(error)
    })
  })
}

export {
  getCalculatePlainText,
  getCalculateTweetsScrapped,
  getCalculateTwitterSocial,
  getCalculateTwitterTweets,
  getCalculateTwitterUser,
  getCalculateSocialScrape,
  getCalculateUserScrape,
  getHealth
}
