function PreventInvalidWeightInputs (ListOfWeights) {
  var CleanedWeightInput = ListOfWeights.slice()
  // Eliminate strings and NaNs
  for (let i = 0; i < ListOfWeights.length; i++) {
    if (typeof (ListOfWeights[i]) === 'string') {
      CleanedWeightInput[i] = parseFloat(ListOfWeights[i])
    }
    if (isNaN(ListOfWeights[i])) {
      CleanedWeightInput[i] = 0
    }
  }

  // Eliminate negative numbers
  for (let i = 0; i < CleanedWeightInput.length; i++) {
    if (CleanedWeightInput[i] < 0) {
      CleanedWeightInput[i] = 0
    }
  }
  // Check number of zeroes
  var AllAreZero = true
  var OnlyOneWeight = false
  var OnlyWeightOnListIndex = 0
  var MoreThanOneWeight = false
  for (let i = 0; i < CleanedWeightInput.length; i++) {
    if (CleanedWeightInput[i] !== 0) {
      AllAreZero = false
      if (!MoreThanOneWeight) {
        if (!OnlyOneWeight) {
          OnlyOneWeight = true
          OnlyWeightOnListIndex = i
        } else {
          OnlyOneWeight = false
          MoreThanOneWeight = true
        }
      }
    }
  }
  if (AllAreZero) {
    for (let i = 0; i < CleanedWeightInput.length; i++) {
      CleanedWeightInput[i] = parseFloat((100 / CleanedWeightInput.length).toFixed(2))
    }
  } else if (OnlyOneWeight) {
    for (let i = 0; i < CleanedWeightInput.length; i++) {
      if (i !== OnlyWeightOnListIndex) {
        CleanedWeightInput[i] = 0
      } else {
        CleanedWeightInput[i] = 100
      }
    }
  }
  return CleanedWeightInput
}

function CalculateWeightProportion (ListOfWeights) {
  var TotalSum = 0

  for (let i = 0; i < ListOfWeights.length; i++) {
    TotalSum += +ListOfWeights[i]
  }

  /* var ScaledWeightProportionsList = ListOfWeights.slice()
  for (let i = 0; i < ListOfWeights.length; i++) {
    ScaledWeightProportionsList[i] = (getProportion(ListOfWeights[i], TotalSum)).toFixed(2)
  } */
  return TotalSum == 1
}

function getProportion (partialQuantity, TotalQuantity) {
  var proportion = (partialQuantity / TotalQuantity)
  return proportion
}

export {
  PreventInvalidWeightInputs,
  CalculateWeightProportion,
  getProportion
}
