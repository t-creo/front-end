import { VerifySum } from './controllers/weightCalculationUtils'
import '../sass/index.scss'
import { WEIGHT_SPAM, WEIGHT_BAD_WORDS, WEIGHT_MISSPELLING, WEIGHT_TEXT, WEIGHT_USER, WEIGHT_SOCIAL } from './constant'

document.addEventListener('DOMContentLoaded', function () {
  chrome.storage.sync.get([WEIGHT_SPAM, WEIGHT_BAD_WORDS, WEIGHT_MISSPELLING, WEIGHT_TEXT, WEIGHT_USER, WEIGHT_SOCIAL], function (filterOptions) {
    const weightSpam = <HTMLInputElement>document.querySelector('#weightSpam')
    const weightBadWords = <HTMLInputElement>document.querySelector('#weightBadWords')
    const weightMisspelling = <HTMLInputElement>document.querySelector('#weightMisspelling')
    const weightText = <HTMLInputElement>document.querySelector('#weightText')
    const weightUser = <HTMLInputElement>document.querySelector('#weightUser')
    const weightSocial = <HTMLInputElement>document.querySelector('#weightSocial')

    if (!filterOptions.weightSpam) {
      chrome.storage.sync.set({ weightSpam: 0.44 }) 
      weightSpam.value = '0.44'
      chrome.storage.sync.set({ weightBadWords: 0.33 })
      weightBadWords.value = '0.33'
      chrome.storage.sync.set({ weightMisspelling: 0.23 })
      weightMisspelling.value = '0.23'
      chrome.storage.sync.set({ weightText: 0.34 })
      weightText.value = '0.34' 
      chrome.storage.sync.set({ weightUser: 0.33 })
      weightUser.value = '0.33'  
      chrome.storage.sync.set({ weightSocial: 0.33 })
      
      weightSocial.value = '0.33'
    } else {
      weightSpam.value = filterOptions.weightSpam
      weightBadWords.value = filterOptions.weightBadWords
      weightMisspelling.value = filterOptions.weightMisspelling
      weightText.value = filterOptions.weightText
      weightUser.value = filterOptions.weightUser
      weightSocial.value = filterOptions.weightSocial
    }
  })
  
  document.querySelector('#SaveWeights').addEventListener('click', () => { // o addeventlistener?
    UpdateWeights()
    const weightSpam = <HTMLInputElement>document.querySelector('#weightSpam')
    const weightBadWords = <HTMLInputElement>document.querySelector('#weightBadWords')
    const weightMisspelling = <HTMLInputElement>document.querySelector('#weightMisspelling')
    const weightText = <HTMLInputElement>document.querySelector('#weightText')
    const weightUser = <HTMLInputElement>document.querySelector('#weightUser')
    const weightSocial = <HTMLInputElement>document.querySelector('#weightSocial')
    weightSpam.value
    weightBadWords.value
    weightMisspelling.value
    weightText.value
    weightUser.value
    weightSocial.value

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

function ExtractHTMLInputValuesFromIDList (HTMLObjectIDList: any[] | string[]) {
  const InputValuesList = HTMLObjectIDList.slice()
  for (let i = 0; i < HTMLObjectIDList.length; i++) {
    const CurrentWeight = parseFloat(document.querySelector(HTMLObjectIDList[i]).value).toFixed(2)
    InputValuesList[i] = CurrentWeight
  }
  return InputValuesList
}

function UpdateValuesForHTMLListOfInputs (HTMLObjectIDList : any[] | string[], ValuesList: any[] | { toString: () => void; }[]) {
  for (let i = 0; i < HTMLObjectIDList.length; i++) {
    document.querySelector(HTMLObjectIDList[i]).value = ValuesList[i].toString()
  }
}
