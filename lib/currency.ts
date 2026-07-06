// Currency conversion utilities

export interface ExchangeRates {
  PLN: number
  EUR: number
  TRY: number
}

export function convertToPLN(amount: number, fromCurrency: string, rates: ExchangeRates): number {
  if (fromCurrency === 'PLN') return amount
  if (fromCurrency === 'EUR') return amount * rates.EUR
  if (fromCurrency === 'TRY') return amount * rates.TRY
  return amount
}

export function convertFromPLN(amount: number, toCurrency: string, rates: ExchangeRates): number {
  if (toCurrency === 'PLN') return amount
  if (toCurrency === 'EUR') return amount / rates.EUR
  if (toCurrency === 'TRY') return amount / rates.TRY
  return amount
}

export function formatCurrency(amount: number, currency: string): string {
  const formatter = new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: currency,
  })
  return formatter.format(amount)
}

export function getCurrencySymbol(currency: string): string {
  switch (currency) {
    case 'EUR':
      return '€'
    case 'TRY':
      return '₺'
    case 'PLN':
    default:
      return 'zł'
  }
}
