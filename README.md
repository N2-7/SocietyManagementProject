# Smart Society Management System

A complete full-stack society management system built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## Features

### Authentication
- JWT-based authentication with refresh tokens
- Role-based access control (Admin, Resident, Guard)
- Signup with admin approval workflow
- Login using flat number and password
- Password hashing with bcrypt

### Admin Features
- Dashboard with statistics and charts
- Resident management (CRUD, approve/block)
- Visitor management and tracking
- Complaint management with status updates
- Maintenance bill generation and tracking
- Notice board with pinning
- Event management
- Emergency contacts management
- Parking slot assignment
- Amenity booking management
- Security logs monitoring
- Export reports (PDF/Excel)

### Resident Features
- Personal dashboard
- Profile management
- Raise and track complaints
- View and pay maintenance bills
- View notices and events
- Pre-register visitors with QR codes
- Book amenities
- View parking information
- Emergency contacts access

### Guard Features
- Visitor entry/exit management
- QR code scanning for pre-registered visitors
- Resident verification
- Delivery and cab entry logging
- Emergency alerts
- Security patrol logs
- Visitor history

### Additional Features
- Real-time notifications with Socket.io
- File upload with Cloudinary
- Payment integration with Razorpay
- Dark mode support
- Responsive design
- Modern UI with Tailwind CSS
- State management with Redux Toolkit

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Socket.io
- Multer + Cloudinary
- Razorpay
- PDFKit
- ExcelJS

### Frontend
- React.js (Vite)
- Redux Toolkit
- React Router
- Axios
- React Hook Form
- Chart.js
- Tailwind CSS
- Lucide Icons
- React Hot Toast

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd project
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/smart-society

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here_change_in_production
REFRESH_TOKEN_EXPIRE=30d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_password

# Frontend URL
CLIENT_URL=http://localhost:5173
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

## Running the Application

### Start MongoDB

Make sure MongoDB is running on your system or use MongoDB Atlas connection string in the `.env` file.

### Start Backend Server

```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:5000`

### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173`

## Default Admin Account

After setting up the database, you need to create an admin account manually or use MongoDB Compass to insert:

```javascript
{
  "name": "Admin User",
  "email": "admin@society.com",
  "flatNo": "ADMIN",
  "password": "admin123", // This will be hashed automatically
  "phone": "1234567890",
  "role": "admin",
  "status": "active"
}
```

Or create a script to seed the admin:

```bash
# In backend directory
node scripts/seedAdmin.js
```

## Project Structure

### Backend
```
backend/
├── config/
│   ├── db.js           # Database connection
│   ├── cloudinary.js   # Cloudinary config
│   ├── razorpay.js     # Razorpay config
│   └── socket.js       # Socket.io config
├── controllers/
│   ├── authController.js
│   ├── adminController.js
│   ├── adminController2.js
│   ├── residentController.js
│   └── guardController.js
├── middleware/
│   ├── auth.js         # Authentication middleware
│   ├── errorHandler.js # Error handling
│   ├── rateLimiter.js  # Rate limiting
│   └── upload.js      # File upload
├── models/
│   ├── User.js
│   ├── Visitor.js
│   ├── Complaint.js
│   ├── Maintenance.js
│   ├── Payment.js
│   ├── Notice.js
│   ├── Event.js
│   ├── EmergencyContact.js
│   ├── Parking.js
│   ├── Amenity.js
│   └── SecurityLog.js
├── routes/
│   ├── authRoutes.js
│   ├── adminRoutes.js
│   ├── adminRoutes2.js
│   ├── residentRoutes.js
│   ├── guardRoutes.js
│   └── uploadRoutes.js
├── utils/
│   ├── generateToken.js
│   ├── generateQR.js
│   ├── sendEmail.js
│   ├── generatePDF.js
│   └── generateExcel.js
├── server.js
└── package.json
```

