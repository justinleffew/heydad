# Hey Dad - Legacy Video Web App

A web application for dads to record or upload short videos for their children that unlock based on age, date, or milestone conditions. Built for Father's Day launch with plans to expand to iOS.

## 🎯 Project Overview

Hey Dad allows fathers to create video messages that their children will receive at specific times in the future. Whether it's advice for their 18th birthday, encouragement for graduation, or wisdom for their wedding day, dads can preserve their thoughts and love for future moments.

## ✨ Features

- **Video Recording**: Record videos directly in the browser using MediaRecorder API
- **File Upload**: Upload pre-recorded video files (.mp4, .mov)
- **Multiple Children**: Add and manage multiple children with birthdates
- **Smart Unlocking**: Videos unlock based on:
  - **Age**: When child reaches a specific age
  - **Date**: On a specific calendar date
  - **Milestone**: For life events (manual unlock)
- **Secure Storage**: Videos stored privately in Supabase Storage
- **Authentication**: Google OAuth and email/password login
- **Responsive Design**: Works on desktop and mobile devices

## 🛠 Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Supabase (Auth, Database, Storage)
- **Styling**: TailwindCSS with custom dad-friendly color palette
- **Icons**: Lucide React
- **Hosting**: Vercel-ready
- **Database**: PostgreSQL (via Supabase)

## 🎨 Design Theme

The app uses a clean, masculine design with the following color palette:
- `#353535` - Primary dark
- `#FFFFFF` - Background white
- `#D2D7DF` - Soft blue-gray
- `#BDBBB0` - Tan-gray
- `#8A897C` - Muted olive

Typography uses Inter font for a clean, trustworthy feel.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Modern web browser with camera/microphone access

### 1. Clone and Install

```bash
git clone <repository-url>
cd hey-dad-web
npm install
```

### 2. Environment Setup

Copy the environment template:
```bash
cp .env.example .env
```

Update `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup

1. Create a new Supabase project
2. Run the SQL schema from `supabase-schema.sql` in your Supabase SQL editor
3. Enable Google OAuth in Supabase Auth settings (optional)

### 4. Storage Setup

The schema automatically creates a `videos` storage bucket. Ensure it's configured properly in your Supabase dashboard.

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the app.

### 6. Build for Production

```bash
npm run build
```

## 📁 Project Structure

```
hey-dad-web/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Layout.jsx       # Main layout with navigation
│   │   └── ProtectedRoute.jsx # Auth guard component
│   ├── contexts/            # React contexts
│   │   └── AuthContext.jsx  # Authentication state management
│   ├── lib/                 # Utilities and configurations
│   │   └── supabase.js      # Supabase client setup
│   ├── pages/               # Page components
│   │   ├── Login.jsx        # Login page
│   │   ├── Signup.jsx       # Registration page
│   │   ├── Dashboard.jsx    # Main dashboard
│   │   ├── AddChild.jsx     # Add child form
│   │   ├── Record.jsx       # Video recording/upload
│   │   └── Videos.jsx       # Video management
│   ├── App.jsx              # Main app component with routing
│   ├── main.jsx             # React entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── supabase-schema.sql      # Database schema
├── package.json             # Dependencies and scripts
├── tailwind.config.js       # Tailwind configuration
├── vite.config.js           # Vite configuration
└── README.md               # This file
```

## 🔐 Authentication

The app supports two authentication methods:

1. **Email/Password**: Traditional signup with email confirmation
2. **Google OAuth**: One-click Google sign-in

All pages except login/signup require authentication.

## 📊 Database Schema

### Tables

- **children**: Child information (name, birthdate)
- **videos**: Video metadata and unlock conditions
- **video_children**: Many-to-many relationship between videos and children

### Storage

- **videos bucket**: Secure video file storage with user-based access control

## 🔒 Security Features

- Row Level Security (RLS) on all database tables
- User-scoped data access (users can only see their own data)
- Secure video storage with signed URLs
- Authentication required for all protected routes

## 🎥 Video Features

### Recording
- Browser-based recording using MediaRecorder API
- 2-minute maximum duration
- Real-time recording timer
- Camera and microphone access

### Upload
- Support for .mp4, .mov, and other video formats
- 100MB file size limit
- Drag-and-drop interface

### Unlock Logic
- **Age-based**: Calculates unlock date from child's birthdate
- **Date-based**: Unlocks on specific calendar date
- **Milestone-based**: Manual unlock (future feature)

## 🚀 Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy automatically on push to main branch

### Other Platforms

The app is a standard Vite React build and can be deployed to:
- Netlify
- AWS S3 + CloudFront
- Any static hosting service

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

- Use functional components with hooks
- Follow React best practices
- Use TailwindCSS for styling (no inline styles)
- Keep components modular and reusable

## 🎯 Future Enhancements

- iOS mobile app
- Apple Sign-In authentication
- Push notifications for unlock events
- Video editing capabilities
- Countdown timers to unlock dates
- Video sharing between family members
- Advanced milestone triggers

## 🐛 Troubleshooting

### Camera/Microphone Issues
- Ensure HTTPS in production (required for media access)
- Check browser permissions
- Test in different browsers

### Supabase Connection Issues
- Verify environment variables
- Check Supabase project status
- Ensure RLS policies are correctly applied

### Video Upload Issues
- Check file size (max 100MB)
- Verify video format compatibility
- Ensure storage bucket permissions

## 📝 License

This project is private and proprietary. All rights reserved.

## 🤝 Contributing

This is a private project. For internal development:

1. Create feature branches from `main`
2. Follow existing code patterns
3. Test thoroughly before merging
4. Update documentation as needed

## 📞 Support

For technical issues or questions, contact the development team.

---

**Hey Dad** - Building legacies, one video at a time. 👨‍👧‍👦 