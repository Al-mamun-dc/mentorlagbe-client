# MentorLagbe – Online Tutoring Marketplace

MentorLagbe is an online tutoring marketplace that connects students with tutors. Students can browse tuition posts, view tuition details, and apply for suitable tuition opportunities. Tutors can create tuition posts and manage student applications. Admins can manage users, tuition posts, and platform activities.

## 🌐 Live Website

**Live URL:** [Add Your Deployed Website URL Here]

---

## 🔐 Demo Admin Credentials

Use the following credentials to access the Admin Dashboard:

- **Admin Email:** `YOUR_ADMIN_EMAIL`
- **Admin Password:** `YOUR_ADMIN_PASSWORD`

> Note: Replace these placeholders with your assignment demo admin credentials. Never publish personal or production passwords.

---

## 🚀 Key Features

### 👨‍🎓 Student Features
- Register and log in securely.
- Browse approved and active tuition posts.
- Search and filter available tuitions.
- View detailed tuition information.
- Apply for tuition opportunities.
- View submitted applications.
- Cancel pending applications.
- Manage personal profile.
- View subscription plan information.

### 👨‍🏫 Tutor Features
- Register and log in as a tutor.
- Create and publish tuition posts.
- Manage personal tuition posts.
- Edit and delete tuition posts.
- View student applications for posted tuitions.
- Accept or reject student applications.
- Manage tutor profile.
- Upgrade to the Pro subscription plan.

### 🛡️ Admin Features
- Secure Admin Dashboard.
- View platform statistics.
- Manage registered users and their roles.
- View and manage tuition posts.
- Approve or reject tuition posts.
- View transaction and payment information.

### 💳 Subscription & Payment
- Free and Pro subscription plans.
- Student Pro plan: $10/month.
- Tutor Pro plan: $15/month.
- Stripe Checkout integration.
- Stripe webhook payment verification.
- Subscription status management.
- Payment transaction records.

### 🔒 Authentication & Security
- Better Auth authentication.
- Role-based access control (Student, Tutor, Admin).
- JWT Bearer token authentication for protected Express APIs.
- Backend-side token verification.
- Protected API routes.
- User ownership verification for protected operations.

---

## 🛠️ Technology Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide React

### Backend
- Node.js
- Express.js
- MongoDB

### Authentication & Payment
- Better Auth
- JWT
- Stripe

---

## 📦 Important NPM Packages

### Frontend Packages
- `next`
- `react`
- `react-dom`
- `better-auth`
- `stripe`
- `jose`
- `lucide-react`
- `tailwindcss`

### Backend Packages
- `express`
- `mongodb`
- `cors`
- `dotenv`
- `jose`

> Check the frontend and backend package.json files for the complete and exact dependency lists.

---

## 📁 Project Structure

```text
MentorLagbe/
│
├── mentorlagbe-client/
│   ├── app/
│   │   ├── api/
│   │   ├── dashboard/
│   │   ├── login/
│   │   ├── register/
│   │   └── tuitions/
│   │
│   ├── components/
│   ├── lib/
│   ├── public/
│   ├── package.json
│   └── README.md
│
└── mentorlagbe-server/
    ├── index.js
    ├── package.json
    └── .env
```

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### 2. Frontend Setup

```bash
cd mentorlagbe-client
npm install
```

Create a `.env.local` file and configure the required environment variables:

```env
BETTER_AUTH_SECRET=your_better_auth_secret
BETTER_AUTH_URL=http://localhost:3000

NEXT_PUBLIC_API_URL=http://localhost:8000

MONGODB_URI=your_mongodb_connection_string

STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

Run the frontend:

```bash
npm run dev
```

Frontend runs at:

```text
http://localhost:3000
```

### 3. Backend Setup

Open another terminal:

```bash
cd mentorlagbe-server
npm install
```

Create a `.env` file:

```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string

BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_JWKS_URL=http://localhost:3000/api/auth/jwks
BETTER_AUTH_JWT_ISSUER=http://localhost:3000
BETTER_AUTH_JWT_AUDIENCE=http://localhost:3000
```

Run the backend:

```bash
npm start
```

If the project uses nodemon, you can run:

```bash
npm run dev
```

Backend runs at:

```text
http://localhost:8000
```

> Important: Use the actual environment variable names and scripts from your project configuration. Never commit `.env` or `.env.local` files to GitHub.

---

## 💰 Subscription Plans

| Plan | Price | Features |
|---|---:|---|
| Student Free | $0 | Basic student features |
| Student Pro | $10/month | Student Pro subscription |
| Tutor Free | $0 | Limited tuition posting |
| Tutor Pro | $15/month | Unlimited tuition posting |

---

## 🔑 User Roles

| Role | Access |
|---|---|
| Student | Browse tuition, apply, manage applications |
| Tutor | Post tuition, manage posts, manage applicants |
| Admin | Manage users, tuition posts, and transactions |

---

## 👨‍💻 Developer

**Name:** Md Al Mamun

**GitHub:** [Al-mamun-dc](https://github.com/Al-mamun-dc)

**LinkedIn:** [Al Mamun](https://linkedin.com/in/al-mamun-73a949213/)

---

## 📄 License

This project was developed as an educational project.


what is node js
sl nosql