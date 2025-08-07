# SiteScope - Website Audit Tool

A fast, affordable website audit tool built with Node.js, EJS, and Bootstrap.

## Features

- 🚀 **Fast Performance Analysis** - Real-time website speed and performance metrics
- 🔍 **SEO Audit** - Comprehensive SEO analysis and recommendations
- 📱 **Mobile Optimization** - Mobile-first responsive design testing
- 🛡️ **Security Check** - Basic security vulnerability scanning
- 📊 **Detailed Reports** - Beautiful, actionable PDF reports
- 💼 **User Accounts** - Save audit history and track improvements

## Quick Start

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Set Up Environment**

   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Start Development Server**

   ```bash
   npm run dev
   ```

4. **Open in Browser**
   ```
   http://localhost:3000
   ```

## Project Structure

```
audit-website/
├── app.js                 # Express server setup
├── routes/                # Route handlers
│   ├── index.js          # Landing page routes
│   ├── audit.js          # Audit functionality
│   └── auth.js           # Authentication routes
├── views/                # EJS templates
│   ├── layout.ejs        # Main layout
│   ├── index.ejs         # Homepage
│   └── ...               # Other pages
├── public/               # Static assets
│   ├── css/              # Stylesheets
│   ├── js/               # Client-side JavaScript
│   └── reports/          # Generated PDF reports
├── lib/                  # Utility modules
│   ├── validators.js     # Input validation
│   └── audit-engine/     # Your audit engine
└── models/               # Database models
```

## Development

### Adding Your Audit Engine

1. Copy your existing audit modules to `lib/audit-engine/`
2. Update the imports in `routes/audit.js`
3. Integrate the audit functions with the web interface

### Environment Variables

Key environment variables to configure:

- `NODE_ENV` - development/production
- `PORT` - Server port (default: 3000)
- `SESSION_SECRET` - Session encryption key
- `DATABASE_URL` - Database connection string

### Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm test` - Run tests (when implemented)

## Deployment

### Option 1: DigitalOcean App Platform

1. Connect your GitHub repository
2. Set environment variables in the dashboard
3. Deploy automatically

### Option 2: Railway

1. Connect repository to Railway
2. Configure environment variables
3. Deploy with zero configuration

### Option 3: Traditional VPS

1. Set up Node.js on your server
2. Clone repository and install dependencies
3. Use PM2 for process management
4. Set up reverse proxy with Nginx

## Technology Stack

- **Backend**: Node.js + Express
- **Frontend**: EJS + Bootstrap 5
- **Database**: SQLite (development) → PostgreSQL (production)
- **Authentication**: Express Session + bcryptjs
- **PDF Generation**: Puppeteer
- **Styling**: Bootstrap + Font Awesome

## License

MIT License - see LICENSE file for details

## Support

For support and questions:

- Email: support@sitescope.io
- Documentation: https://docs.sitescope.io
- Issues: GitHub Issues
