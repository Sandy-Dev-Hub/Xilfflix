import { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import SearchOverlay from '@/components/SearchOverlay';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import NotFound from '@/components/NotFound';

// Lazy-loaded pages
const Home = lazy(() => import('@/pages/Home'));
const Movies = lazy(() => import('@/pages/Movies'));
const TVShows = lazy(() => import('@/pages/TVShows'));
const NewPopular = lazy(() => import('@/pages/NewPopular'));
const MovieDetails = lazy(() => import('@/pages/MovieDetails'));
const Watch = lazy(() => import('@/pages/Watch'));
const MyList = lazy(() => import('@/pages/MyList'));
const Profile = lazy(() => import('@/pages/Profile'));

function PageFallback() {
  return (
    <div className="pt-20">
      <LoadingSkeleton variant="hero" />
      <div className="mt-8">
        <LoadingSkeleton variant="row" count={3} />
      </div>
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-xf-bg text-xf-text">
      <ScrollToTop />
      <Navbar />
      <SearchOverlay />

      <AnimatePresence mode="wait">
        <Suspense fallback={<PageFallback />}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/tv-shows" element={<TVShows />} />
            <Route path="/new-popular" element={<NewPopular />} />
            <Route path="/movie/:id" element={<MovieDetails type="movie" />} />
            <Route path="/tv/:id" element={<MovieDetails type="tv" />} />
            <Route path="/watch/movie/:id" element={<Watch type="movie" />} />
            <Route path="/watch/tv/:id" element={<Watch type="tv" />} />
            <Route path="/my-list" element={<MyList />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </div>
  );
}
