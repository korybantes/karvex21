-- Fleet Management System Database Schema
-- PostgreSQL Schema for Polish-based Transportation Company
-- GDPR/RODO Compliant - EU Data Hosting Required

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'accountant', 'driver')),
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- DRIVERS (Şoförler)
-- ============================================

CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_numbers JSONB, -- Array of phone numbers with country codes
    nationality VARCHAR(50),
    pesel VARCHAR(11), -- Polish PESEL (11 digits)
    passport_number VARCHAR(50),
    
    -- Residence/Work Permit (Karta pobytu / zezwolenie na pracę)
    permit_type VARCHAR(50),
    permit_issue_date DATE,
    permit_expiry_date DATE,
    
    -- Driving License (Prawo jazdy)
    license_class VARCHAR(10), -- C, C+E
    license_issue_country VARCHAR(3),
    license_issue_date DATE,
    license_expiry_date DATE,
    
    -- Code 95 (Kwalifikacja wstępna)
    code_95_number VARCHAR(50),
    code_95_issue_date DATE,
    code_95_expiry_date DATE,
    
    -- Driver Card (Karta kierowcy)
    driver_card_number VARCHAR(50),
    driver_card_issue_date DATE,
    driver_card_expiry_date DATE,
    
    -- Medical/Psychological Examination
    medical_exam_date DATE,
    medical_exam_expiry_date DATE,
    
    -- ADR Certificate (Optional)
    adr_certificate_number VARCHAR(50),
    adr_expiry_date DATE,
    
    -- Employment
    employment_start_date DATE,
    contract_type VARCHAR(50) CHECK (contract_type IN ('umowa_o_prace', 'B2B', 'umowa_zlecenie')),
    is_active BOOLEAN DEFAULT true,
    
    -- Address & Emergency
    address TEXT,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_drivers_pesel ON drivers(pesel);
CREATE INDEX idx_drivers_passport ON drivers(passport_number);
CREATE INDEX idx_drivers_is_active ON drivers(is_active);

-- ============================================
-- VEHICLES (Araçlar)
-- ============================================

CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plate_number VARCHAR(20) NOT NULL,
    plate_country VARCHAR(3) DEFAULT 'PL', -- PL, DE, FR, etc.
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INTEGER,
    vin VARCHAR(17),
    trailer_info TEXT,
    
    -- Purchase/Leasing
    purchase_date DATE,
    leasing_type VARCHAR(20) CHECK (leasing_type IN ('operacyjny', 'finansowy', 'owned')),
    leasing_end_date DATE,
    
    -- Insurance (OC - Mandatory)
    oc_policy_number VARCHAR(50),
    oc_company VARCHAR(100),
    oc_start_date DATE,
    oc_expiry_date DATE,
    oc_premium DECIMAL(15,2),
    
    -- Insurance (AC - Optional)
    ac_policy_number VARCHAR(50),
    ac_company VARCHAR(100),
    ac_start_date DATE,
    ac_expiry_date DATE,
    ac_premium DECIMAL(15,2),
    
    -- Technical Inspection (Przegląd techniczny)
    last_inspection_date DATE,
    next_inspection_date DATE,
    
    -- Tachograph Calibration (Legalizacja tachografu)
    tachograph_calibration_date DATE,
    tachograph_next_calibration_date DATE,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vehicles_plate ON vehicles(plate_number);
CREATE INDEX idx_vehicles_is_active ON vehicles(is_active);

-- ============================================
-- DRIVER-VEHICLE ASSIGNMENTS
-- ============================================

CREATE TABLE driver_vehicle_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    assigned_date DATE NOT NULL,
    unassigned_date DATE,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_assignments_driver ON driver_vehicle_assignments(driver_id);
CREATE INDEX idx_assignments_vehicle ON driver_vehicle_assignments(vehicle_id);

-- ============================================
-- VEHICLE EXPENSES (Araç Masrafları)
-- ============================================

