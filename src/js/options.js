import $ from 'jquery'
import { PreventInvalidWeightInputs, CalculateWeightProportion } from './controllers/weightCalculationUtils'
import '../sass/index.scss'

document(function () {
  chrome.storage.sync.get(['SocialWeight', 'ProfanityWeight', 'SpamWeight', 'SpellingWeight'], function (filterOptions) {
    document.querySelector('#SocialWeight').value = filterOptions.SocialWeight
    document.querySelector('#ProfanityWeight').value = filterOptions.ProfanityWeight
    document.querySelector('#SpamWeight').value = filterOptions.SpamWeight
    document.querySelector('#SpellingWeight').value = filterOptions.SpellingWeight
  })
  document.querySelector('#SaveWeights').onClick = function () { // o addeventlistener?
    UpdateWeights()
    var SocialWeight = document.querySelector('#SocialWeight').value
    var ProfanityWeight = document.querySelector('#ProfanityWeight').value
    var SpamWeight = document.querySelector('#SpamWeight').value
    var SpellingWeight = document.querySelector('#SpellingWeight').value
    if (SocialWeight) {
      chrome.storage.sync.set({ SocialWeight: SocialWeight })
    }
    if (ProfanityWeight) {
      chrome.storage.sync.set({ ProfanityWeight: ProfanityWeight })
    }
    if (SpamWeight) {
      chrome.storage.sync.set({ SpamWeight: SpamWeight })
    }
    if (SpellingWeight) {
      chrome.storage.sync.set({ SpellingWeight: SpellingWeight })
    }
  }
})

function UpdateWeights () {
  var ListOfHTMLInputIDs = ['#SocialWeight', '#ProfanityWeight', '#SpamWeight', '#SpellingWeight']
  var EnteredWeights = ExtractHTMLInputValuesFromIDList(ListOfHTMLInputIDs)
  EnteredWeights = PreventInvalidWeightInputs(EnteredWeights)
  var ProportionedWeights = CalculateWeightProportion(EnteredWeights)
  UpdateValuesForHTMLListOfInputs(ListOfHTMLInputIDs, ProportionedWeights)
}

function ExtractHTMLInputValuesFromIDList (HTMLObjectIDList) {
  var InputValuesList = HTMLObjectIDList.slice()
  for (let i = 0; i < HTMLObjectIDList.length; i++) {
    const CurrentWeight = parseFloat($(HTMLObjectIDList[i]).val()).toFixed(2)
    InputValuesList[i] = CurrentWeight
  }
  return InputValuesList
}

function UpdateValuesForHTMLListOfInputs (HTMLObjectIDList, ValuesList) {
  for (let i = 0; i < HTMLObjectIDList.length; i++) {
    $(HTMLObjectIDList[i]).val(ValuesList[i].toString())
  }
}
