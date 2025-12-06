# Istriwala - Laundry Booking App

A complete full-stack application for a laundry/ironing service.

- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Supabase (Postgres + Edge Functions)
- **Auth**: Supabase Auth (Admin only)

## 🚀 Setup Instructions

### 1. Supabase Setup

1.  **Create a Supabase Project**: Go to [database.new](https://database.new) and create a new project.
2.  **Database Schema**:
    - Go to the **SQL Editor** in your Supabase dashboard.
    - Open `supabase/schema.sql` from this project.
    - Copy/Paste the content and run it.
3.  **Edge Functions**:
    - Ensure you have the [Supabase CLI](https://supabase.com/docs/guides/cli) installed and logged in (`supabase login`).
    - Link your local project to your remote Supabase project:
      ```bash
      supabase link --project-ref your-project-ref
      ```
    - Deploy the functions:
      ```bash
      supabase functions deploy
      ```
4.  **Admin Access**:
    - Go to **Authentication** -> **Users** in Supabase and create a user (email/password).
    - Copy the `User UID` of the new user.
    - Go to **Table Editor** -> `admin_users` table.
    - Insert a row with the `id` you just copied and your `email`.
    - *Note: Only users in this table can access Admin Dashboard.*
5. **Environment Variables**:
   - Go to Project Settings -> API.
   - Copy `Project URL` and `anon public` key.

### 2. Frontend Setup

1.  Navigate to the generic frontend folder:
    ```bash
    cd frontend
    ```
2.  Create `.env`:
    ```bash
    cp .env.example .env
    ```
3.  Update `.env` with your Supabase URL and Key:
    ```env
    VITE_SUPABASE_URL=https://your-project.supabase.co
    VITE_SUPABASE_ANON_KEY=eyJhbG...
    ```
4.  Install dependencies and Run:
    ```bash
    npm install
    npm run dev
    ```
5.  Open [http://localhost:5173](http://localhost:5173).

### 3. Usage

- **Customer**:
  - **Book Now**: Fill the form. *Note: You need to create some slots as Admin first!*
  - **Track**: Enter phone number to see status.
- **Admin**:
  - Go to `/admin-login`.
  - Log in with the credentials you created.
  - **Manage Slots**: Create "Pickup" and "Dropoff" slots (e.g., date: tomorrow, time: "10 AM - 12 PM").
  - **Orders**: View orders and update status (Pending -> Processing -> Ready -> Delivered).

### 4. Deploy to Netlify

1.  Push this repo to GitHub.
2.  Log in to Netlify -> "New site from Git".
3.  Select your repo.
4.  Build settings:
    - **Build command**: `npm run build`
    - **Publish directory**: `dist`
5.  **Environment Variables**:
    - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Netlify Site Settings -> Environment variables.
6.  Deploy!