CREATE TABLE vehicle_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'fuel', 'toll', 'maintenance', 'tire', 'insurance', 
        'leasing', 'other', 'fine', 'tax'
    )),
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'PLN' CHECK (currency IN ('PLN', 'EUR', 'TRY')),
    pln_equivalent DECIMAL(15,2), -- Auto-calculated
    expense_date DATE NOT NULL,
    description TEXT,
    vat_rate DECIMAL(5,2),
    invoice_number VARCHAR(50),
    vendor_name VARCHAR(100),
    vendor_country VARCHAR(3),
    document_path TEXT, -- File storage path
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_expenses_vehicle ON vehicle_expenses(vehicle_id);
CREATE INDEX idx_expenses_date ON vehicle_expenses(expense_date);
CREATE INDEX idx_expenses_category ON vehicle_expenses(category);

-- ============================================
-- TOLL SUBSCRIPTIONS (Yol Ücreti Abonelikleri)
-- ============================================

CREATE TABLE toll_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    country VARCHAR(3) NOT NULL, -- PL, DE, AT, etc.
    system_name VARCHAR(50) NOT NULL, -- e-TOLL, Toll Collect, GO-Maut
    subscription_number VARCHAR(50),
    start_date DATE NOT NULL,
    expiry_date DATE,
    balance DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'EUR',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_toll_vehicle ON toll_subscriptions(vehicle_id);
CREATE INDEX idx_toll_country ON toll_subscriptions(country);

-- ============================================
-- DRIVER PAYROLL (Maaş/Avans/Ceza/Kesinti)
-- ============================================

CREATE TABLE driver_payroll_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    entry_type VARCHAR(20) NOT NULL CHECK (entry_type IN (
        'salary', 'advance', 'fine', 'deduction', 'diet'
    )),
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'PLN' CHECK (currency IN ('PLN', 'EUR', 'TRY')),
    pln_equivalent DECIMAL(15,2),
    entry_date DATE NOT NULL,
    description TEXT,
    reference_number VARCHAR(50),
    is_paid BOOLEAN DEFAULT false,
    payment_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payroll_driver ON driver_payroll_entries(driver_id);
CREATE INDEX idx_payroll_date ON driver_payroll_entries(entry_date);
CREATE INDEX idx_payroll_type ON driver_payroll_entries(entry_type);

-- ============================================
-- INCOME (Gelirler)
-- ============================================

CREATE TABLE incomes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    income_date DATE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'PLN' CHECK (currency IN ('PLN', 'EUR', 'TRY')),
    pln_equivalent DECIMAL(15,2),
    vat_rate DECIMAL(5,2) DEFAULT 23.00,
    invoice_number VARCHAR(50),
    client_name VARCHAR(100),
    client_nip VARCHAR(20), -- VAT-EU number
    client_country VARCHAR(3),
    vehicle_id UUID REFERENCES vehicles(id),
    driver_id UUID REFERENCES drivers(id),
    document_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_incomes_date ON incomes(income_date);
CREATE INDEX idx_invoices_number ON incomes(invoice_number);
CREATE INDEX idx_incomes_vehicle ON incomes(vehicle_id);

-- ============================================
-- EXPENSES (Giderler - General)
-- ============================================

CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expense_date DATE NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'fuel', 'toll', 'salary', 'diet', 'accounting', 
        'insurance', 'maintenance', 'tire', 'leasing', 'other'
    )),
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'PLN' CHECK (currency IN ('PLN', 'EUR', 'TRY')),
    pln_equivalent DECIMAL(15,2),
    vat_rate DECIMAL(5,2),
    description TEXT,
    invoice_number VARCHAR(50),
    vendor_name VARCHAR(100),
    vendor_nip VARCHAR(20),
    vehicle_id UUID REFERENCES vehicles(id),
    driver_id UUID REFERENCES drivers(id),
    document_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_expenses_date_gen ON expenses(expense_date);
CREATE INDEX idx_expenses_category_gen ON expenses(category);
CREATE INDEX idx_expenses_vehicle_gen ON expenses(vehicle_id);

