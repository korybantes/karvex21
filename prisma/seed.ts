import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Hash the password
  const password = 'admin123'
  const passwordHash = await bcrypt.hash(password, 10)

  // ============================================
  // USERS
  // ============================================
  const admin = await prisma.user.upsert({
    where: { email: 'admin@fleet.pl' },
    update: { passwordHash },
    create: {
      email: 'admin@fleet.pl',
      passwordHash,
      firstName: 'Jan',
      lastName: 'Kowalski',
      role: 'admin',
      isActive: true,
    },
  })

  const accountant = await prisma.user.upsert({
    where: { email: 'accounting@fleet.pl' },
    update: { passwordHash },
    create: {
      email: 'accounting@fleet.pl',
      passwordHash,
      firstName: 'Anna',
      lastName: 'Nowak',
      role: 'accountant',
      isActive: true,
    },
  })

  console.log('Users created')

  // ============================================
  // DRIVERS
  // ============================================
  const driver1 = await prisma.driver.upsert({
    where: { pesel: '85010112345' },
    update: {},
    create: {
      firstName: 'Marek',
      lastName: 'Zieliński',
      phoneNumbers: JSON.stringify([{ country: '+48', number: '123456789' }]),
      nationality: 'PL',
      pesel: '85010112345',
      permitType: 'Karta pobytu',
      permitIssueDate: new Date('2020-01-15'),
      permitExpiryDate: new Date('2025-01-15'),
      licenseClass: 'C+E',
      licenseIssueCountry: 'PL',
      licenseIssueDate: new Date('2015-03-10'),
      licenseExpiryDate: new Date('2025-03-10'),
      code95Number: '95/PL/123456',
      code95IssueDate: new Date('2020-01-15'),
      code95ExpiryDate: new Date('2025-01-15'),
      driverCardNumber: 'PL123456789',
      driverCardIssueDate: new Date('2020-01-15'),
      driverCardExpiryDate: new Date('2025-01-15'),
      medicalExamDate: new Date('2024-01-15'),
      medicalExamExpiryDate: new Date('2025-01-15'),
      adrCertificateNumber: 'ADR/PL/12345',
      adrExpiryDate: new Date('2025-06-30'),
      employmentStartDate: new Date('2020-02-01'),
      contractType: 'umowa_o_prace',
      isActive: true,
      address: 'ul. Długa 15, 00-001 Warszawa',
      emergencyContactName: 'Maria Zielińska',
      emergencyContactPhone: '+48 987654321',
    },
  })

  const driver2 = await prisma.driver.upsert({
    where: { passportNumber: 'U12345678' },
    update: {},
    create: {
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
      phoneNumbers: JSON.stringify([{ country: '+90', number: '5321234567' }]),
      nationality: 'TR',
      passportNumber: 'U12345678',
      permitType: 'Zezwolenie na pracę',
      permitIssueDate: new Date('2021-05-20'),
      permitExpiryDate: new Date('2024-05-20'),
      licenseClass: 'C+E',
      licenseIssueCountry: 'TR',
      licenseIssueDate: new Date('2016-08-15'),
      licenseExpiryDate: new Date('2026-08-15'),
      code95Number: '95/TR/987654',
      code95IssueDate: new Date('2021-05-20'),
      code95ExpiryDate: new Date('2026-05-20'),
      driverCardNumber: 'TR987654321',
      driverCardIssueDate: new Date('2021-05-20'),
      driverCardExpiryDate: new Date('2026-05-20'),
      medicalExamDate: new Date('2024-02-01'),
      medicalExamExpiryDate: new Date('2025-02-01'),
      employmentStartDate: new Date('2021-06-01'),
      contractType: 'umowa_zlecenie',
      isActive: true,
      address: 'ul. Marszałkowska 100, 00-001 Warszawa',
      emergencyContactName: 'Fatma Yılmaz',
      emergencyContactPhone: '+90 5329876543',
    },
  })

  const driver3 = await prisma.driver.upsert({
    where: { passportNumber: 'EF9876543' },
    update: {},
    create: {
      firstName: 'Petro',
      lastName: 'Shevchenko',
      phoneNumbers: JSON.stringify([{ country: '+380', number: '501234567' }]),
      nationality: 'UA',
      passportNumber: 'EF9876543',
      permitType: 'Karta pobytu',
      permitIssueDate: new Date('2022-03-10'),
      permitExpiryDate: new Date('2025-03-10'),
      licenseClass: 'C',
      licenseIssueCountry: 'UA',
      licenseIssueDate: new Date('2017-11-20'),
      licenseExpiryDate: new Date('2027-11-20'),
      code95Number: '95/UA/456789',
      code95IssueDate: new Date('2022-03-10'),
      code95ExpiryDate: new Date('2027-03-10'),
      driverCardNumber: 'UA456789123',
      driverCardIssueDate: new Date('2022-03-10'),
      driverCardExpiryDate: new Date('2027-03-10'),
      medicalExamDate: new Date('2024-03-01'),
      medicalExamExpiryDate: new Date('2025-03-01'),
      employmentStartDate: new Date('2022-04-01'),
      contractType: 'B2B',
      isActive: true,
      address: 'ul. Krakowska Przedmieście 50, 00-001 Warszawa',
      emergencyContactName: 'Olena Shevchenko',
      emergencyContactPhone: '+380 509876543',
    },
  })

  const driver4 = await prisma.driver.upsert({
    where: { passportNumber: 'MP1234567' },
    update: {},
    create: {
      firstName: 'Andrei',
      lastName: 'Petrov',
      phoneNumbers: JSON.stringify([{ country: '+375', number: '291234567' }]),
      nationality: 'BY',
      passportNumber: 'MP1234567',
      permitType: 'Zezwolenie na pracę',
      permitIssueDate: new Date('2023-01-15'),
      permitExpiryDate: new Date('2024-01-15'),
      licenseClass: 'C+E',
      licenseIssueCountry: 'BY',
      licenseIssueDate: new Date('2018-06-01'),
      licenseExpiryDate: new Date('2028-06-01'),
      code95Number: '95/BY/789012',
      code95IssueDate: new Date('2023-01-15'),
      code95ExpiryDate: new Date('2028-01-15'),
      driverCardNumber: 'BY789012345',
      driverCardIssueDate: new Date('2023-01-15'),
      driverCardExpiryDate: new Date('2028-01-15'),
      medicalExamDate: new Date('2024-01-10'),
      medicalExamExpiryDate: new Date('2025-01-10'),
      employmentStartDate: new Date('2023-02-01'),
      contractType: 'umowa_zlecenie',
      isActive: true,
      address: 'ul. Wilanowska 200, 00-001 Warszawa',
      emergencyContactName: 'Natalia Petrova',
      emergencyContactPhone: '+375 299876543',
    },
  })

  console.log('Drivers created')

  // ============================================
  // DRIVER USER ACCOUNTS
  // ============================================
  const driverUser1 = await prisma.user.upsert({
    where: { email: 'marek.zielinski@fleet.pl' },
    update: {},
    create: {
      email: 'marek.zielinski@fleet.pl',
      passwordHash,
      firstName: 'Marek',
      lastName: 'Zieliński',
      role: 'driver',
      driverId: driver1.id,
      isActive: true,
    },
  })

  const driverUser2 = await prisma.user.upsert({
    where: { email: 'ahmet.yilmaz@fleet.pl' },
    update: {},
    create: {
      email: 'ahmet.yilmaz@fleet.pl',
      passwordHash,
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
      role: 'driver',
      driverId: driver2.id,
      isActive: true,
    },
  })

  const driverUser3 = await prisma.user.upsert({
    where: { email: 'petro.shevchenko@fleet.pl' },
    update: {},
    create: {
      email: 'petro.shevchenko@fleet.pl',
      passwordHash,
      firstName: 'Petro',
      lastName: 'Shevchenko',
      role: 'driver',
      driverId: driver3.id,
      isActive: true,
    },
  })

  const driverUser4 = await prisma.user.upsert({
    where: { email: 'andrei.petrov@fleet.pl' },
    update: {},
    create: {
      email: 'andrei.petrov@fleet.pl',
      passwordHash,
      firstName: 'Andrei',
      lastName: 'Petrov',
      role: 'driver',
      driverId: driver4.id,
      isActive: true,
    },
  })

  console.log('Driver user accounts created')

  // ============================================
  // VEHICLES
  // ============================================
  const vehicle1 = await prisma.vehicle.create({
    data: {
      plateNumber: 'WA12345',
      plateCountry: 'PL',
      brand: 'Scania',
      model: 'R500',
      year: 2021,
      vin: 'YS2R4X20001234567',
      trailerInfo: 'Semi-trailer 13.6m',
      purchaseDate: new Date('2021-06-15'),
      leasingType: 'operacyjny',
      leasingEndDate: new Date('2026-06-15'),
      ocPolicyNumber: 'OC/2021/123456',
      ocCompany: 'PZU',
      ocStartDate: new Date('2023-06-15'),
      ocExpiryDate: new Date('2024-06-15'),
      ocPremium: 4500.00,
      acPolicyNumber: 'AC/2021/789012',
      acCompany: 'Allianz',
      acStartDate: new Date('2023-06-15'),
      acExpiryDate: new Date('2024-06-15'),
      acPremium: 3200.00,
      lastInspectionDate: new Date('2023-12-01'),
      nextInspectionDate: new Date('2024-12-01'),
      tachographCalibrationDate: new Date('2022-06-15'),
      tachographNextCalibrationDate: new Date('2024-06-15'),
      isActive: true,
    },
  })

  const vehicle2 = await prisma.vehicle.create({
    data: {
      plateNumber: 'WA67890',
      plateCountry: 'PL',
      brand: 'Volvo',
      model: 'FH16',
      year: 2022,
      vin: 'YV2R4A20002345678',
      trailerInfo: 'Semi-trailer 13.6m',
      purchaseDate: new Date('2022-03-20'),
      leasingType: 'finansowy',
      leasingEndDate: new Date('2027-03-20'),
      ocPolicyNumber: 'OC/2022/234567',
      ocCompany: 'Warta',
      ocStartDate: new Date('2023-03-20'),
      ocExpiryDate: new Date('2024-03-20'),
      ocPremium: 4800.00,
      acPolicyNumber: 'AC/2022/345678',
      acCompany: 'PZU',
      acStartDate: new Date('2023-03-20'),
      acExpiryDate: new Date('2024-03-20'),
      acPremium: 3500.00,
      lastInspectionDate: new Date('2023-09-15'),
      nextInspectionDate: new Date('2024-09-15'),
      tachographCalibrationDate: new Date('2022-09-20'),
      tachographNextCalibrationDate: new Date('2024-09-20'),
      isActive: true,
    },
  })

  const vehicle3 = await prisma.vehicle.create({
    data: {
      plateNumber: 'DE AB 123',
      plateCountry: 'DE',
      brand: 'MAN',
      model: 'TGX',
      year: 2020,
      vin: 'WMA12345678901234',
      trailerInfo: 'Semi-trailer 13.6m',
      purchaseDate: new Date('2020-08-10'),
      leasingType: 'owned',
      ocPolicyNumber: 'OC/2020/345678',
      ocCompany: 'HUK-COBURG',
      ocStartDate: new Date('2023-08-10'),
      ocExpiryDate: new Date('2024-08-10'),
      ocPremium: 3800.00,
      lastInspectionDate: new Date('2023-11-20'),
      nextInspectionDate: new Date('2024-11-20'),
      tachographCalibrationDate: new Date('2022-08-10'),
      tachographNextCalibrationDate: new Date('2024-08-10'),
      isActive: true,
    },
  })

  const vehicle4 = await prisma.vehicle.create({
    data: {
      plateNumber: 'WA54321',
      plateCountry: 'PL',
      brand: 'DAF',
      model: 'XF',
      year: 2023,
      vin: 'XLR98765432109876',
      trailerInfo: 'Semi-trailer 13.6m',
      purchaseDate: new Date('2023-01-25'),
      leasingType: 'operacyjny',
      leasingEndDate: new Date('2028-01-25'),
      ocPolicyNumber: 'OC/2023/456789',
      ocCompany: 'Compensa',
      ocStartDate: new Date('2024-01-25'),
      ocExpiryDate: new Date('2025-01-25'),
      ocPremium: 5200.00,
      acPolicyNumber: 'AC/2023/567890',
      acCompany: 'Generali',
      acStartDate: new Date('2024-01-25'),
      acExpiryDate: new Date('2025-01-25'),
      acPremium: 3800.00,
      lastInspectionDate: new Date('2024-01-15'),
      nextInspectionDate: new Date('2025-01-15'),
      tachographCalibrationDate: new Date('2023-01-25'),
      tachographNextCalibrationDate: new Date('2025-01-25'),
      isActive: true,
    },
  })

  console.log('Vehicles created')

  // ============================================
  // DRIVER-VEHICLE ASSIGNMENTS
  // ============================================
  await prisma.driverVehicleAssignment.create({
    data: {
      driverId: driver1.id,
      vehicleId: vehicle1.id,
      assignedDate: new Date('2023-01-01'),
      isActive: true,
      notes: 'Primary assignment',
    },
  })

  await prisma.driverVehicleAssignment.create({
    data: {
      driverId: driver2.id,
      vehicleId: vehicle2.id,
      assignedDate: new Date('2023-06-01'),
      isActive: true,
      notes: 'Primary assignment',
    },
  })

  await prisma.driverVehicleAssignment.create({
    data: {
      driverId: driver3.id,
      vehicleId: vehicle3.id,
      assignedDate: new Date('2023-02-15'),
      isActive: true,
      notes: 'Primary assignment',
    },
  })

  await prisma.driverVehicleAssignment.create({
    data: {
      driverId: driver4.id,
      vehicleId: vehicle4.id,
      assignedDate: new Date('2023-03-01'),
      isActive: true,
      notes: 'Primary assignment',
    },
  })

  console.log('Driver-vehicle assignments created')

  // ============================================
  // VEHICLE EXPENSES
  // ============================================
  await prisma.vehicleExpense.createMany({
    data: [
      {
        vehicleId: vehicle1.id,
        category: 'fuel',
        amount: 2500.00,
        currency: 'PLN',
        plnEquivalent: 2500.00,
        expenseDate: new Date('2024-01-15'),
        description: 'Fuel refill - Germany',
        vatRate: 23.00,
        invoiceNumber: 'FV/2024/001',
        vendorName: 'Shell Germany',
        vendorCountry: 'DE',
      },
      {
        vehicleId: vehicle1.id,
        category: 'toll',
        amount: 450.00,
        currency: 'EUR',
        plnEquivalent: 2025.00,
        expenseDate: new Date('2024-01-15'),
        description: 'Toll Collect Germany',
        vatRate: 19.00,
        invoiceNumber: 'TC/2024/001',
        vendorName: 'Toll Collect',
        vendorCountry: 'DE',
      },
      {
        vehicleId: vehicle1.id,
        category: 'maintenance',
        amount: 1200.00,
        currency: 'PLN',
        plnEquivalent: 1200.00,
        expenseDate: new Date('2024-01-20'),
        description: 'Regular service - oil change',
        vatRate: 23.00,
        invoiceNumber: 'SV/2024/001',
        vendorName: 'Scania Service Warsaw',
        vendorCountry: 'PL',
      },
      {
        vehicleId: vehicle2.id,
        category: 'tire',
        amount: 3500.00,
        currency: 'PLN',
        plnEquivalent: 3500.00,
        expenseDate: new Date('2024-01-10'),
        description: 'New set of tires',
        vatRate: 23.00,
        invoiceNumber: 'TR/2024/001',
        vendorName: 'Michelin Poland',
        vendorCountry: 'PL',
      },
      {
        vehicleId: vehicle2.id,
        category: 'insurance',
        amount: 4500.00,
        currency: 'PLN',
        plnEquivalent: 4500.00,
        expenseDate: new Date('2024-01-05'),
        description: 'Annual OC insurance',
        vatRate: 23.00,
        invoiceNumber: 'OC/2024/001',
        vendorName: 'Warta',
        vendorCountry: 'PL',
      },
      {
        vehicleId: vehicle3.id,
        category: 'leasing',
        amount: 2800.00,
        currency: 'EUR',
        plnEquivalent: 12600.00,
        expenseDate: new Date('2024-01-01'),
        description: 'Monthly leasing payment',
        vatRate: 19.00,
        invoiceNumber: 'LS/2024/001',
        vendorName: 'Leasing Company DE',
        vendorCountry: 'DE',
      },
      {
        vehicleId: vehicle3.id,
        category: 'fuel',
        amount: 1800.00,
        currency: 'EUR',
        plnEquivalent: 8100.00,
        expenseDate: new Date('2024-01-18'),
        description: 'Fuel refill - France',
        vatRate: 20.00,
        invoiceNumber: 'FV/2024/002',
        vendorName: 'Total France',
        vendorCountry: 'FR',
      },
      {
        vehicleId: vehicle4.id,
        category: 'maintenance',
        amount: 800.00,
        currency: 'PLN',
        plnEquivalent: 800.00,
        expenseDate: new Date('2024-01-25'),
        description: 'Minor repair - brake pads',
        vatRate: 23.00,
        invoiceNumber: 'SV/2024/002',
        vendorName: 'DAF Service Krakow',
        vendorCountry: 'PL',
      },
      {
        vehicleId: vehicle4.id,
        category: 'fine',
        amount: 150.00,
        currency: 'EUR',
        plnEquivalent: 675.00,
        expenseDate: new Date('2024-01-12'),
        description: 'Speeding fine - Austria',
        vatRate: 0.00,
        invoiceNumber: 'FN/2024/001',
        vendorName: 'Austrian Police',
        vendorCountry: 'AT',
      },
    ],
  })

  console.log('Vehicle expenses created')

  // ============================================
  // DRIVER PAYROLL ENTRIES
  // ============================================
  await prisma.driverPayrollEntry.createMany({
    data: [
      {
        driverId: driver1.id,
        entryType: 'salary',
        amount: 6500.00,
        currency: 'PLN',
        plnEquivalent: 6500.00,
        entryDate: new Date('2024-01-01'),
        description: 'Monthly salary - January 2024',
        isPaid: true,
        paymentDate: new Date('2024-01-25'),
      },
      {
        driverId: driver1.id,
        entryType: 'diet',
        amount: 1800.00,
        currency: 'PLN',
        plnEquivalent: 1800.00,
        entryDate: new Date('2024-01-31'),
        description: 'Diet for 18 days abroad',
        isPaid: true,
        paymentDate: new Date('2024-01-25'),
      },
      {
        driverId: driver1.id,
        entryType: 'advance',
        amount: 2000.00,
        currency: 'PLN',
        plnEquivalent: 2000.00,
        entryDate: new Date('2024-01-10'),
        description: 'Advance payment',
        isPaid: true,
        paymentDate: new Date('2024-01-10'),
      },
      {
        driverId: driver2.id,
        entryType: 'salary',
        amount: 5500.00,
        currency: 'PLN',
        plnEquivalent: 5500.00,
        entryDate: new Date('2024-01-01'),
        description: 'Monthly salary - January 2024',
        isPaid: true,
        paymentDate: new Date('2024-01-25'),
      },
      {
        driverId: driver2.id,
        entryType: 'diet',
        amount: 2100.00,
        currency: 'PLN',
        plnEquivalent: 2100.00,
        entryDate: new Date('2024-01-31'),
        description: 'Diet for 21 days abroad',
        isPaid: true,
        paymentDate: new Date('2024-01-25'),
      },
      {
        driverId: driver2.id,
        entryType: 'fine',
        amount: 500.00,
        currency: 'PLN',
        plnEquivalent: 500.00,
        entryDate: new Date('2024-01-15'),
        description: 'Parking fine - Warsaw',
        isPaid: false,
      },
      {
        driverId: driver3.id,
        entryType: 'salary',
        amount: 6000.00,
        currency: 'PLN',
        plnEquivalent: 6000.00,
        entryDate: new Date('2024-01-01'),
        description: 'Monthly salary - January 2024',
        isPaid: true,
        paymentDate: new Date('2024-01-25'),
      },
      {
        driverId: driver3.id,
        entryType: 'diet',
        amount: 1950.00,
        currency: 'PLN',
        plnEquivalent: 1950.00,
        entryDate: new Date('2024-01-31'),
        description: 'Diet for 19.5 days abroad',
        isPaid: true,
        paymentDate: new Date('2024-01-25'),
      },
      {
        driverId: driver3.id,
        entryType: 'deduction',
        amount: 450.00,
        currency: 'PLN',
        plnEquivalent: 450.00,
        entryDate: new Date('2024-01-20'),
        description: 'ZUS contribution',
        isPaid: false,
      },
      {
        driverId: driver4.id,
        entryType: 'salary',
        amount: 5200.00,
        currency: 'PLN',
        plnEquivalent: 5200.00,
        entryDate: new Date('2024-01-01'),
        description: 'Monthly salary - January 2024',
        isPaid: true,
        paymentDate: new Date('2024-01-25'),
      },
      {
        driverId: driver4.id,
        entryType: 'diet',
        amount: 1650.00,
        currency: 'PLN',
        plnEquivalent: 1650.00,
        entryDate: new Date('2024-01-31'),
        description: 'Diet for 16.5 days abroad',
        isPaid: true,
        paymentDate: new Date('2024-01-25'),
      },
      {
        driverId: driver4.id,
        entryType: 'advance',
        amount: 1500.00,
        currency: 'PLN',
        plnEquivalent: 1500.00,
        entryDate: new Date('2024-01-08'),
        description: 'Advance payment',
        isPaid: true,
        paymentDate: new Date('2024-01-08'),
      },
    ],
  })

  console.log('Driver payroll entries created')

  // ============================================
  // INCOME RECORDS
  // ============================================
  await prisma.income.createMany({
    data: [
      {
        incomeDate: new Date('2024-01-05'),
        description: 'Transport Warsaw - Berlin',
        amount: 4500.00,
        currency: 'EUR',
        plnEquivalent: 20250.00,
        vatRate: 0.00,
        invoiceNumber: 'FV/2024/100',
        clientName: 'Logistics GmbH',
        clientNip: 'DE123456789',
        clientCountry: 'DE',
        vehicleId: vehicle1.id,
        driverId: driver1.id,
      },
      {
        incomeDate: new Date('2024-01-10'),
        description: 'Transport Krakow - Munich',
        amount: 3800.00,
        currency: 'EUR',
        plnEquivalent: 17100.00,
        vatRate: 0.00,
        invoiceNumber: 'FV/2024/101',
        clientName: 'Bavarian Transport',
        clientNip: 'DE987654321',
        clientCountry: 'DE',
        vehicleId: vehicle2.id,
        driverId: driver2.id,
      },
      {
        incomeDate: new Date('2024-01-15'),
        description: 'Transport Gdansk - Amsterdam',
        amount: 5200.00,
        currency: 'EUR',
        plnEquivalent: 23400.00,
        vatRate: 0.00,
        invoiceNumber: 'FV/2024/102',
        clientName: 'Dutch Logistics BV',
        clientNip: 'NL123456789B01',
        clientCountry: 'NL',
        vehicleId: vehicle3.id,
        driverId: driver3.id,
      },
      {
        incomeDate: new Date('2024-01-20'),
        description: 'Transport Warsaw - Prague',
        amount: 2800.00,
        currency: 'EUR',
        plnEquivalent: 12600.00,
        vatRate: 0.00,
        invoiceNumber: 'FV/2024/103',
        clientName: 'Czech Transport s.r.o.',
        clientNip: 'CZ12345678',
        clientCountry: 'CZ',
        vehicleId: vehicle4.id,
        driverId: driver4.id,
      },
      {
        incomeDate: new Date('2024-01-25'),
        description: 'Transport Poznan - Paris',
        amount: 4800.00,
        currency: 'EUR',
        plnEquivalent: 21600.00,
        vatRate: 0.00,
        invoiceNumber: 'FV/2024/104',
        clientName: 'France Express SAS',
        clientNip: 'FR12345678901',
        clientCountry: 'FR',
        vehicleId: vehicle1.id,
        driverId: driver1.id,
      },
      {
        incomeDate: new Date('2024-01-28'),
        description: 'Transport Wroclaw - Vienna',
        amount: 3200.00,
        currency: 'EUR',
        plnEquivalent: 14400.00,
        vatRate: 0.00,
        invoiceNumber: 'FV/2024/105',
        clientName: 'Austria Transport GmbH',
        clientNip: 'ATU12345678',
        clientCountry: 'AT',
        vehicleId: vehicle2.id,
        driverId: driver2.id,
      },
    ],
  })

  console.log('Income records created')

  // ============================================
  // GENERAL EXPENSES
  // ============================================
  await prisma.expense.createMany({
    data: [
      {
        expenseDate: new Date('2024-01-01'),
        category: 'accounting',
        amount: 1500.00,
        currency: 'PLN',
        plnEquivalent: 1500.00,
        vatRate: 23.00,
        description: 'Monthly accounting service',
        invoiceNumber: 'ACC/2024/001',
        vendorName: 'Biuro Rachunkowe Warszawa',
        vendorNip: 'PL1234567890',
      },
      {
        expenseDate: new Date('2024-01-05'),
        category: 'insurance',
        amount: 1200.00,
        currency: 'PLN',
        plnEquivalent: 1200.00,
        vatRate: 23.00,
        description: 'Office insurance',
        invoiceNumber: 'INS/2024/001',
        vendorName: 'PZU',
        vendorNip: 'PL9876543210',
      },
      {
        expenseDate: new Date('2024-01-10'),
        category: 'other',
        amount: 500.00,
        currency: 'PLN',
        plnEquivalent: 500.00,
        vatRate: 23.00,
        description: 'Office supplies',
        invoiceNumber: 'OFF/2024/001',
        vendorName: 'Office Depot',
        vendorNip: 'PL5432167890',
      },
      {
        expenseDate: new Date('2024-01-15'),
        category: 'salary',
        amount: 8000.00,
        currency: 'PLN',
        plnEquivalent: 8000.00,
        vatRate: 0.00,
        description: 'Office staff salary',
        invoiceNumber: 'SAL/2024/001',
        vendorName: 'Fleet Management Sp. z o.o.',
      },
      {
        expenseDate: new Date('2024-01-20'),
        category: 'other',
        amount: 3500.00,
        currency: 'PLN',
        plnEquivalent: 3500.00,
        vatRate: 0.00,
        description: 'Monthly tax advance',
        invoiceNumber: 'TAX/2024/001',
        vendorName: 'Tax Office Warsaw',
      },
    ],
  })

  console.log('General expenses created')

  // ============================================
  // TOLL SUBSCRIPTIONS
  // ============================================
  await prisma.tollSubscription.createMany({
    data: [
      {
        vehicleId: vehicle1.id,
        country: 'DE',
        systemName: 'Toll Collect',
        subscriptionNumber: 'DE12345678',
        startDate: new Date('2023-01-01'),
        expiryDate: new Date('2024-12-31'),
        balance: 1500.00,
        currency: 'EUR',
        isActive: true,
      },
      {
        vehicleId: vehicle2.id,
        country: 'DE',
        systemName: 'Toll Collect',
        subscriptionNumber: 'DE98765432',
        startDate: new Date('2023-01-01'),
        expiryDate: new Date('2024-12-31'),
        balance: 2000.00,
        currency: 'EUR',
        isActive: true,
      },
      {
        vehicleId: vehicle3.id,
        country: 'AT',
        systemName: 'GO-Maut',
        subscriptionNumber: 'AT12345678',
        startDate: new Date('2023-06-01'),
        expiryDate: new Date('2024-06-30'),
        balance: 800.00,
        currency: 'EUR',
        isActive: true,
      },
      {
        vehicleId: vehicle4.id,
        country: 'PL',
        systemName: 'e-TOLL',
        subscriptionNumber: 'PL12345678',
        startDate: new Date('2024-01-01'),
        expiryDate: new Date('2024-12-31'),
        balance: 500.00,
        currency: 'PLN',
        isActive: true,
      },
      {
        vehicleId: vehicle1.id,
        country: 'FR',
        systemName: 'Écotaxe',
        subscriptionNumber: 'FR12345678',
        startDate: new Date('2023-03-01'),
        expiryDate: new Date('2024-03-31'),
        balance: 300.00,
        currency: 'EUR',
        isActive: true,
      },
    ],
  })

  console.log('Toll subscriptions created')

  // ============================================
  // COMPANY DOCUMENTS
  // ============================================
  await prisma.companyDocument.createMany({
    data: [
      {
        documentType: 'krs',
        documentNumber: '0000123456',
        issueDate: new Date('2015-01-10'),
        issuingAuthority: 'Sąd Rejonowy w Warszawie',
        notes: 'Company registration in KRS',
      },
      {
        documentType: 'nip',
        documentNumber: '1234567890',
        issueDate: new Date('2015-01-10'),
        issuingAuthority: 'Urząd Skarbowy Warszawa',
        notes: 'Tax identification number',
      },
      {
        documentType: 'regon',
        documentNumber: '123456789',
        issueDate: new Date('2015-01-10'),
        issuingAuthority: 'GUS',
        notes: 'Statistical identification number',
      },
      {
        documentType: 'transport_license',
        documentNumber: '12345/2020',
        issueDate: new Date('2020-03-15'),
        expiryDate: new Date('2030-03-15'),
        issuingAuthority: 'Starosta Warszawski',
        notes: 'Transport license',
      },
      {
        documentType: 'community_license',
        documentNumber: 'PL/2020/12345',
        issueDate: new Date('2020-03-15'),
        expiryDate: new Date('2030-03-15'),
        issuingAuthority: 'GITD',
        notes: 'EU community license',
      },
      {
        documentType: 'ocp',
        documentNumber: 'OCP/2020/12345',
        issueDate: new Date('2020-03-15'),
        expiryDate: new Date('2025-03-15'),
        issuingAuthority: 'PZU',
        notes: 'Carrier liability insurance',
      },
    ],
  })

  console.log('Company documents created')

  // ============================================
  // REMINDERS
  // ============================================
  const today = new Date()
  const in7Days = new Date(today)
  in7Days.setDate(today.getDate() + 7)
  const in15Days = new Date(today)
  in15Days.setDate(today.getDate() + 15)
  const in30Days = new Date(today)
  in30Days.setDate(today.getDate() + 30)
  const in60Days = new Date(today)
  in60Days.setDate(today.getDate() + 60)

  await prisma.reminder.createMany({
    data: [
      {
        reminderType: 'document_expiry',
        title: 'Driver Permit Expiring Soon',
        description: 'Andrei Petrov work permit expires in 7 days',
        relatedEntityType: 'driver',
        relatedEntityId: driver4.id,
        triggerDate: in7Days,
        priority: 'high',
        status: 'pending',
      },
      {
        reminderType: 'document_expiry',
        title: 'Vehicle OC Insurance Expiring',
        description: 'Vehicle WA67890 OC insurance expires in 15 days',
        relatedEntityType: 'vehicle',
        relatedEntityId: vehicle2.id,
        triggerDate: in15Days,
        priority: 'high',
        status: 'pending',
      },
      {
        reminderType: 'document_expiry',
        title: 'Tachograph Calibration Due',
        description: 'Vehicle WA12345 tachograph calibration due in 30 days',
        relatedEntityType: 'vehicle',
        relatedEntityId: vehicle1.id,
        triggerDate: in30Days,
        priority: 'medium',
        status: 'pending',
      },
      {
        reminderType: 'document_expiry',
        title: 'Driver License Expiring',
        description: 'Marek Zieliński driving license expires in 30 days',
        relatedEntityType: 'driver',
        relatedEntityId: driver1.id,
        triggerDate: in30Days,
        priority: 'medium',
        status: 'pending',
      },
      {
        reminderType: 'document_expiry',
        title: 'Community License Renewal',
        description: 'Company community license expires in 60 days',
        relatedEntityType: 'company',
        triggerDate: in60Days,
        priority: 'low',
        status: 'pending',
      },
      {
        reminderType: 'payment_due',
        title: 'Leasing Payment Due',
        description: 'Vehicle WA67890 leasing payment due in 3 days',
        relatedEntityType: 'vehicle',
        relatedEntityId: vehicle2.id,
        triggerDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
        priority: 'high',
        status: 'pending',
      },
      {
        reminderType: 'toll_subscription',
        title: 'Toll Subscription Expiring',
        description: 'Vehicle WA12345 Toll Collect subscription expires in 30 days',
        relatedEntityType: 'vehicle',
        relatedEntityId: vehicle1.id,
        triggerDate: in30Days,
        priority: 'medium',
        status: 'pending',
      },
    ],
  })

  console.log('Reminders created')

  // ============================================
  // EXCHANGE RATES
  // ============================================
  const exchangeRates = [
    {
      fromCurrency: 'EUR',
      toCurrency: 'PLN',
      rate: 4.50,
      rateDate: new Date('2024-01-15'),
      source: 'NBP',
    },
    {
      fromCurrency: 'PLN',
      toCurrency: 'EUR',
      rate: 0.2222,
      rateDate: new Date('2024-01-15'),
      source: 'NBP',
    },
    {
      fromCurrency: 'TRY',
      toCurrency: 'PLN',
      rate: 0.13,
      rateDate: new Date('2024-01-15'),
      source: 'NBP',
    },
    {
      fromCurrency: 'PLN',
      toCurrency: 'TRY',
      rate: 7.69,
      rateDate: new Date('2024-01-15'),
      source: 'NBP',
    },
    {
      fromCurrency: 'EUR',
      toCurrency: 'TRY',
      rate: 34.50,
      rateDate: new Date('2024-01-15'),
      source: 'TCMB',
    },
    {
      fromCurrency: 'TRY',
      toCurrency: 'EUR',
      rate: 0.029,
      rateDate: new Date('2024-01-15'),
      source: 'TCMB',
    },
  ]

  for (const rate of exchangeRates) {
    await prisma.exchangeRate.upsert({
      where: {
        fromCurrency_toCurrency_rateDate: {
          fromCurrency: rate.fromCurrency,
          toCurrency: rate.toCurrency,
          rateDate: rate.rateDate,
        },
      },
      update: {},
      create: rate,
    })
  }

  console.log('Exchange rates created')

  console.log('Seed completed successfully!')
  console.log('Admin email: admin@fleet.pl')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
