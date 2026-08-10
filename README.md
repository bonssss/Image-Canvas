# PromptCanvas - AI Image Discovery & Generation Studio

PromptCanvas is a modern, production-quality AI Image Discovery and Generation platform. It allows users to browse a vast collection of images in a beautiful Unsplash-style masonry grid, save favorites, create curated collections, and generate new AI images directly within the platform.

## Features

- **Explore Feed:** A responsive masonry grid showcasing community-created AI images with smooth hover effects.
- **Search & Filters:** Powerful search and filtering capabilities by category, style, color tone, aspect ratio, and sorting options.
- **AI Generation Studio:** An integrated generative AI workspace to create new images using prompts, style presets, and aspect ratios.
- **User Profiles & Portfolios:** Real user accounts, authentication, and public creator portfolios showcasing artworks, collections, and liked photos.
- **Collections:** Create and manage curated image collections.
- **Direct Downloads:** Instantly download high-resolution images.
- **Dark Mode:** Seamless light/dark mode toggle with a minimalist Unsplash-inspired solid color palette (no gradients).
- **Responsive Design:** Optimized for desktop, tablet, and mobile viewing.

## Tech Stack

### Frontend
- **Framework:** React + TypeScript + Vite
- **Styling:** Tailwind CSS (using clean, solid colors inspired by Unsplash)
- **Icons:** Lucide React
- **Routing:** React Context for State Management

### Backend
- **Framework:** Node.js + Express + TypeScript
- **Architecture:** RESTful API
- **In-Memory Store:** Custom `DatabaseStore` (simulating PostgreSQL for local development)

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/bonssss/Image-Canvas.git
   cd Image-Canvas
   ```

2. **Install Server Dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Install Client Dependencies:**
   ```bash
   cd ../client
   npm install
   ```

### Running the Application

1. **Start the Backend Server (Port 5000):**
   ```bash
   cd server
   npm run dev
   ```

2. **Start the Frontend Vite Server (Port 5173):**
   ```bash
   cd client
   npm run dev
   ```

3. **Access the Platform:**
   Open your browser and navigate to `http://localhost:5173/`

## Project Structure

```
Image-Canvas/
├── client/                 # Frontend React Application
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── components/     # Reusable UI components (Explore, Profile, Generation, etc.)
│   │   ├── context/        # React Context providers (Auth, Theme, Toast)
│   │   ├── services/       # API integration services
│   │   ├── types/          # TypeScript interface definitions
│   │   ├── utils/          # Helper utilities (e.g., download helper)
│   │   ├── App.tsx         # Main application view coordinator
│   │   └── main.tsx        # React entry point
│   ├── tailwind.config.js  # Tailwind CSS configuration
│   └── vite.config.ts      # Vite bundler configuration
│
├── server/                 # Backend Express API
│   ├── src/
│   │   ├── config/         # Environment and configuration
│   │   ├── controllers/    # Request handlers (auth, images, collections)
│   │   ├── db/             # Database connection and queries (In-memory simulation)
│   │   ├── middlewares/    # Custom Express middlewares (auth, validation, errors)
│   │   ├── routes/         # Express route definitions
│   │   ├── services/       # Business logic (AI generation mocking)
│   │   └── server.ts       # Express app initialization
│   └── tsconfig.json       # TypeScript compiler options for Node
│
└── .gitignore              # Git ignore rules
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
