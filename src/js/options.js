import { PreventInvalidWeightInputs, CalculateWeightProportion } from './controllers/weightCalculationUtils'
import '../sass/index.scss'
import { WEIGHT_SPAM, WEIGHT_BAD_WORDS, WEIGHT_MISSPELLING, WEIGHT_TEXT, WEIGHT_USER, WEIGHT_SOCIAL} from './constant.js'

document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.sync.get([WEIGHT_SPAM, WEIGHT_BAD_WORDS, WEIGHT_MISSPELLING, WEIGHT_TEXT, WEIGHT_USER, WEIGHT_SOCIAL], function (filterOptions) {
    document.querySelector('#weightSpam').value = filterOptions.weightSpam
    document.querySelector('#weightBadWords').value = filterOptions.weightBadWords
    document.querySelector('#weightMisspelling').value = filterOptions.weightMisspelling
    document.querySelector('#weightText').value = filterOptions.weightText
    document.querySelector('#weightUser').value = filterOptions.weightUser
    document.querySelector('#weightSocial').value = filterOptions.weightSocial
  })
  document.querySelector('#SaveWeights').onClick = function () { // o addeventlistener?
    UpdateWeights()
    var weightSpam = document.querySelector('#weightSpam').value
    var weightBadWords = document.querySelector('#weightBadWords').value
    var weightMisspelling = document.querySelector('#weightMisspelling').value
    var weightText = document.querySelector('#weightText').value
    var weightUser = document.querySelector('#weightUser').value
    var weightSocial = document.querySelector('#weightSocial').value

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
  }
})

function UpdateWeights () {
  var ListOfHTMLInputIDs = ['#weightSpam', '#weightBadWords', '#weightMisspelling', '#weightText', '#weightUser', '#weightSocial']
  var EnteredWeights = ExtractHTMLInputValuesFromIDList(ListOfHTMLInputIDs)
  EnteredWeights = PreventInvalidWeightInputs(EnteredWeights)
  var ProportionedWeights = CalculateWeightProportion(EnteredWeights)
  UpdateValuesForHTMLListOfInputs(ListOfHTMLInputIDs, ProportionedWeights)
}

function ExtractHTMLInputValuesFromIDList (HTMLObjectIDList) {
  var InputValuesList = HTMLObjectIDList.slice()
  for (let i = 0; i < HTMLObjectIDList.length; i++) {
    const CurrentWeight = parseFloat(HTMLObjectIDList[i].value).toFixed(2)
    InputValuesList[i] = CurrentWeight
  }
  return InputValuesList
}

function UpdateValuesForHTMLListOfInputs (HTMLObjectIDList, ValuesList) {
  for (let i = 0; i < HTMLObjectIDList.length; i++) {
    HTMLObjectIDList[i].value = ValuesList[i].toString()
  }
}
