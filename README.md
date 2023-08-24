This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

**setup algolia account with firebase extension**
**setup firestore,realtimeDatabase and firebase bucket**
**setup clerk for nextjs**

create a .env.local file add the following variables

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=***********
CLERK_SECRET_KEY=*******

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/signin
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

NEXT_PUBLIC_ALGOLIA_APP_ID=******
NEXT_PUBLIC_ALGOLIA_API_KEY=********

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

