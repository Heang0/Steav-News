# STEAV NEWS - Next.js Professional News Website

A modern, professional news website built with Next.js 15, TypeScript, Tailwind CSS, MongoDB, and Cloudinary.

## Features

- ✅ **Server-Side Rendering (SSR)** for optimal SEO
- ✅ **Dynamic OG Meta Tags** for social media sharing
- ✅ **Responsive Design** - Mobile, Tablet, Desktop
- ✅ **Khmer Language Support** with Battambang & Noto Sans Khmer fonts
- ✅ **Category-based News** (កម្សាន្ត, សង្គម, កីឡា, ពិភពលោក)
- ✅ **Search & Pagination**
- ✅ **Trending Articles**
- ✅ **Comments & Likes System**
- ✅ **Admin Panel** with authentication
- ✅ **Cloudinary Image Upload**
- ✅ **Professional UI** with primary red color (#e60000)

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Image Storage**: Cloudinary
- **Authentication**: Session-based

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB database (local or Atlas)
- Cloudinary account

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env.local` file:**
   ```bash
   cp .env.example .env.local
   ```

3. **Configure environment variables:**
   ```env
   MONGODB_URI=your_mongodb_connection_string
   DB_NAME=kpop_news
   PORT=3000

   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=admin123
   ADMIN_SESSION_ID=your_secure_session_id

   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   NEXT_PUBLIC_SITE_NAME=STEAV NEWS
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── articles/      # Article endpoints
│   │   ├── admin/         # Admin endpoints
│   │   ├── auth/          # Authentication
│   │   ├── categories/    # Categories
│   │   └── trending/      # Trending articles
│   ├── article/           # Article page
│   ├── admin/             # Admin panel
│   ├── contact-us/        # Contact page
│   ├── privacy-policy/    # Privacy policy page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── ArticleCard.tsx
│   ├── Carousel.tsx
│   ├── SearchBar.tsx
│   ├── Pagination.tsx
│   ├── TrendingArticles.tsx
│   ├── ArticleContent.tsx
│   ├── AdminPanel.tsx
│   ├── ArticleForm.tsx
│   └── ArticleList.tsx
├── hooks/                 # Custom React hooks
│   ├── useArticles.ts
│   └── useCategorySpotlights.ts
├── lib/                   # Utilities and configurations
│   ├── mongodb.ts
│   ├── cloudinary.ts
│   └── utils.ts
└── types/                 # TypeScript types
    ├── index.ts
    └── env.d.ts
```

## API Endpoints

### Public Endpoints
- `GET /api/articles` - Get articles (with pagination, search, category filter)
- `GET /api/articles/:id` - Get single article (increments views)
- `GET /api/articles/count` - Get article count
- `GET /api/categories/homepage-previews` - Get category highlights
- `GET /api/trending` - Get trending articles
- `POST /api/articles/:id/like` - Like an article
- `GET /api/articles/:id/comments` - Get comments
- `POST /api/articles/:id/comments` - Add comment

### Admin Endpoints (Protected)
- `POST /api/admin/articles` - Create article
- `PUT /api/admin/articles/:id` - Update article
- `DELETE /api/admin/articles/:id` - Delete article
- `POST /api/admin/upload` - Upload image

## Admin Panel

Access the admin panel at `/admin`.

**Default credentials** (change in `.env.local`):
- Username: `admin`
- Password: `admin123`

## Customization

### Colors
Edit `tailwind.config.js` to change the primary color:
```js
colors: {
  primary: '#e60000',  // Your brand color
  'primary-dark': '#cc0000',
  'primary-light': '#ff1a1a',
}
```

### Categories
Edit `src/lib/utils.ts`:
```ts
export const CATEGORIES = ['កម្សាន្ត', 'សង្គម', 'កីឡា', 'ពិភពលោក'];
```

## Deployment

### Build for Production
```bash
npm run build
npm start
```

### Deploy to Vercel
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Deploy to Render
1. Create new Web Service
2. Connect GitHub repository
3. Add build command: `npm run build`
4. Add start command: `npm start`
5. Add environment variables

## SEO Features

- Dynamic meta tags for each article
- Open Graph tags for Facebook/Twitter sharing
- Twitter Card support
- Canonical URLs
- Sitemap support (add `sitemap.ts`)
- robots.txt configuration

## Performance Optimizations

- Image optimization with Next.js Image
- Code splitting
- Server-side rendering
- Lazy loading components
- Optimized fonts

## License

ISC

## Author

STEAV NEWS Team

## Contact

- Email: info@steavnews.com
- Phone: +855 96 392 5127
- Facebook: https://www.facebook.com/steavnews