### Frontend
```
frontend/
├── src/
│   ├── components/     # Reusable components
│   ├── pages/
│   │   ├── auth/       # Login, Signup
│   │   ├── admin/      # Admin pages
│   │   ├── resident/   # Resident pages
│   │   └── guard/      # Guard pages
│   ├── layouts/
│   │   ├── AdminLayout.jsx
│   │   ├── ResidentLayout.jsx
│   │   └── GuardLayout.jsx
│   ├── redux/
│   │   ├── store.js
│   │   └── slices/
│   │       ├── authSlice.js
│   │       ├── adminSlice.js
│   │       ├── residentSlice.js
│   │       └── guardSlice.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── postcss.config.js
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh access token

### Admin Routes
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/residents` - Get all residents
- `POST /api/admin/residents` - Create resident
- `PUT /api/admin/approve-resident/:id` - Approve resident
- `PUT /api/admin/block-resident/:id` - Block/unblock resident
- `GET /api/admin/visitors` - Get all visitors
- `GET /api/admin/complaints` - Get all complaints
- `PUT /api/admin/complaints/:id` - Update complaint
- `GET /api/admin/maintenance` - Get maintenance records
- `POST /api/admin/maintenance` - Generate maintenance bill
- `GET /api/admin/notices` - Get notices
- `POST /api/admin/notices` - Create notice
- `GET /api/admin/events` - Get events
- `POST /api/admin/events` - Create event
- `GET /api/admin/parking` - Get parking slots
- `POST /api/admin/parking` - Assign parking
- `GET /api/admin/amenities` - Get amenity bookings
- `PUT /api/admin/amenities/:id` - Update booking
- `GET /api/admin/security-logs` - Get security logs
- `GET /api/admin/reports/:type` - Export reports

### Resident Routes
- `GET /api/resident/dashboard` - Get dashboard data
- `GET /api/resident/profile` - Get profile
- `PUT /api/resident/profile` - Update profile
- `GET /api/resident/complaints` - Get complaints
- `POST /api/resident/complaints` - Create complaint
- `GET /api/resident/maintenance` - Get maintenance bills
- `POST /api/resident/payment/create-order` - Create payment order
- `POST /api/resident/payment/verify` - Verify payment
- `GET /api/resident/notices` - Get notices
- `GET /api/resident/events` - Get events
- `POST /api/resident/events/:id/rsvp` - RSVP for event
- `GET /api/resident/amenities` - Get amenity bookings
- `POST /api/resident/amenities` - Book amenity
- `GET /api/resident/visitors` - Get visitors
- `POST /api/resident/visitors` - Pre-register visitor

### Guard Routes
- `GET /api/guard/dashboard` - Get dashboard data
- `POST /api/guard/visitor-entry` - Register visitor entry
- `PUT /api/guard/visitor-exit/:id` - Register visitor exit
- `POST /api/guard/scan-qr` - Scan QR code
- `GET /api/guard/search-flat/:flatNo` - Search flat
- `GET /api/guard/verify-resident/:flatNo` - Verify resident
- `POST /api/guard/delivery` - Log delivery
- `POST /api/guard/cab` - Log cab entry
- `POST /api/guard/emergency` - Create emergency alert
- `GET /api/guard/security-logs` - Get security logs
- `POST /api/guard/patrol` - Log patrol

### Upload
- `POST /api/upload` - Upload image

## Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRE` - JWT token expiration time
- `REFRESH_TOKEN_SECRET` - Secret key for refresh tokens
- `REFRESH_TOKEN_EXPIRE` - Refresh token expiration time
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `RAZORPAY_KEY_ID` - Razorpay key ID
- `RAZORPAY_KEY_SECRET` - Razorpay key secret
- `CLIENT_URL` - Frontend URL

## Deployment

### Backend Deployment
1. Deploy backend to a hosting service (Heroku, Render, AWS, etc.)
2. Set environment variables in the hosting platform
3. Ensure MongoDB is accessible (use MongoDB Atlas for production)
4. Build and start the server

### Frontend Deployment
1. Build the frontend: `npm run build`
2. Deploy the `dist` folder to Vercel, Netlify, or any static hosting
3. Set the API URL in production environment

## Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting to prevent brute force attacks
- Helmet for HTTP headers security
- CORS configuration
- Input validation and sanitization
- Role-based access control
- Protected routes

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@smartsociety.com or open an issue in the repository.
