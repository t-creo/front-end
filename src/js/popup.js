import './controllers/scraper'
import '../sass/index.scss'
import { WEIGHT_SPAM, WEIGHT_BAD_WORDS, WEIGHT_MISSPELLING, WEIGHT_TEXT, WEIGHT_USER, WEIGHT_SOCIAL } from './constant.js'
import { getCalculatePlainText, getCalculateTwitterTweets, getCalculateTweetsScrapped } from './services/requests.js'

window.addEventListener('load', function load (event) {
  document.getElementById('submitButton').onclick = getCredibility
  document.getElementById('VerifyPageButtonScrapper').onclick = ValidateTwitterTweetsScrapper
  document.getElementById('VerifyPageButtonTwitterApi').onclick = ValidateTwitterTweets
})

document.addEventListener('DOMContentLoaded', function (event) {
  chrome.storage.sync.get([WEIGHT_SPAM, WEIGHT_BAD_WORDS, WEIGHT_MISSPELLING, WEIGHT_TEXT, WEIGHT_USER, WEIGHT_SOCIAL], function (filterOptions) {
    if (!filterOptions.weightSpam) {
      chrome.storage.sync.set({ weightSpam: 0.44 })
      document.querySelector('#weightSpam').value = 0.44
      chrome.storage.sync.set({ weightBadWords: 0.33 })
      document.querySelector('#weightBadWords').value = 0.33
      chrome.storage.sync.set({ weightMisspelling: 0.23 })
      document.querySelector('#weightMisspelling').value = 0.23
      chrome.storage.sync.set({ weightText: 0.34 })
      document.querySelector('#weightText').value = 0.34
      chrome.storage.sync.set({ weightUser: 0.33 })
      document.querySelector('#weightUser').value = 0.33
      chrome.storage.sync.set({ weightSocial: 0.33 })
      document.querySelector('#weightSocial').value = 0.33
    }
  })
  chrome.tabs.getSelected(null, function (tab) {
    const tabUrl = tab.url
    const elem = document.querySelector('#PageSensitiveButtons')
    if (tabUrl.includes('https://twitter.com')) {
      document.querySelector('#currentPage').innerText = 'You are currently on Twitter'
    } else if (tabUrl.includes('https://www.facebook.com')) {
      document.querySelector('#currentPage').innerText = 'You are currently on Facebook'
      elem.parentNode.removeChild(elem)
    } else {
      document.querySelector('#firstHorBar').parentNode.removeChild(document.querySelector('#firstHorBar'))
      document.querySelector('#secondHorBar').parentNode.removeChild(document.querySelector('#secondHorBar'))
      elem.parentNode.removeChild(elem)
    }
  })
})

function getCredibility () {
  // Send Message asking for the scaped values
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { sender: 'www', instruction: 'scrap' }, function (response) {
      const tweet = document.querySelector('#text').value
      chrome.storage.sync.get([WEIGHT_SPAM, WEIGHT_BAD_WORDS, WEIGHT_MISSPELLING], function (filterOptions) {
        getCalculatePlainText({
          text: tweet,
          weightBadWords: +filterOptions.weightBadWords,
          weightMisspelling: +filterOptions.weightMisspelling,
          weightSpam: +filterOptions.weightSpam
        })
          .then(function (credibility) {
            document.querySelector('#credibility').innerText =
            credibility.credibility.toFixed(2) + '%'
          }).catch(e => console.log(e))
      })
    })
  })
}

function ValidateTwitterTweets () {
  // Send Message asking for the scaped values
  chrome.tabs.executeScript(null, {
    file: 'popup.bundle.js' }, () => {
    connect(1)
  })
}

function ValidateTwitterTweetsScrapper () {
  chrome.tabs.executeScript(null, {
    file: 'popup.bundle.js' }, () => {
    connect(2)
  })
}

function connect (method) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const port = chrome.tabs.connect(tabs[0].id)
    if (method === 1) {
      port.postMessage({ sender: 'www', instruction: 'api' })
    } else if (method === 2) {
      port.postMessage({ sender: 'www', instruction: 'scrap' })
    }
    port.onMessage.addListener((response) => {
      chrome.storage.sync.get([WEIGHT_SPAM, WEIGHT_BAD_WORDS, WEIGHT_MISSPELLING, WEIGHT_TEXT, WEIGHT_USER, WEIGHT_SOCIAL], function (filterOptions) {
        if (response.instruction === 'api') {
          Promise.all(response.tweetIds.map(tweetId => getCalculateTwitterTweets({
            tweetId: tweetId,
            weightBadWords: +filterOptions.weightBadWords,
            weightMisspelling: +filterOptions.weightMisspelling,
            weightSpam: +filterOptions.weightSpam,
            weightText: +filterOptions.weightText,
            weightUser: +filterOptions.weightUser,
            weightSocial: +filterOptions.weightSocial
          })))
            .then(values => {
              port.postMessage({
                sender: 'www',
                instruction: 'update',
                credList: values.map(credibility => credibility.credibility)
              })
            })
            .catch(error => {
              window.alert(JSON.stringify(error))
            })
        } else if (response.instruction === 'scrap') {
          console.log(response)
          Promise.all(response.tweetTexts.map(tweetText => getCalculateTweetsScrapped({
            tweetText: tweetText,
            weightSpam: +filterOptions.weightSpam,
            weightBadWords: +filterOptions.weightBadWords,
            weightMisspelling: +filterOptions.weightMisspelling,
            weightText: +filterOptions.weightText,
            weightUser: +filterOptions.weightUser,
            weightSocial: +filterOptions.weightSocial,
            followersCount: +response.followers,
            friendsCount: +response.following,
            verified: response.verified,
            yearJoined: +(response.joinedDate.split(' ')[2]) })))
            .then(values => {
              port.postMessage({
                sender: 'www',
                instruction: 'update',
                credList: values.map(credibility => credibility.credibility)
              })
            })
            .catch(error => {
              window.alert(JSON.stringify(error))
            })
        }
      })
    })
  })
}
