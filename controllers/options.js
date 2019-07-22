// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

$(function(){

   chrome.storage.sync.get(['SocialWeight','ProfanityWeight','SpamWeight','SpellingWeight'], function(filterOptions) {
              $('#SocialWeight').val(filterOptions.SocialWeight);
              $('#ProfanityWeight').val(filterOptions.ProfanityWeight);
              $('#SpamWeight').val(filterOptions.SpamWeight);
              $('#SpellingWeight').val(filterOptions.SpellingWeight);

          });
    $('#SaveWeights').click(function(){
        UpdateWeights(); 
        var SocialWeight = $('#SocialWeight').val();
        var ProfanityWeight = $('#ProfanityWeight').val();
        var SpamWeight = $('#SpamWeight').val();
        var SpellingWeight = $('#SpellingWeight').val();
        if(SocialWeight){
            chrome.storage.sync.set({'SocialWeight':SocialWeight});
        }
        if(ProfanityWeight){
            chrome.storage.sync.set({'ProfanityWeight':ProfanityWeight});
        }
        if(SpamWeight){
            chrome.storage.sync.set({'SpamWeight':SpamWeight});
        }
        if(SpellingWeight){
            chrome.storage.sync.set({'SpellingWeight':SpellingWeight});
        }
    })
})

function UpdateWeights() 
{
    var ListOfHTMLInputIDs = ['#SocialWeight','#ProfanityWeight','#SpamWeight','#SpellingWeight']
    //console.log("ListOfHTMLInputIDs : "+ ListOfHTMLInputIDs);
    var EnteredWeights = ExtractHTMLInputValuesFromIDList(ListOfHTMLInputIDs);
    //console.log("ListOfHTMLInputIDs : "+ ListOfHTMLInputIDs);
    //console.log("EnteredWeights : "+ EnteredWeights);
    EnteredWeights = PreventInvalidWeightInputs(EnteredWeights);
    //console.log("tipo de lista: " +  typeof(EnteredWeights[0]));
    var ProportionedWeights = CalculateWeightProportion(EnteredWeights);
    UpdateValuesForHTMLListOfInputs(ListOfHTMLInputIDs, ProportionedWeights);
}

function ExtractHTMLInputValuesFromIDList(HTMLObjectIDList) 
{
    var InputValuesList = HTMLObjectIDList.slice();
    for (i = 0; i < HTMLObjectIDList.length; i++) { 
        CurrentWeight = parseFloat($(HTMLObjectIDList[i]).val()).toFixed(2);
        InputValuesList[i] = CurrentWeight;
        //console.log("CurrentWeight: "+CurrentWeight);
    } 
    return InputValuesList
}
function UpdateValuesForHTMLListOfInputs(HTMLObjectIDList,ValuesList) 
{

    for (i = 0; i < HTMLObjectIDList.length; i++) { 
        //console.log("HTMLID : "+ HTMLObjectIDList[i]);
        $(HTMLObjectIDList[i]).val(ValuesList[i].toString());
        //console.log("NewHTMLInputValue: "+ ValuesList[i].toString());
    }
 
}

