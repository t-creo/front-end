import './controllers/scraper'
import '../sass/index.scss'
import { WEIGHT_SPAM, WEIGHT_BAD_WORDS, WEIGHT_MISSPELLING, WEIGHT_TEXT, WEIGHT_USER, WEIGHT_SOCIAL, MAX_FOLLOWERS } from './constant'
import '../sass/spinner.scss'
import WorldWhiteWebClient, { Language } from 'www-client-js'
const client = new WorldWhiteWebClient(process.env.API_URL)

// interface SelectProtected {
//   readonly submitButtonElement: HTMLButtonElement;
// }

window.addEventListener('load', function load () {
  document.getElementById('submitButton').onclick= getCredibility
  document.getElementById('VerifyPageButtonScrapper').onclick = ValidateTwitterTweetsScrapper
  document.getElementById('VerifyPageButtonTwitterApi').onclick = ValidateTwitterTweets
})

document.addEventListener('DOMContentLoaded', function () {
  chrome.storage.sync.get([WEIGHT_SPAM, WEIGHT_BAD_WORDS, WEIGHT_MISSPELLING, WEIGHT_TEXT, WEIGHT_USER, WEIGHT_SOCIAL, MAX_FOLLOWERS], function (filterOptions) {
    if (!filterOptions.weightSpam) {
      chrome.storage.sync.set({ weightSpam: 0.44 })
      chrome.storage.sync.set({ weightBadWords: 0.33 })
      chrome.storage.sync.set({ weightMisspelling: 0.23 })
      chrome.storage.sync.set({ weightText: 0.34 })
      chrome.storage.sync.set({ weightUser: 0.33 })
      chrome.storage.sync.set({ weightSocial: 0.33 })
      chrome.storage.sync.set({ maxFollowers: 2000000 })
    }
  })
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
  showSpinner()
  // Send Message asking for the scaped values
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { sender: 'www', instruction: 'scrap' }, function () {
      const tweet = <HTMLTextAreaElement>document.querySelector('#text')
      chrome.storage.sync.get([WEIGHT_SPAM, WEIGHT_BAD_WORDS, WEIGHT_MISSPELLING], function (filterOptions) {
        const e = <HTMLSelectElement>document.getElementById('language')
        var lang : Language = getLanguage(e.options[e.selectedIndex].value)
        client.getPlainTextCredibility(
          {weightBadWords: filterOptions.weightBadWords,
            weightMisspelling: filterOptions.weightMisspelling,
            weightSpam: filterOptions.weightSpam},
          {text: tweet.value,
            lang: lang })
          .then(function (credibility : { credibility: number }) {
            const credibilityText  =  <HTMLParagraphElement>document.querySelector('#credibility')
            credibilityText.innerText = credibility.credibility.toFixed(2) + '%'
            hideSpinner()
          }).catch(e => {
            hideSpinner()
            console.log(e)})
      })
    })
  })
}

function ValidateTwitterTweets () {
  showSpinner()
  // Send Message asking for the scaped values
  chrome.tabs.executeScript(null, {
    file: 'popup.bundle.js' }, () => {
    connect(1)
  })
}

