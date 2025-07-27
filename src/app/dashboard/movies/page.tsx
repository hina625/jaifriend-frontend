'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Play, Star, Eye, Clock, Globe } from 'lucide-react';
import Popup, { PopupState } from '@/components/Popup';
import MoviePlayer from '@/components/MoviePlayer';

interface Movie {
  _id: string;
  title: string;
  description: string;
  releaseYear: number;
  duration: number;
  genres: string[];
  country: string;
  language: string;
  director: string;
  cast: string[];
  rating: number;
  poster: string;
  trailer: string;
  videoUrl: string;
  quality: string;
  views: number;
  likes: string[];
  dislikes: string[];
  comments: any[];
  isRecommended: boolean;
  isNew: boolean;
  isPopular: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [popup, setPopup] = useState<PopupState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  const showPopup = (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => {
    setPopup({ isOpen: true, type, title, message });
  };

  const closePopup = () => {
    setPopup({ ...popup, isOpen: false });
  };

  const fetchMovies = async () => {
    try {
      setLoading(true);
      
      // Always show mock movies for immediate response
      const mockMovies = [
        {
          _id: '1',
          title: 'Avengers: Endgame',
          description: 'After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos\' actions and restore balance to the universe.',
          releaseYear: 2019,
          duration: 181,
          genres: ['Action', 'Adventure', 'Drama', 'Sci-Fi'],
          country: 'United States',
          language: 'English',
          director: 'Anthony Russo, Joe Russo',
          cast: ['Robert Downey Jr.', 'Chris Evans', 'Mark Ruffalo', 'Chris Hemsworth', 'Scarlett Johansson'],
          rating: 8.4,
          poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop',
          trailer: 'https://www.youtube.com/watch?v=TcMBFSGVi1c',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          quality: '4K Ultra HD',
          views: 2500000,
          likes: [],
          dislikes: [],
          comments: [],
          isRecommended: true,
          isNew: false,
          isPopular: true,
          tags: ['marvel', 'superhero', 'avengers', 'thanos', 'infinity stones'],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          _id: '2',
          title: 'Spider-Man: No Way Home',
          description: 'With Spider-Man\'s identity now revealed, Peter asks Doctor Strange for help. When a spell goes wrong, dangerous foes from other worlds start to appear, forcing Peter to discover what it truly means to be Spider-Man.',
          releaseYear: 2021,
          duration: 148,
          genres: ['Action', 'Adventure', 'Fantasy', 'Sci-Fi'],
          country: 'United States',
          language: 'English',
          director: 'Jon Watts',
          cast: ['Tom Holland', 'Zendaya', 'Benedict Cumberbatch', 'Willem Dafoe', 'Alfred Molina'],
          rating: 8.2,
          poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop',
          trailer: 'https://www.youtube.com/watch?v=JfVOs4VSpmA',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          quality: '4K Ultra HD',
          views: 1800000,
          likes: [],
          dislikes: [],
          comments: [],
          isRecommended: true,
          isNew: true,
          isPopular: true,
          tags: ['spiderman', 'marvel', 'multiverse', 'doctor strange', 'villains'],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          _id: '3',
          title: 'The Batman',
          description: 'In his second year of fighting crime, Batman uncovers corruption in Gotham City that connects to his own family while facing a serial killer known as the Riddler.',
          releaseYear: 2022,
          duration: 176,
          genres: ['Action', 'Crime', 'Drama', 'Mystery'],
          country: 'United States',
          language: 'English',
          director: 'Matt Reeves',
          cast: ['Robert Pattinson', 'Zoë Kravitz', 'Paul Dano', 'Jeffrey Wright', 'Colin Farrell'],
          rating: 7.8,
          poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop',
          trailer: 'https://www.youtube.com/watch?v=mqqft2x_Aa4',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
          quality: '4K Ultra HD',
          views: 900000,
          likes: [],
          dislikes: [],
          comments: [],
          isRecommended: true,
          isNew: true,
          isPopular: false,
          tags: ['batman', 'gotham', 'riddler', 'catwoman', 'detective'],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          _id: '4',
          title: 'Top Gun: Maverick',
          description: 'After thirty years, Maverick is still pushing the envelope as a top naval aviator, but must confront ghosts of his past when he leads TOP GUN\'s elite graduates on a mission that demands the ultimate sacrifice.',
          releaseYear: 2022,
          duration: 130,
          genres: ['Action', 'Drama'],
          country: 'United States',
          language: 'English',
          director: 'Joseph Kosinski',
          cast: ['Tom Cruise', 'Miles Teller', 'Jennifer Connelly', 'Jon Hamm', 'Glen Powell'],
          rating: 8.3,
          poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop',
          trailer: 'https://www.youtube.com/watch?v=giXco2jaZ_4',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
          quality: '4K Ultra HD',
          views: 1600000,
          likes: [],
          dislikes: [],
          comments: [],
          isRecommended: true,
          isNew: true,
          isPopular: true,
          tags: ['top gun', 'fighter jets', 'navy', 'maverick', 'action'],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          _id: '5',
          title: 'Dune',
          description: 'Feature adaptation of Frank Herbert\'s science fiction novel about the son of a noble family entrusted with the protection of the most valuable asset and most vital element in the galaxy.',
          releaseYear: 2021,
          duration: 155,
          genres: ['Adventure', 'Drama', 'Sci-Fi'],
          country: 'United States',
          language: 'English',
          director: 'Denis Villeneuve',
          cast: ['Timothée Chalamet', 'Rebecca Ferguson', 'Oscar Isaac', 'Jason Momoa', 'Zendaya'],
          rating: 8.0,
          poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop',
          trailer: 'https://www.youtube.com/watch?v=n9xhJrPXop4',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
          quality: '4K Ultra HD',
          views: 800000,
          likes: [],
          dislikes: [],
          comments: [],
          isRecommended: true,
          isNew: false,
          isPopular: false,
          tags: ['dune', 'sci-fi', 'arrakis', 'spice', 'frank herbert'],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          _id: '6',
          title: 'Parasite',
          description: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
          releaseYear: 2019,
          duration: 132,
          genres: ['Comedy', 'Drama', 'Thriller'],
          country: 'South Korea',
          language: 'Korean',
          director: 'Bong Joon-ho',
          cast: ['Song Kang-ho', 'Lee Sun-kyun', 'Cho Yeo-jeong', 'Choi Woo-shik', 'Park So-dam'],
          rating: 8.6,
          poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop',
          trailer: 'https://www.youtube.com/watch?v=5xH0HfJHsaY',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMobsters.mp4',
          quality: '4K Ultra HD',
          views: 800000,
          likes: [],
          dislikes: [],
          comments: [],
          isRecommended: true,
          isNew: false,
          isPopular: false,
          tags: ['social commentary', 'class struggle', 'dark comedy', 'korean cinema'],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          _id: '7',
          title: 'Demon Slayer: Mugen Train',
          description: 'After a string of mysterious disappearances begin to plague a train, the Demon Slayer Corps\' multiple attempts to remedy the problem prove fruitless.',
          releaseYear: 2020,
          duration: 117,
          genres: ['Animation', 'Action', 'Adventure', 'Fantasy'],
          country: 'Japan',
          language: 'Japanese',
          director: 'Haruo Sotozaki',
          cast: ['Natsuki Hanae', 'Akari Kitō', 'Hiro Shimono', 'Yoshitsugu Matsuoka'],
          rating: 8.2,
          poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop',
          trailer: 'https://www.youtube.com/watch?v=ATJYac_dORw',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          quality: '4K Ultra HD',
          views: 600000,
          likes: [],
          dislikes: [],
          comments: [],
          isRecommended: true,
          isNew: false,
          isPopular: false,
          tags: ['anime', 'demon slayer', 'japanese animation', 'action'],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ];
      
      // Filter movies based on selected filters
      let filteredMovies = mockMovies;
      
      if (selectedGenres.length > 0) {
        filteredMovies = filteredMovies.filter(movie => 
          movie.genres.some(genre => selectedGenres.includes(genre))
        );
      }
      
      if (selectedCountries.length > 0) {
        filteredMovies = filteredMovies.filter(movie => 
          selectedCountries.includes(movie.country)
        );
      }
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredMovies = filteredMovies.filter(movie =>
          movie.title.toLowerCase().includes(query) ||
          movie.description.toLowerCase().includes(query) ||
          movie.director.toLowerCase().includes(query) ||
          movie.cast.some(actor => actor.toLowerCase().includes(query))
        );
      }
      
      setMovies(filteredMovies);
      console.log('Movies loaded:', filteredMovies.length);
      
    } catch (error) {
      console.error('Error loading movies:', error);
      showPopup('error', 'Error', 'Failed to load movies');
    } finally {
      setLoading(false);
    }
  };

  const fetchMoviesByTab = async (tab: string) => {
    try {
      setLoading(true);
      let url = 'http://localhost:5000/api/movies';
      
      switch (tab) {
        case 'Recommended':
          url += '/recommended';
          break;
        case 'New':
          url += '/new';
          break;
        case 'Popular':
          url += '/popular';
          break;
        default:
          // All movies - use existing fetchMovies logic
          break;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        setMovies(data.movies || data);
      } else {
        showPopup('error', 'Error', `Failed to fetch ${tab} movies`);
      }
    } catch (error) {
      showPopup('error', 'Network Error', 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'All') {
      fetchMovies();
    } else {
      fetchMoviesByTab(activeTab);
    }
  }, [activeTab, selectedGenres, selectedCountries, searchQuery]);

  const clearFilters = () => {
    setSelectedGenres([]);
    setSelectedCountries([]);
    setSearchQuery('');
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsPlayerOpen(true);
  };

  const closePlayer = () => {
    setIsPlayerOpen(false);
    setSelectedMovie(null);
  };

  const genres = ['Action', 'Adventure', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller'];
  const countries = ['United States', 'United Kingdom', 'India', 'South Korea', 'Japan', 'France', 'Germany'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">🎬 Movies</h1>
              <p className="text-gray-600 text-lg">Watch the latest blockbusters and TV shows</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
                  placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-3 border border-gray-300 bg-white text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 placeholder-gray-500"
            />
          </div>

              <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {['All', 'Recommended', 'New', 'Popular'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-6 px-1 border-b-2 font-semibold text-sm transition-all duration-200 ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap gap-4">
            {/* Genre filters */}
            <div className="flex items-center space-x-3">
              <span className="text-sm font-semibold text-gray-700">Genres:</span>
              {genres.map((genre) => (
                    <button
                      key={genre}
                  onClick={() => {
                    if (selectedGenres.includes(genre)) {
                      setSelectedGenres(selectedGenres.filter(g => g !== genre));
                    } else {
                      setSelectedGenres([...selectedGenres, genre]);
                    }
                  }}
                  className={`px-4 py-2 text-sm rounded-full transition-all duration-200 ${
                        selectedGenres.includes(genre)
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
            </div>

            {/* Country filters */}
            <div className="flex items-center space-x-3">
              <span className="text-sm font-semibold text-gray-700">Countries:</span>
              {countries.map((country) => (
                    <button
                      key={country}
                  onClick={() => {
                    if (selectedCountries.includes(country)) {
                      setSelectedCountries(selectedCountries.filter(c => c !== country));
                    } else {
                      setSelectedCountries([...selectedCountries, country]);
                    }
                  }}
                  className={`px-4 py-2 text-sm rounded-full transition-all duration-200 ${
                        selectedCountries.includes(country)
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                      }`}
                    >
                      {country}
                    </button>
                  ))}
            </div>

            {/* Clear filters */}
            {(selectedGenres.length > 0 || selectedCountries.length > 0) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm bg-red-100 text-red-800 rounded-full hover:bg-red-200 transition-all duration-200 border border-red-300"
              >
                Clear Filters
              </button>
            )}
          </div>
          </div>
        </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Browse All Movies Button - Only show if no movies are loaded */}
        {movies.length === 0 && (
          <div className="mb-12 text-center">
                  <button
              onClick={() => {
                clearFilters();
                setActiveTab('All');
                // Immediately show movies without waiting for API
                const mockMovies = [
                  {
                    _id: '1',
                    title: 'Avengers: Endgame',
                    description: 'After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos\' actions and restore balance to the universe.',
                    releaseYear: 2019,
                    duration: 181,
                    genres: ['Action', 'Adventure', 'Drama', 'Sci-Fi'],
                    country: 'United States',
                    language: 'English',
                    director: 'Anthony Russo, Joe Russo',
                    cast: ['Robert Downey Jr.', 'Chris Evans', 'Mark Ruffalo', 'Chris Hemsworth', 'Scarlett Johansson'],
                    rating: 8.4,
                    poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop',
                    trailer: 'https://www.youtube.com/watch?v=TcMBFSGVi1c',
                    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                    quality: '4K Ultra HD',
                    views: 2500000,
                    likes: [],
                    dislikes: [],
                    comments: [],
                    isRecommended: true,
                    isNew: false,
                    isPopular: true,
                    tags: ['marvel', 'superhero', 'avengers', 'thanos', 'infinity stones'],
                    createdAt: '2024-01-01T00:00:00Z',
                    updatedAt: '2024-01-01T00:00:00Z'
                  },
                  {
                    _id: '2',
                    title: 'Spider-Man: No Way Home',
                    description: 'With Spider-Man\'s identity now revealed, Peter asks Doctor Strange for help. When a spell goes wrong, dangerous foes from other worlds start to appear, forcing Peter to discover what it truly means to be Spider-Man.',
                    releaseYear: 2021,
                    duration: 148,
                    genres: ['Action', 'Adventure', 'Fantasy', 'Sci-Fi'],
                    country: 'United States',
                    language: 'English',
                    director: 'Jon Watts',
                    cast: ['Tom Holland', 'Zendaya', 'Benedict Cumberbatch', 'Willem Dafoe', 'Alfred Molina'],
                    rating: 8.2,
                    poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop',
                    trailer: 'https://www.youtube.com/watch?v=JfVOs4VSpmA',
                    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                    quality: '4K Ultra HD',
                    views: 1800000,
                    likes: [],
                    dislikes: [],
                    comments: [],
                    isRecommended: true,
                    isNew: true,
                    isPopular: true,
                    tags: ['spiderman', 'marvel', 'multiverse', 'doctor strange', 'villains'],
                    createdAt: '2024-01-01T00:00:00Z',
                    updatedAt: '2024-01-01T00:00:00Z'
                  },
                  {
                    _id: '3',
                    title: 'The Batman',
                    description: 'In his second year of fighting crime, Batman uncovers corruption in Gotham City that connects to his own family while facing a serial killer known as the Riddler.',
                    releaseYear: 2022,
                    duration: 176,
                    genres: ['Action', 'Crime', 'Drama', 'Mystery'],
                    country: 'United States',
                    language: 'English',
                    director: 'Matt Reeves',
                    cast: ['Robert Pattinson', 'Zoë Kravitz', 'Paul Dano', 'Jeffrey Wright', 'Colin Farrell'],
                    rating: 7.8,
                    poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop',
                    trailer: 'https://www.youtube.com/watch?v=mqqft2x_Aa4',
                    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
                    quality: '4K Ultra HD',
                    views: 900000,
                    likes: [],
                    dislikes: [],
                    comments: [],
                    isRecommended: true,
                    isNew: true,
                    isPopular: false,
                    tags: ['batman', 'gotham', 'riddler', 'catwoman', 'detective'],
                    createdAt: '2024-01-01T00:00:00Z',
                    updatedAt: '2024-01-01T00:00:00Z'
                  },
                  {
                    _id: '4',
                    title: 'Top Gun: Maverick',
                    description: 'After thirty years, Maverick is still pushing the envelope as a top naval aviator, but must confront ghosts of his past when he leads TOP GUN\'s elite graduates on a mission that demands the ultimate sacrifice.',
                    releaseYear: 2022,
                    duration: 130,
                    genres: ['Action', 'Drama'],
                    country: 'United States',
                    language: 'English',
                    director: 'Joseph Kosinski',
                    cast: ['Tom Cruise', 'Miles Teller', 'Jennifer Connelly', 'Jon Hamm', 'Glen Powell'],
                    rating: 8.3,
                    poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop',
                    trailer: 'https://www.youtube.com/watch?v=giXco2jaZ_4',
                    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
                    quality: '4K Ultra HD',
                    views: 1600000,
                    likes: [],
                    dislikes: [],
                    comments: [],
                    isRecommended: true,
                    isNew: true,
                    isPopular: true,
                    tags: ['top gun', 'fighter jets', 'navy', 'maverick', 'action'],
                    createdAt: '2024-01-01T00:00:00Z',
                    updatedAt: '2024-01-01T00:00:00Z'
                  },
                  {
                    _id: '5',
                    title: 'Dune',
                    description: 'Feature adaptation of Frank Herbert\'s science fiction novel about the son of a noble family entrusted with the protection of the most valuable asset and most vital element in the galaxy.',
                    releaseYear: 2021,
                    duration: 155,
                    genres: ['Adventure', 'Drama', 'Sci-Fi'],
                    country: 'United States',
                    language: 'English',
                    director: 'Denis Villeneuve',
                    cast: ['Timothée Chalamet', 'Rebecca Ferguson', 'Oscar Isaac', 'Jason Momoa', 'Zendaya'],
                    rating: 8.0,
                    poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop',
                    trailer: 'https://www.youtube.com/watch?v=n9xhJrPXop4',
                    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
                    quality: '4K Ultra HD',
                    views: 800000,
                    likes: [],
                    dislikes: [],
                    comments: [],
                    isRecommended: true,
                    isNew: false,
                    isPopular: false,
                    tags: ['dune', 'sci-fi', 'arrakis', 'spice', 'frank herbert'],
                    createdAt: '2024-01-01T00:00:00Z',
                    updatedAt: '2024-01-01T00:00:00Z'
                  }
                ];
                setMovies(mockMovies);
                showPopup('success', 'Movies Loaded!', 'Browse all available movies');
              }}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105"
            >
              <Play className="w-6 h-6 mr-3" />
              Browse All Movies
                  </button>
                  </div>
                )}

        {/* Movies Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
              </div>
        ) : movies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {movies.map((movie) => (
              <div
                key={movie._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer group transform hover:scale-105 border border-gray-200"
                onClick={() => handleMovieClick(movie)}
              >
                {/* Movie Poster */}
                <div className="relative aspect-[2/3] rounded-t-2xl overflow-hidden">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMovieClick(movie);
                      }}
                      className="w-16 h-16 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-2xl transform scale-75 group-hover:scale-100 transition-all duration-300"
                    >
                      <Play className="w-8 h-8 text-gray-800 ml-1" />
                    </button>
                  </div>

                  {/* Quality Badge */}
                  <div className="absolute top-3 right-3 bg-black/80 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                    {movie.quality}
                  </div>

                  {/* New Badge */}
                  {movie.isNew && (
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                      NEW
                    </div>
                  )}

                  {/* Rating Badge */}
                  <div className="absolute bottom-3 left-3 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-bold flex items-center">
                    <Star className="w-3 h-3 fill-current mr-1" />
                    {movie.rating}
                  </div>
                </div>

                {/* Movie Info */}
                <div className="p-6">
                  <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors text-lg">
                    {movie.title}
                  </h3>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <span className="bg-gray-100 px-2 py-1 rounded">{movie.releaseYear}</span>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDuration(movie.duration)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-1 text-gray-600">
                      <Globe className="w-4 h-4" />
                      <span className="text-sm">{movie.country}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-600">
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">
                        {(movie.views / 1000).toFixed(1)}K
                      </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                    {movie.genres.slice(0, 2).map((genre: string, index: number) => (
                  <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-gray-200 transition-colors"
                  >
                    {genre}
                  </span>
                ))}
                    {movie.genres.length > 2 && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        +{movie.genres.length - 2}
                  </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-32 h-32 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center border-4 border-gray-200">
              <Play className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No movies found</h3>
            <p className="text-gray-600 mb-8 text-lg">Click "Browse All Movies" to see available movies</p>
          </div>
        )}
      </div>

      {/* Popup */}
      <Popup popup={popup} onClose={closePopup} />

      {/* Movie Player */}
      {selectedMovie && (
        <MoviePlayer
          movie={selectedMovie}
          isOpen={isPlayerOpen}
          onClose={closePlayer}
        />
      )}
    </div>
  );
}