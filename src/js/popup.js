import './controllers/scraper'
import '../sass/index.scss'
import { WEIGHT_SPAM, WEIGHT_BAD_WORDS, WEIGHT_MISSPELLING, WEIGHT_TEXT, WEIGHT_USER, WEIGHT_SOCIAL } from './constant.js'
import { getCalculatePlainText, getCalculateTwitterTweets } from './services/requests.js'

window.addEventListener('load', function load (event) {
  document.getElementById('submitButton').onclick = getCredibility
  document.getElementById('VerifyPageButton').onclick = ValidateTwitterTweets
})

document.addEventListener('DOMContentLoaded', function (event) {
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
          weightBadWords: filterOptions.weightBadWords,
          weightMisspelling: filterOptions.weightMisspelling,
          weightSpam: filterOptions.weightSpam
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
    connect()
  })
}

function connect () {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const port = chrome.tabs.connect(tabs[0].id)
    port.postMessage({ sender: 'www', instruction: 'scrap' })
    port.onMessage.addListener((response) => {
      chrome.storage.sync.get([WEIGHT_SPAM, WEIGHT_BAD_WORDS, WEIGHT_MISSPELLING, WEIGHT_TEXT, WEIGHT_USER, WEIGHT_SOCIAL], function (filterOptions) {
        Promise.all(response.tweetIds.map(tweetId => getCalculateTwitterTweets({
          tweetId: tweetId,
          weightBadWords: filterOptions.weightBadWords,
          weightMisspelling: filterOptions.weightMisspelling,
          weightSpam: filterOptions.weightSpam,
          weightText: filterOptions.weightText,
          weightUser: filterOptions.weightUser,
          weightSocial: filterOptions.weightSocial
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
      })
    })
  })
}