function ValidateTwitterTweetsScrapper () {
  showSpinner()
  chrome.tabs.executeScript(null, {
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
      chrome.storage.sync.get([WEIGHT_SPAM, WEIGHT_BAD_WORDS, WEIGHT_MISSPELLING, WEIGHT_TEXT, WEIGHT_USER, WEIGHT_SOCIAL, MAX_FOLLOWERS], function (filterOptions) {
        if (response.instruction === 'api') {
          let promiseList : Promise<{credibility : number}>[] = response.tweetIds.map((tweetId: number) => client.getTweetCredibility(tweetId.toString(),
            { weightBadWords: filterOptions.weightBadWords,
              weightMisspelling: filterOptions.weightMisspelling,
              weightSpam: filterOptions.weightSpam,
              weightText: filterOptions.weightText,
              weightSocial: filterOptions.weightSocial,
              weightUser: filterOptions.weightUser
            },
            filterOptions.maxFollowers))
          Promise.all(promiseList)
            .then(values => {
              port.postMessage({
                sender: 'www',
                instruction: 'update',
                credList: values.map(credibility => credibility.credibility)
              })
              hideSpinner()
            })
            .catch(error => {
              window.alert(JSON.stringify(error))
              console.error(error)
              hideSpinner()
            })
        } else if (response.instruction === 'scrap') {
          var lang : Language = getLanguage(response.lang)
          console.log(response)
          console.log(filterOptions)
          let promiseList : Promise<{credibility : number}>[] = response.tweetTexts.map((tweetText: string) =>{
            client.getTweetCredibilityWithScraping(
              { text: tweetText,
                lang: lang
              },
              { weightBadWords: +filterOptions.weightBadWords,
                weightMisspelling: +filterOptions.weightMisspelling,
                weightSpam: +filterOptions.weightSpam,
                weightText: +filterOptions.weightText,
                weightSocial: +filterOptions.weightSocial,
                weightUser: +filterOptions.weightUser
              },
              {
                name : response.name,
                verified: response.verified,
                yearJoined: +response.joinedDate,
                followersCount: +response.followers,
                friendsCount: +response.following
              },
              +filterOptions.maxFollowers)
          })
          Promise.all(promiseList)
            .then(values => {
              console.log(values)
              port.postMessage({
                sender: 'www',
                instruction: 'update',
                credList: values.map(credibility => credibility.credibility)
              })
              hideSpinner()
            })
            .catch(error => {
              window.alert('Errorf: '+JSON.stringify(error))
              console.error(error)
              hideSpinner()
            })
        }
      })
    })
  })
}

function showSpinner(){
  //document.body.style.background = 'rgba(0,0,0,.5)';
  const verifyBtn = <HTMLButtonElement>document.getElementById('submitButton')
  verifyBtn.disabled =  true
  const verifyPageBtn = <HTMLButtonElement>document.getElementById('VerifyPageButtonScrapper')
  const verifyPageTwitterApiBtn = <HTMLButtonElement>document.getElementById('VerifyPageButtonTwitterApi')
  if(verifyPageBtn != null && verifyPageTwitterApiBtn != null){
    verifyPageBtn.disabled  = true
    verifyPageTwitterApiBtn.disabled  = true
    verifyBtn.style.backgroundColor = 'rgba(0,123,255,.7)'
    verifyBtn.style.borderColor = 'rgba(255,255,255,.7)'
  
    verifyPageBtn.style.backgroundColor = 'rgba(0,123,255,.7)'
    verifyPageBtn.style.borderColor = 'rgba(255,255,255,.7)'
  
    verifyPageTwitterApiBtn.style.backgroundColor = 'rgba(0,123,255,.7)'
    verifyPageTwitterApiBtn.style.borderColor = 'rgba(255,255,255,.7)'  
  }
  
  const spinner = <HTMLDivElement>document.getElementById('sp-content')
  spinner.style.display = 'block'
}

function hideSpinner(){
  const verifyBtn = <HTMLButtonElement>document.getElementById('submitButton')
  verifyBtn.disabled =  false
  const verifyPageBtn = <HTMLButtonElement>document.getElementById('VerifyPageButtonScrapper')
  const verifyPageTwitterApiBtn = <HTMLButtonElement>document.getElementById('VerifyPageButtonTwitterApi')

  if(verifyPageBtn != null && verifyPageTwitterApiBtn != null){
    verifyPageBtn.disabled  = false
    verifyPageTwitterApiBtn.disabled  = false
  
    verifyBtn.style.backgroundColor = '#007bff'
    verifyBtn.style.borderColor = '#007bff'

    verifyPageBtn.style.backgroundColor = '#007bff'
    verifyPageBtn.style.borderColor = '#007bff'

    verifyPageTwitterApiBtn.style.backgroundColor = '#007bff'
    verifyPageTwitterApiBtn.style.borderColor = '#007bff'

  }
  const spinner = <HTMLDivElement>document.getElementById('sp-content')
  spinner.style.display = 'none'
}

function getLanguage(language : string){
  var lang : Language
  if (language === 'es') {
    lang = 'es'
  } else if (language === 'fr') {
    lang = 'fr'
  } else {
    lang = 'en'
  }

  return lang
}


