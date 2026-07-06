// Excel export utilities using CSV format for simplicity

export function exportToCSV(data: any[], filename: string, headers: string[]) {
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header] || ''
        // Escape quotes and wrap in quotes if contains comma
        const stringValue = String(value)
        if (stringValue.includes(',') || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`
        }
        return stringValue
      }).join(',')
    )
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function exportDriversToCSV(drivers: any[]) {
  const headers = ['id', 'firstName', 'lastName', 'email', 'phone', 'nationality', 'isActive']
  const filename = `drivers_export_${new Date().toISOString().split('T')[0]}`
  exportToCSV(drivers, filename, headers)
}

export function exportVehiclesToCSV(vehicles: any[]) {
  const headers = ['id', 'plate', 'make', 'model', 'year', 'type', 'isActive']
  const filename = `vehicles_export_${new Date().toISOString().split('T')[0]}`
  exportToCSV(vehicles, filename, headers)
}

export function exportIncomeToCSV(income: any[]) {
  const headers = ['id', 'incomeDate', 'description', 'amount', 'currency', 'clientName', 'invoiceNumber']
  const filename = `income_export_${new Date().toISOString().split('T')[0]}`
  exportToCSV(income, filename, headers)
}

export function exportExpensesToCSV(expenses: any[]) {
  const headers = ['id', 'expenseDate', 'category', 'description', 'amount', 'currency', 'vendorName', 'invoiceNumber']
  const filename = `expenses_export_${new Date().toISOString().split('T')[0]}`
  exportToCSV(expenses, filename, headers)
}

export function exportDocumentsToCSV(documents: any[]) {
  const headers = ['id', 'name', 'documentType', 'entityType', 'issueDate', 'expiryDate', 'documentNumber']
  const filename = `documents_export_${new Date().toISOString().split('T')[0]}`
  exportToCSV(documents, filename, headers)
}
