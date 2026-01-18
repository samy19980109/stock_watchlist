# Supabase Auth Integration Guide

This guide explains how to set up and implement authentication in this project using Supabase Auth. We cover Email/Password, Google, and Apple authentication.

## Prerequisites

Ensure you have Supabase initialized in your project. See [SUPABASE.md](file:///Users/samarthagarwal/dev/stock_watchlist/SUPABASE.md) for basic database and client setup.

---

## 1. Email & Password Authentication

### Supabase Dashboard Setup
1. Go to your [Supabase Project Dashboard](https://supabase.com/dashboard/project/_/auth/providers).
2. Navigate to **Authentication** > **Providers**.
3. Ensure **Email** is enabled.
4. (Optional) Disable **Confirm Email** for development if you want to skip email verification.

### Code Implementation

```typescript
// src/components/Auth/EmailAuth.tsx
'use client';

import { supabase } from '@/lib/supabase';
import { useState } from 'react';

export default function EmailAuth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) console.error('Error signing up:', error.message);
    else alert('Check your email for confirmation!');
  };

  const handleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) console.error('Error signing in:', error.message);
  };

  return (
    <div className="flex flex-col gap-4">
      <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} className="p-2 border rounded" />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} className="p-2 border rounded" />
      <button onClick={handleSignIn} className="bg-blue-600 text-white p-2 rounded">Sign In</button>
      <button onClick={handleSignUp} className="bg-gray-200 p-2 rounded">Sign Up</button>
    </div>
  );
}
```

---

## 2. Google Authentication

### Google Cloud Console Setup
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Search for **APIs & Services** > **Credentials**.
4. Click **Create Credentials** > **OAuth client ID**.
5. Select **Web application** as the application type.
6. Add your Supabase project URL as an **Authorized JavaScript origin**.
7. In **Authorized redirect URIs**, add your Supabase Auth Callback URL:
   `https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback`
8. Copy the **Client ID** and **Client Secret**.

### Supabase Dashboard Setup
1. Go to **Authentication** > **Providers** > **Google**.
2. Toggle **Enable Google**.
3. Paste your **Client ID** and **Client Secret**.
4. Save the changes.

### Code Implementation

```typescript
const handleGoogleLogin = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) console.error('Error:', error.message);
};
```

---

## 3. Apple Authentication

### Apple Developer Portal Setup
1. Create an **App ID** (if you don't have one) in the [Apple Developer Portal](https://developer.apple.com/).
2. Create a **Service ID**:
   - Give it an identifier (e.g., `com.yourdomain.app.auth`).
   - Enable **Sign In with Apple**.
   - Configure the **Return URLs** with your Supabase callback:
     `https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback`
3. Create a **Private Key**:
   - Go to **Keys** > **Create a key**.
   - Enable **Sign In with Apple**.
   - Download the `.p8` file and note the **Key ID**.

### Supabase Dashboard Setup
1. Go to **Authentication** > **Providers** > **Apple**.
2. Toggle **Enable Apple**.
3. Enter your **Bundle ID** (from Apple App ID).
4. Enter your **Service ID** (Identifier).
5. Enter your **Team ID** (Found on top right of Apple Developer Portal).
6. Enter the **Key ID** and paste the contents of your `.p8` file into the **Secret Key** field.
7. Save the changes.

### Code Implementation

```typescript
const handleAppleLogin = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) console.error('Error:', error.message);
};
```

---

## 4. Redirect URL Configuration

To ensure OAuth redirects work correctly across different environments (localhost, staging, production), configure your URLs in the Supabase Dashboard:

1. Go to **Authentication** > **URL Configuration**.
2. **Site URL**: The main URL of your application (e.g., `http://localhost:3000` or `https://your-domain.com`).
3. **Redirect URLs**: Add any other valid callback URLs.

### Callback Page
Create a file at `src/app/auth/callback/route.ts` (Next.js App Router) to handle the code exchange:

```typescript
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin);
}
```
> [!NOTE]
> Ensure you have a server-side Supabase client utility set up for the callback route.

---

## 5. Listening for Auth Changes

Use `onAuthStateChange` to update your application state globally.

```typescript
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
      // Handle login
    } else if (event === 'SIGNED_OUT') {
      // Handle logout
    }
  });

  return () => subscription.unsubscribe();
}, []);
```
