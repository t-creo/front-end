function VerifySum (ListOfWeights: number[]) {
  let TotalSum = 0

  for (let i = 0; i < ListOfWeights.length; i++) {
    TotalSum += +ListOfWeights[i]
  }

  return TotalSum === 1
}

export { VerifySum }
