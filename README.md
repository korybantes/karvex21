# Fleet & Operation Management System

A comprehensive web-based and mobile-responsive fleet management system for Polish transportation companies operating across the EU.

## Features

- **Driver Tracking (Şoför Takibi)**: Manage driver profiles, assignments, and documents
- **Vehicle Tracking (Araç/Tır Takibi)**: Track vehicles, maintenance, and expenses
- **Accounting & Finance (Muhasebe)**: Income/expense tracking with multi-currency support
- **Document Tracking (Evrak Takibi)**: Manage driver and vehicle documents with expiry alerts
- **Reminder/Alert System (Hatırlatma/Uyarı)**: Automated reminders for document expiry and important dates
- **Reporting Dashboard (Raporlama)**: Financial and operational reports with visualizations
- **Multi-currency Support**: PLN, EUR, TRY with automatic conversion
- **Multi-language Support**: Turkish, Polish, English
- **GDPR Compliant**: Data protection and privacy features

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with Role-Based Access Control (RBAC)
- **Internationalization**: next-i18next
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd karvex21
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env` and configure:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/karvex21"
   JWT_SECRET="your-super-secret-jwt-key"
   NEXT_PUBLIC_API_URL="http://localhost:3000"
   ```

4. **Set up the database**
   
   Run Prisma migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

   Or use the provided SQL schema:
   ```bash
   psql -U your_user -d karvex21 -f database-schema.sql
   ```

5. **Generate Prisma client**
   ```bash
   npx prisma generate
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## User Roles

- **Admin**: Full access to all modules and settings
- **Accountant**: Access to accounting and financial reports
- **Driver**: Limited access to personal assignments and documents

## Project Structure

```
karvex21/
├── pages/                    # Next.js pages
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── drivers/        # Driver management
│   │   ├── vehicles/       # Vehicle management
│   │   ├── accounting/     # Financial operations
│   │   ├── documents/      # Document management
│   │   ├── reminders/      # Reminder system
│   │   ├── reports/        # Reporting endpoints
│   │   └── currency/       # Exchange rates
│   ├── dashboard.tsx       # Main dashboard
│   ├── drivers.tsx         # Driver tracking page
│   ├── vehicles.tsx        # Vehicle tracking page
│   ├── accounting.tsx      # Accounting page
│   ├── documents.tsx       # Document management page
│   ├── reminders.tsx       # Reminders page
│   └── reports.tsx         # Reports page
├── components/              # React components
│   ├── Layout.tsx          # Main layout with sidebar
│   ├── DashboardStats.tsx  # Dashboard statistics
│   ├── UpcomingReminders.tsx
│   └── RecentActivity.tsx
├── lib/                    # Utility libraries
│   ├── auth.ts            # Authentication utilities
│   ├── prisma.ts          # Prisma client
│   ├── middleware.ts      # Next.js middleware
│   ├── currency.ts        # Currency conversion
│   └── export.ts          # CSV export utilities
├── prisma/                # Prisma schema
│   └── schema.prisma
├── public/locales/        # Translation files
│   ├── tr/
│   ├── pl/
│   └── en/
├── styles/                # Global styles
│   └── globals.css
└── database-schema.sql    # SQL schema file
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Drivers
- `GET /api/drivers` - List all drivers
- `POST /api/drivers` - Create new driver
- `GET /api/drivers/[id]` - Get driver details
- `PUT /api/drivers/[id]` - Update driver
- `DELETE /api/drivers/[id]` - Soft delete driver

### Vehicles
- `GET /api/vehicles` - List all vehicles
- `POST /api/vehicles` - Create new vehicle
- `GET /api/vehicles/[id]` - Get vehicle details
- `PUT /api/vehicles/[id]` - Update vehicle
- `DELETE /api/vehicles/[id]` - Soft delete vehicle

### Accounting
- `GET /api/accounting/summary` - Get financial summary
- `GET /api/accounting/income` - List income records
- `POST /api/accounting/income` - Create income record
- `GET /api/accounting/expense` - List expense records
- `POST /api/accounting/expense` - Create expense record

### Documents
- `GET /api/documents` - List all documents
- `POST /api/documents` - Upload new document

### Reminders
- `GET /api/reminders` - List all reminders
- `POST /api/reminders` - Create new reminder
- `PATCH /api/reminders/[id]` - Update reminder
- `DELETE /api/reminders/[id]` - Delete reminder

### Reports
- `GET /api/reports?range=month|quarter|year` - Get report data

### Currency
- `GET /api/currency/rates` - Get current exchange rates
- `POST /api/currency/rates` - Update exchange rates

## Deployment

### Production Build

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

### Environment Variables for Production

Make sure to set these environment variables in your production environment:

```env
DATABASE_URL="postgresql://user:password@prod-host:5432/karvex21"
JWT_SECRET="your-production-secret-key"
NODE_ENV="production"
```

### Database Migration in Production

```bash
npx prisma migrate deploy
```

### Docker Deployment (Optional)

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t karvex21 .
docker run -p 3000:3000 --env-file .env karvex21
```

## Development

### Adding New Translations

Add translations to `public/locales/{lang}/common.json`:

```json
{
  "newKey": "Translation text"
}
```

### Database Schema Changes

1. Update `prisma/schema.prisma`
2. Run migration: `npx prisma migrate dev --name description`
3. Generate client: `npx prisma generate`

## Security Considerations

- JWT tokens are stored in localStorage (consider httpOnly cookies for production)
- Passwords are hashed using bcrypt
- Role-based access control is enforced on API routes
- Input validation should be added to all API endpoints
- HTTPS should be used in production
- Rate limiting should be implemented for API endpoints

## GDPR Compliance

- User data can be exported on request
- Data deletion requests are supported via GDPR request table
- Audit logs track all data modifications
- Document expiry tracking ensures compliance

## Support

For issues and questions, please contact the development team.

## License

Proprietary - All rights reserved.