-- ============================================
-- DOCUMENTS (Belgeler - Merkezi Arşiv)
-- ============================================

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN (
        'company_license', 'community_license', 'ocp',
        'vehicle_registration', 'vehicle_insurance', 'vehicle_inspection',
        'tachograph_certificate', 'driver_license', 'driver_passport',
        'driver_permit', 'code_95', 'driver_card', 'medical_report',
        'adr_certificate', 'contract', 'invoice', 'receipt', 'other'
    )),
    document_name VARCHAR(255) NOT NULL,
    related_entity_type VARCHAR(20) CHECK (related_entity_type IN ('company', 'vehicle', 'driver', 'general')),
    related_entity_id UUID,
    issue_date DATE,
    expiry_date DATE,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    file_type VARCHAR(50),
    status VARCHAR(20) DEFAULT 'valid' CHECK (status IN ('valid', 'expiring_soon', 'expired')),
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_documents_entity ON documents(related_entity_type, related_entity_id);
CREATE INDEX idx_documents_expiry ON documents(expiry_date);
CREATE INDEX idx_documents_status ON documents(status);

-- ============================================
-- REMINDERS/NOTIFICATIONS (Hatırlatmalar)
-- ============================================

CREATE TABLE reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reminder_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    related_entity_type VARCHAR(20),
    related_entity_id UUID,
    trigger_date DATE NOT NULL,
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'acknowledged', 'dismissed')),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reminders_date ON reminders(trigger_date);
CREATE INDEX idx_reminders_status ON reminders(status);
CREATE INDEX idx_reminders_priority ON reminders(priority);

-- ============================================
-- COMPANY DOCUMENTS (Firma Belgeleri)
-- ============================================

CREATE TABLE company_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN (
        'krs', 'ceidg', 'nip', 'regon', 
        'transport_license', 'community_license', 'ocp'
    )),
    document_number VARCHAR(50),
    issue_date DATE,
    expiry_date DATE,
    issuing_authority VARCHAR(100),
    document_path TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CURRENCY EXCHANGE RATES
-- ============================================

CREATE TABLE exchange_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_currency VARCHAR(3) NOT NULL,
    to_currency VARCHAR(3) NOT NULL,
    rate DECIMAL(15,6) NOT NULL,
    rate_date DATE NOT NULL,
    source VARCHAR(50), -- NBP, ECB, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_exchange_rates ON exchange_rates(from_currency, to_currency, rate_date);

-- ============================================
-- AUDIT LOG (Denetim İzi)
-- ============================================

CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_table ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_log_date ON audit_log(created_at);

-- ============================================
-- GDPR DATA REQUESTS
-- ============================================

CREATE TABLE gdpr_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_type VARCHAR(20) NOT NULL CHECK (request_type IN ('access', 'export', 'delete')),
    requester_id UUID REFERENCES users(id),
    requester_email VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Document status update based on expiry date
CREATE OR REPLACE FUNCTION update_document_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.expiry_date IS NOT NULL THEN
        IF NEW.expiry_date < CURRENT_DATE THEN
            NEW.status := 'expired';
        ELSEIF NEW.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN
            NEW.status := 'expiring_soon';
        ELSE
            NEW.status := 'valid';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_document_status BEFORE INSERT OR UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_document_status();

-- ============================================
-- INITIAL DATA
-- ============================================

-- Insert default admin user (password should be hashed in production)
INSERT INTO users (email, password_hash, first_name, last_name, role) 
VALUES ('admin@fleet.pl', '$2b$10$placeholder_hash_change_me', 'Admin', 'User', 'admin');

-- Insert default exchange rates (example)
INSERT INTO exchange_rates (from_currency, to_currency, rate, rate_date, source) VALUES
('EUR', 'PLN', 4.50, CURRENT_DATE, 'NBP'),
('TRY', 'PLN', 0.13, CURRENT_DATE, 'NBP'),
('PLN', 'PLN', 1.00, CURRENT_DATE, 'system'),
('EUR', 'EUR', 1.00, CURRENT_DATE, 'system'),
('TRY', 'TRY', 1.00, CURRENT_DATE, 'system');
