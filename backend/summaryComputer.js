/**
 * Phase 3 — Summary Computation
 * Takes extracted field values and computes Part 1 + Part 2 benefit summaries.
 */

function round2(n) {
  return Math.round(n * 100) / 100;
}

function computeBenefits(fields) {
  const {
    loanAmount, cashToClose,
    sectionA, sectionB, sectionC, sectionE,
    hoInsuranceF, prepaidInterest,
    hoInsuranceG, mortgageInsurance, propertyTaxes, cityPropertyTax, aggregateAdjustment,
    lenderCredit,
    payoffAmount, principalReduction,
  } = fields;

  // ---- Part 1: Savings Depicted by Cost ----
  const totalLoanCosts = sectionA + sectionB + sectionC;
  const totalCostOfLoan = totalLoanCosts + sectionE;
  const costBenefit = totalCostOfLoan + lenderCredit;

  // ---- Part 2: Savings Depicted by Escrows & Payoff ----
  const excessOverPayoff = payoffAmount + principalReduction - loanAmount;
  const prepaidTotal = hoInsuranceF + prepaidInterest;
  const escrowTotal = hoInsuranceG + mortgageInsurance + propertyTaxes + cityPropertyTax + aggregateAdjustment;
  const escrowPlusPrepaid = escrowTotal + prepaidTotal;
  const escrowPrepaidExcess = escrowPlusPrepaid + excessOverPayoff;
  const escrowBenefit = escrowPrepaidExcess - cashToClose;

  return {
    part1: {
      sectionA,
      sectionB,
      sectionC,
      sectionD: round2(totalLoanCosts),
      sectionE,
      totalCostOfLoan: round2(totalCostOfLoan),
      lenderCredit,
      benefits: round2(costBenefit),
    },
    part2: {
      loanAmount,
      payoffAmount,
      principalReduction,
      excessAmount: round2(excessOverPayoff),
      hoInsuranceF,
      prepaidInterest,
      prepaidF: round2(prepaidTotal),
      hoInsuranceG,
      mortgageInsurance,
      propertyTaxes,
      cityPropertyTax,
      aggregateAdjustment,
      escrowsG: round2(escrowTotal),
      escrowsPlusPrepaid: round2(escrowPlusPrepaid),
      escrowsPrepaidExcess: round2(escrowPrepaidExcess),
      cashToClose,
      benefitsEscrow: round2(escrowBenefit),
    },
  };
}

module.exports = { computeBenefits };
