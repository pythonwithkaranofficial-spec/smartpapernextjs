# 📊 Website Feature Parity Matrix — Smart Paper Generator

This document provides a comprehensive mapping of every interactive feature, button, workflow, and API endpoint from the existing Next.js website to its corresponding implementation in the Flutter Android application (`mobile/`).

---

## 1. Feature Parity Matrix

| Website Feature | Website Location | Button / Action | Backend API Route | Flutter Screen | Flutter Implementation Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **User Sign Up** | `/signup` & AuthModal | `Register / Create Account` | Firebase Auth & `POST /api/auth/sync` | `AuthScreen` (Tab: Register) | ✅ Fully Integrated |
| **User Login** | `/login` & AuthModal | `Sign In` | Firebase Auth & `POST /api/auth/sync` | `AuthScreen` (Tab: Login) | ✅ Fully Integrated |
| **Google Sign-In** | AuthModal | `Continue with Google` | Firebase Google Auth & `POST /api/auth/sync` | `AuthScreen` (`GoogleAuthButton`) | ✅ Fully Integrated |
| **Password Reset** | `/forgot-password` | `Send Reset Link` | Firebase Auth `sendPasswordResetEmail` | `AuthScreen` (`ForgotPasswordDialog`) | ✅ Fully Integrated |
| **Email Verification**| Banner / Modal | `Resend Verification Email` | Firebase Auth `sendEmailVerification` | `ProfileScreen` & `AuthBanner` | ✅ Fully Integrated |
| **User Sign Out** | Navbar & Profile | `Log Out` | Firebase Auth `signOut` | `ProfileScreen` (`LogoutButton`) | ✅ Fully Integrated |
| **Nav: Home** | Navbar | `Home` | N/A | `HomeScreen` | ✅ Fully Integrated |
| **Nav: Generator** | Navbar / Hero CTA | `Generate Paper` | `GET /api/user/usage` | `GeneratorScreen` | ✅ Fully Integrated |
| **Nav: Custom Generator**| Navbar Submenu | `Custom Generator` | `GET /api/user/usage` | `GeneratorScreen` (Custom Mode) | ✅ Fully Integrated |
| **Nav: Paper History**| Navbar | `History` | `GET /api/user/history` | `HistoryScreen` | ✅ Fully Integrated |
| **Nav: Subscription** | Navbar | `Pricing / Upgrade` | `POST /api/payment/checkout` | `SubscriptionScreen` | ✅ Fully Integrated |
| **Nav: User Profile** | Navbar Avatar | `Profile / Account` | `GET /api/user/me` | `ProfileScreen` | ✅ Fully Integrated |
| **Nav: Admin Panel** | Navbar (Admin only) | `Admin Panel` | `GET /api/admin/users` | `AdminScreen` | ✅ Fully Integrated |
| **Wizard: Exam Select**| `/generate` (Step 1) | Exam Type Cards (10 types) | N/A | `StepExamTypeWidget` | ✅ Fully Integrated |
| **Wizard: Class Select**| `/generate` (Step 1) | Class 1-12 Pills | N/A | `StepClassSelectWidget` | ✅ Fully Integrated |
| **Wizard: Subject Select**| `/generate` (Step 2) | Subject Cards + Custom | N/A | `StepSubjectSelectWidget` | ✅ Fully Integrated |
| **Wizard: Chapter Select**| `/generate` (Step 2) | Multi-chapter selection | NCERT Data (`curriculum-data`) | `StepChaptersSelectWidget` | ✅ Fully Integrated |
| **Wizard: Paper Options**| `/generate` (Step 3) | Total Marks, Duration, Sets, Instructions, Solutions | N/A | `StepPaperOptionsWidget` | ✅ Fully Integrated |
| **Wizard: Question Dist**| `/generate` (Step 4) | MCQ, VSA, Short, Case, Long Count & Marks | N/A | `StepQuestionDistWidget` | ✅ Fully Integrated |
| **Wizard: Difficulty** | `/generate` (Step 4) | Easy %, Medium %, Hard % Sliders | N/A | `StepDifficultyWidget` | ✅ Fully Integrated |
| **Generate Paper CTA** | `/generate` (Step 5) | `Generate Paper (AI)` | `POST /api/generate` & `POST /api/user/history` | `GeneratorScreen` (`GenerateCTA`) | ✅ Fully Integrated |
| **Preview: Render Set**| `/preview` | `Set A / Set B / Set C` Toggle | Native Flutter Render Engine | `PreviewScreen` (`SetToggleBar`) | ✅ Fully Integrated |
| **Preview: Edit Content**| `/preview` | Inline Edit Question/Answers | Local State Mutation | `PreviewScreen` (`EditableQuestionTile`) | ✅ Fully Integrated |
| **Preview: Swap Question**| `/preview` | `Swap Question (AI)` | `POST /api/swap-question` | `PreviewScreen` (`SwapQuestionButton`) | ✅ Fully Integrated |
| **Preview: Solution Key**| `/preview` | `Toggle Answer Key` | Local Render Toggle | `PreviewScreen` (`SolutionKeyToggle`) | ✅ Fully Integrated |
| **Preview: Export PDF** | `/preview` / DownloadBar | `Download PDF` | Flutter PDF Engine (`pdf` & `printing` pkgs) | `PreviewScreen` (`ExportPDFButton`) | ✅ Fully Integrated |
| **Preview: Export DOCX**| `/preview` / DownloadBar | `Download DOCX` | Flutter DOCX / File Engine | `PreviewScreen` (`ExportDOCXButton`) | ✅ Fully Integrated |
| **Preview: Share Paper**| `/preview` / DownloadBar | `Share Paper` | Android Native Share Intent | `PreviewScreen` (`SharePaperButton`) | ✅ Fully Integrated |
| **History: View Paper**| `/history` | `View / Reopen` | Local State & Cache | `HistoryScreen` (`HistoryCard`) | ✅ Fully Integrated |
| **History: Export PDF/DOCX**| `/history` | `Export PDF / DOCX` | Local PDF Engine | `HistoryScreen` (`HistoryCardActions`) | ✅ Fully Integrated |
| **Payment: Checkout** | Pricing Cards | `Upgrade to PRO/PREMIUM` | `POST /api/payment/checkout` | `SubscriptionScreen` (`CheckoutCTA`) | ✅ Fully Integrated |
| **Payment: Verification**| Razorpay Modal Callback| Payment Callback Verification | `POST /api/payment/verify` | `SubscriptionScreen` (`PaymentVerifyHandler`) | ✅ Fully Integrated |
| **Admin: View Users** | `/admin` | User Table & Search | `GET /api/admin/users` | `AdminScreen` (`UserListView`) | ✅ Fully Integrated |
| **Admin: Change Role/Plan**| `/admin` | `Update User Role / Plan` | `PUT /api/admin/users` | `AdminScreen` (`UserEditDialog`) | ✅ Fully Integrated |

