# 🌱 Trashure - Smart Waste Management Platform

> **Making waste management simple, efficient, and environmentally friendly for everyone!**

Trashure is a comprehensive waste management platform that connects citizens with waste collectors, streamlining the process of waste collection and recycling. Built with modern web technologies, it provides an intuitive interface for both citizens and collectors to manage waste pickup requests efficiently.

## ✨ Features

### 👥 For Citizens
- **Easy Request Creation**: Submit waste pickup requests with just a few clicks
- **Real-time Tracking**: Track your waste collection from request to completion
- **Smart Scheduling**: Schedule pickups at your convenience
- **Approval System**: Review and approve collection completion with feedback
- **Impact Dashboard**: See your environmental contribution and impact

### 🚛 For Collectors
- **Request Management**: View and accept pickup requests in your area
- **Route Optimization**: Smart routing to maximize efficiency
- **Status Updates**: Update collection status in real-time
- **Performance Analytics**: Track your collection metrics and performance
- **Completion Workflow**: Request citizen approval for completed collections

### 🔧 Technical Features
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Real-time Updates**: Live status updates and notifications
- **Secure Authentication**: JWT-based authentication with role-based access
- **Image Upload**: Support for waste images and documentation
- **Modern UI/UX**: Clean, intuitive interface with smooth animations

## 🚀 Tech Stack

- **Frontend**: Next.js 15, React 18, CSS Modules
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with HTTP-only cookies
- **Styling**: CSS Modules with responsive design
- **Icons**: React Icons (Font Awesome)
- **Development**: Turbopack for fast development builds

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **MongoDB** (local or cloud instance)

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/its-tarun-2505/Trashure.git
cd trashure
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
MONGODB_URI=mongodb://localhost:27017/trashure
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/trashure

JWT_SECRET=your-super-secret-jwt-key-here
NEXTAUTH_URL=http://localhost:3000
```

### 4. Database Setup
Ensure MongoDB is running and accessible. The application will automatically create the necessary collections and indexes on first run.

### 5. Start Development Server
```bash
npm run dev
# or
yarn dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
trashure/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── citizen/       # Citizen-specific APIs
│   │   │   └── collector/     # Collector-specific APIs
│   │   ├── citizen/           # Citizen dashboard and pages
│   │   ├── collector/         # Collector dashboard and pages
│   │   ├── login/             # Authentication pages
│   │   └── register/          # Registration pages
│   ├── components/            # Reusable React components
│   │   ├── citizen/           # Citizen-specific components
│   │   └── collector/         # Collector-specific components
│   ├── lib/                   # Utility libraries
│   │   ├── auth.js           # Authentication utilities
│   │   └── db.js             # Database connection
│   ├── models/               # Mongoose data models
│   │   ├── User.js           # User model
│   │   └── PickupRequest.js  # Pickup request model
│   └── styles/               # Global styles
├── public/                   # Static assets
├── middleware.js            # Next.js middleware
└── package.json            # Dependencies and scripts
```

## 🔐 User Roles & Authentication

### Citizen
- Create waste pickup requests
- Track request status
- Approve/reject collection completion
- View personal dashboard and history

### Collector
- Accept pickup requests
- Update collection status
- Request completion approval
- View performance analytics

### Admin
- Manage users and requests
- View system analytics
- Configure system settings

## 📱 Usage Guide

### For Citizens
1. **Register/Login** with your email and role
2. **Create Request** by providing waste details, location, and preferred time
3. **Track Progress** through the real-time status updates
4. **Approve Completion** when collector marks the job as done

### For Collectors
1. **Login** to your collector dashboard
2. **Accept Requests** from available pickup requests
3. **Update Status** as you progress through the collection
4. **Request Approval** when collection is complete

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Citizen APIs
- `GET /api/citizen/requests` - Get user's requests
- `POST /api/citizen/requests` - Create new request
- `GET /api/citizen/requests/[id]` - Get specific request
- `POST /api/citizen/requests/[id]/approve-completion` - Approve completion
- `POST /api/citizen/requests/[id]/reject-completion` - Reject completion

### Collector APIs
- `GET /api/collector/requests` - Get available requests
- `POST /api/collector/requests/[id]/accept` - Accept request
- `GET /api/collector/collections` - Get collector's collections
- `PATCH /api/collector/collections/[id]/status` - Update status
- `POST /api/collector/collections/[id]/request-completion` - Request completion

## 🎨 Customization

### Styling
The project uses CSS Modules for component-specific styling. You can customize:
- Colors and themes in component CSS files
- Global styles in `src/app/globals.css`
- Responsive breakpoints and layouts

### Adding New Features
1. Create new API routes in `src/app/api/`
2. Add corresponding frontend pages in `src/app/`
3. Update data models in `src/models/` if needed
4. Add new components in `src/components/`

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on every push

### Other Platforms
The application can be deployed on any platform that supports Node.js:
- **Netlify**: Use the Next.js build command
- **Railway**: Connect your GitHub repository
- **DigitalOcean App Platform**: Deploy with automatic builds

### Environment Variables for Production
```env
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
NEXTAUTH_URL=https://your-domain.com
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run linting
npm run lint

# Build for production
npm run build
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow the existing code style and patterns
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js** team for the amazing framework
- **MongoDB** for the flexible database solution
- **React Icons** for the beautiful icon set
- **Community contributors** for feedback and suggestions

## 📞 Support

If you encounter any issues or have questions:

1. **Check** the [Issues](https://github.com/yourusername/trashure/issues) page
2. **Create** a new issue with detailed information
3. **Contact** the development team

## 🔮 Roadmap

- [ ] Mobile app development (React Native)
- [ ] Advanced analytics and reporting
- [ ] Integration with IoT waste sensors
- [ ] Multi-language support
- [ ] Advanced route optimization algorithms
- [ ] Real-time chat between citizens and collectors
- [ ] Gamification features for environmental impact

---

**Made with ❤️ for a cleaner, greener future!**

*Trashure - Where waste management meets technology*