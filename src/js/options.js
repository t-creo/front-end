import { VerifySum } from './controllers/weightCalculationUtils'
import '../sass/index.scss'
import { WEIGHT_SPAM, WEIGHT_BAD_WORDS, WEIGHT_MISSPELLING, WEIGHT_TEXT, WEIGHT_USER, WEIGHT_SOCIAL } from './constant.js'

document.addEventListener('DOMContentLoaded', function () {
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
    } else {
      document.querySelector('#weightSpam').value = filterOptions.weightSpam
      document.querySelector('#weightBadWords').value = filterOptions.weightBadWords
      document.querySelector('#weightMisspelling').value = filterOptions.weightMisspelling
      document.querySelector('#weightText').value = filterOptions.weightText
      document.querySelector('#weightUser').value = filterOptions.weightUser
      document.querySelector('#weightSocial').value = filterOptions.weightSocial
    }
  })
  document.querySelector('#SaveWeights').addEventListener('click', () => { // o addeventlistener?
    UpdateWeights()
    const weightSpam = document.querySelector('#weightSpam').value
    const weightBadWords = document.querySelector('#weightBadWords').value
    const weightMisspelling = document.querySelector('#weightMisspelling').value
    const weightText = document.querySelector('#weightText').value
    const weightUser = document.querySelector('#weightUser').value
    const weightSocial = document.querySelector('#weightSocial').value

    if (weightSpam) {
      chrome.storage.sync.set({ weightSpam: weightSpam })
    }
    if (weightBadWords) {
      chrome.storage.sync.set({ weightBadWords: weightBadWords })
    }
    if (weightMisspelling) {
      chrome.storage.sync.set({ weightMisspelling: weightMisspelling })
    }
    if (weightText) {
      chrome.storage.sync.set({ weightText: weightText })
    }
    if (weightUser) {
      chrome.storage.sync.set({ weightUser: weightUser })
    }
    if (weightSocial) {
      chrome.storage.sync.set({ weightSocial: weightSocial })
    }
  })
})

function UpdateWeights () {
  const listOfHTMLInputIDs = ['#weightSpam', '#weightBadWords', '#weightMisspelling', '#weightText', '#weightUser', '#weightSocial']
  const listOfHTMLInputIDsText = ['#weightSpam', '#weightBadWords', '#weightMisspelling']
  const listOfHTMLInputIDsTweet = ['#weightText', '#weightUser', '#weightSocial']
  const enteredWeights = ExtractHTMLInputValuesFromIDList(listOfHTMLInputIDs)
  const enteredWeightsText = ExtractHTMLInputValuesFromIDList(listOfHTMLInputIDsText)
  const enteredWeightsTweet = ExtractHTMLInputValuesFromIDList(listOfHTMLInputIDsTweet)
  if (VerifySum(enteredWeightsText) && VerifySum(enteredWeightsTweet)) {
    UpdateValuesForHTMLListOfInputs(listOfHTMLInputIDs, enteredWeights)
  } else {
    if (!VerifySum(enteredWeightsText)) {
      window.alert('Text credibility parameters must add to 1')
    }
    if (!VerifySum(enteredWeightsTweet)) {
      window.alert('Tweet credibility parameters must add to 1')
    }
  }
}

function ExtractHTMLInputValuesFromIDList (HTMLObjectIDList) {
  const InputValuesList = HTMLObjectIDList.slice()
  for (let i = 0; i < HTMLObjectIDList.length; i++) {
    const CurrentWeight = parseFloat(document.querySelector(HTMLObjectIDList[i]).value).toFixed(2)
    InputValuesList[i] = CurrentWeight
  }
  return InputValuesList
}

function UpdateValuesForHTMLListOfInputs (HTMLObjectIDList, ValuesList) {
  for (let i = 0; i < HTMLObjectIDList.length; i++) {
    document.querySelector(HTMLObjectIDList[i]).value = ValuesList[i].toString()
  }
}