---

## 2. API Endpoints Map

```text
               Flutter Mobile App
                       │
       ┌───────────────┴───────────────┐
       ▼                               ▼
Firebase Auth SDK             Next.js REST API
 (Identity Provider)         (http://<host>:3000/api)
       │                               │
       │                      ┌────────┴────────┐
       │                      ▼                 ▼
       └──────────────► AuthMiddleware      Turso DB / Gemini
                      (Bearer token)
```

1. **`POST /api/auth/sync`** — Synchronizes user registration & Google SSO with Turso SQLite DB.
2. **`GET /api/user/me`** — Fetches current user profile & role.
3. **`GET /api/user/usage`** — Fetches today's paper generation count & daily limit.
4. **`GET /api/user/history`** — Retrieves past generated paper JSON records.
5. **`POST /api/user/history`** — Saves newly generated paper JSON to user history.
6. **`POST /api/generate`** — Calls Gemini 2.5 Flash to generate full structured paper JSON.
7. **`POST /api/swap-question`** — Re-generates a single question using Gemini 2.5 Flash.
8. **`POST /api/payment/checkout`** — Creates Razorpay order ID.
9. **`POST /api/payment/verify`** — Verifies Razorpay HMAC signature & upgrades user plan.
10. **`GET /api/admin/users`** — Admin route to list all platform users.
11. **`PUT /api/admin/users`** — Admin route to update user role or subscription plan.
