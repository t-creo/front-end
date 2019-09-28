import { CalculateWeightProportion } from './controllers/weightCalculationUtils'
import '../sass/index.scss'
import { WEIGHT_SPAM, WEIGHT_BAD_WORDS, WEIGHT_MISSPELLING, WEIGHT_TEXT, WEIGHT_USER, WEIGHT_SOCIAL } from './constant.js'

document.addEventListener('DOMContentLoaded', function () {
  chrome.storage.sync.get([WEIGHT_SPAM, WEIGHT_BAD_WORDS, WEIGHT_MISSPELLING, WEIGHT_TEXT, WEIGHT_USER, WEIGHT_SOCIAL], function (filterOptions) {
    document.querySelector('#weightSpam').value = filterOptions.weightSpam
    document.querySelector('#weightBadWords').value = filterOptions.weightBadWords
    document.querySelector('#weightMisspelling').value = filterOptions.weightMisspelling
    document.querySelector('#weightText').value = filterOptions.weightText
    document.querySelector('#weightUser').value = filterOptions.weightUser
    document.querySelector('#weightSocial').value = filterOptions.weightSocial
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
  if (CalculateWeightProportion(enteredWeightsText) && CalculateWeightProportion(enteredWeightsTweet)) {
    UpdateValuesForHTMLListOfInputs(listOfHTMLInputIDs, enteredWeights)
  } else {
    if (!CalculateWeightProportion(enteredWeightsText)) {
      window.alert('Text credibility parameters must add to 1')
    }
    if (!CalculateWeightProportion(enteredWeightsTweet)) {
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
