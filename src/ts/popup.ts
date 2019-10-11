import './controllers/scraper'
import '../sass/index.scss'
import { WEIGHT_SPAM, WEIGHT_BAD_WORDS, WEIGHT_MISSPELLING, WEIGHT_TEXT, WEIGHT_USER, WEIGHT_SOCIAL } from './constant'
import { getCalculatePlainText, getCalculateTwitterTweets, getCalculateTweetsScrapped } from './services/requests'

// interface SelectProtected {
//   readonly submitButtonElement: HTMLButtonElement;
// }

window.addEventListener('load', function load () {
  document.getElementById('submitButton').onclick= getCredibility
  document.getElementById('VerifyPageButtonScrapper').onclick = ValidateTwitterTweetsScrapper
  document.getElementById('VerifyPageButtonTwitterApi').onclick = ValidateTwitterTweets
})

document.addEventListener('DOMContentLoaded', function () {
  chrome.tabs.getSelected(null, function (tab) {
    const tabUrl = tab.url
    const elem = document.querySelector('#PageSensitiveButtons')
    const currentPage = <HTMLHeadingElement>document.querySelector('#currentPage')
    if (tabUrl.includes('https://twitter.com')) {
      currentPage.innerText = 'You are currently on Twitter'
    } else if (tabUrl.includes('https://www.facebook.com')) {
      currentPage.innerText = 'You are currently on Facebook'
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
    chrome.tabs.sendMessage(tabs[0].id, { sender: 'www', instruction: 'scrap' }, function () {
      const tweet = <HTMLTextAreaElement>document.querySelector('#text')
      chrome.storage.sync.get([WEIGHT_SPAM, WEIGHT_BAD_WORDS, WEIGHT_MISSPELLING], function (filterOptions) {
        getCalculatePlainText({
          text: tweet.value,
          weightBadWords: +filterOptions.weightBadWords,
          weightMisspelling: +filterOptions.weightMisspelling,
          weightSpam: +filterOptions.weightSpam
        })
          .then(function (credibility : { credibility: number }) {
            const credibilityText  =  <HTMLParagraphElement>document.querySelector('#credibility')
            credibilityText.innerText = credibility.credibility.toFixed(2) + '%'
          }).catch(e => console.log(e))
      })
    })
  })
}

function ValidateTwitterTweets () {
  // Send Message asking for the scaped values
  chrome.tabs.executeScript(0, {
    file: 'popup.bundle.js' }, () => {
    connect(1)
  })
}

function ValidateTwitterTweetsScrapper () {
  chrome.tabs.executeScript(0, {
    file: 'popup.bundle.js' }, () => {
    connect(2)
  })
}

function connect (method: number) {
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
          let promiseList : Promise<{credibility : number}>[] = response.tweetIds.map((tweetId: number) => getCalculateTwitterTweets({
            tweetId: tweetId,
            weightBadWords: +filterOptions.weightBadWords,
            weightMisspelling: +filterOptions.weightMisspelling,
            weightSpam: +filterOptions.weightSpam,
            weightText: +filterOptions.weightText,
            weightUser: +filterOptions.weightUser,
            weightSocial: +filterOptions.weightSocial
          }))
          Promise.all(promiseList)
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
          let promiseList : Promise<{credibility : number}>[] = response.tweetTexts.map((tweetText: string) => getCalculateTweetsScrapped({
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
            yearJoined: +(response.joinedDate.split(' ')[2]),
            lang: response.lang
          }))
          Promise.all(promiseList)
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
