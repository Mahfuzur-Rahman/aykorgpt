export type TaxpayerCategory = 'general' | 'female_senior' | 'disabled' | 'freedom_fighter'
export type LocationCategory = 'dhaka_chittagong' | 'other_city_corp' | 'other_areas'

export interface TaxCalculationResult {
  grossIncome: number
  threshold: number
  taxableIncome: number
  slabBreakdown: Array<{ slab: string; amount: number; rate: number; tax: number }>
  grossTax: number
  investmentRebate: number
  netTaxBeforeMinimum: number
  minimumTax: number
  finalTaxPayable: number
}

export function calculateIncomeTax(
  grossIncome: number,
  category: TaxpayerCategory = 'general',
  investment: number = 0,
  location: LocationCategory = 'dhaka_chittagong'
): TaxCalculationResult {
  // 1. Threshold
  let threshold = 350000
  if (category === 'female_senior') threshold = 400000
  else if (category === 'disabled') threshold = 475000
  else if (category === 'freedom_fighter') threshold = 500000

  const taxableIncome = Math.max(0, grossIncome - threshold)

  // 2. Progressive Slabs
  const slabs = [
    { limit: 100000, rate: 0.05, label: 'First ৳1,00,000' },
    { limit: 400000, rate: 0.1, label: 'Next ৳4,00,000' },
    { limit: 500000, rate: 0.15, label: 'Next ৳5,00,000' },
    { limit: 500000, rate: 0.2, label: 'Next ৳5,00,000' },
    { limit: Infinity, rate: 0.25, label: 'Remaining balance' },
  ]

  let remaining = taxableIncome
  let grossTax = 0
  const slabBreakdown: TaxCalculationResult['slabBreakdown'] = []

  if (taxableIncome === 0) {
    slabBreakdown.push({ slab: 'Initial Tax-Free Allowance', amount: grossIncome, rate: 0, tax: 0 })
  } else {
    for (const slab of slabs) {
      if (remaining <= 0) break
      const taxableChunk = Math.min(remaining, slab.limit)
      const taxForChunk = taxableChunk * slab.rate
      grossTax += taxForChunk
      slabBreakdown.push({
        slab: slab.label,
        amount: taxableChunk,
        rate: slab.rate * 100,
        tax: taxForChunk,
      })
      remaining -= taxableChunk
    }
  }

  // 3. Investment Rebate (15% of allowable investment)
  const maxAllowableInvestment = Math.min(investment, grossIncome * 0.2, 10000000)
  const investmentRebate = Math.min(grossTax, maxAllowableInvestment * 0.15)
  const netTaxBeforeMinimum = Math.max(0, grossTax - investmentRebate)

  // 4. Minimum Tax
  let minimumTax = 5000
  if (location === 'other_city_corp') minimumTax = 4000
  else if (location === 'other_areas') minimumTax = 3000

  let finalTaxPayable = 0
  if (taxableIncome > 0) {
    finalTaxPayable = Math.max(minimumTax, netTaxBeforeMinimum)
  }

  return {
    grossIncome,
    threshold,
    taxableIncome,
    slabBreakdown,
    grossTax,
    investmentRebate,
    netTaxBeforeMinimum,
    minimumTax: taxableIncome > 0 ? minimumTax : 0,
    finalTaxPayable,
  }
}

export interface TdsVatResult {
  baseAmount: number
  vatRate: number
  vatAmount: number
  grossInvoice: number
  tdsRate: number
  tdsAmount: number
  netPayableToVendor: number
}

export function calculateTdsVat(
  baseAmount: number,
  tdsRate: number,
  vatRate: number
): TdsVatResult {
  const vatAmount = baseAmount * (vatRate / 100)
  const grossInvoice = baseAmount + vatAmount
  const tdsAmount = baseAmount * (tdsRate / 100)
  const netPayableToVendor = grossInvoice - tdsAmount

  return {
    baseAmount,
    vatRate,
    vatAmount,
    grossInvoice,
    tdsRate,
    tdsAmount,
    netPayableToVendor,
  }
}
