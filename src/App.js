import {useEffect, useRef, useState} from "react";
import StarRating from "./StarRating";
import {useLocalStorageState} from "./useLocalStorageState";

const average = (arr) =>
    arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
const key = '771e66f';

export default function App() {
    const [selectedId, setSelectedId] = useState(null);
    const [movies, setMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [query, setQuery] = useState("");

    const [watched, setWatched] = useLocalStorageState([], 'watched');

    function handleMovieSelection(id) {
        setSelectedId(selectedId => selectedId === id ? null : id);
    }

    function handleCloseMovie() {
        setSelectedId(null);
    }

    function handleAddWatchedMovie(movie) {
        setWatched(watched => [...watched, movie])
    }

    function deleteWatched(id) {
        setWatched(watched => watched.filter(m => m.imdbID !== id))
    }

    useEffect(() => {
        consgit --version
        t controller = new AbortController();

        async function fetchMovies() {
            try {
                setError('');
                setIsLoading(true);

                const res = await fetch(`http://www.omdbapi.com/?apikey=${key}&s=${query}`, {signal: controller.signal});
                if (!res.ok) {
                    throw new Error('Something went wrong');
                }

                const data = await res.json();
                if (data.Response === 'False') {
                    throw new Error(data.Error);
                }
                setMovies(data.Search);
                setError('');
            } catch (e) {
                if (error.name !== 'AbortError') {
                    setError(e.message);
                }
            } finally {
                setIsLoading(false);
            }
        }

        if (query.length < 4) {
            setMovies([]);
            setError('');
            return;
        }

        handleCloseMovie();
        fetchMovies();

        return () => controller.abort();
    }, [query]);


    return (
        <>
            <NavBar query={query} setQuery={setQuery}>
                <NumResults movies={movies}/>
            </NavBar>
            <Main>
                <Box>
                    {error}
                    {isLoading && <Loader message={error}/>}
                    {!isLoading && !error && <MovieList handleMovieSelection={handleMovieSelection} movies={movies}/>}
                    {error && <ErrorMessage message={error}/>}
                </Box>
                <Box>
                    {
                        selectedId ? <SelectedMovie watched={watched} onAddWatched={handleAddWatchedMovie}
                                                    onCloseMovie={handleCloseMovie}
                                                    selectedId={selectedId}/> : <>
                            <WatchedSummary watched={watched}/>
                            <WatchedList onDelete={deleteWatched} watched={watched}/></>
                    }
                </Box>
            </Main>
        </>
    );
}

function ErrorMessage({error}) {
    return <p className="error">{error}</p>
}

function Loader() {
    return <p className="loader">Loading...</p>;
}

function Search({query, setQuery}) {
    const inputEl = useRef(null);
    useEffect(() => {
        // runs after dom loaded
        inputEl.current.focus();
    }, []);

    return <input
        ref={inputEl}
        className="search"
        type="text"
        placeholder="Search movies..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
    />;
}

function Logo() {
    return <div className="logo">
        <span role="img">🍿</span>
        <h1>usePopcorn</h1>
    </div>;
}

function NumResults({movies}) {
    return <p className="num-results">
        Found <strong>{movies.length}</strong> results
    </p>;
}


function NavBar({query, setQuery, children}) {
    return <nav className="nav-bar">
        <Logo/>
        <Search query={query} setQuery={setQuery}/>
        {children}
    </nav>
}

function Main({children}) {
    return <main className="main">
        {children}
    </main>
}

function WatchedList({watched, onDelete}) {
    return watched?.length ? <ul className="list">
        {watched.map((movie) => (
            <WatchedMovie onDelete={onDelete} key={movie.imdbID} movie={movie}/>
        ))}
    </ul> : '';
}

function WatchedMovie({movie, onDelete}) {
    return <>
        {movie && <li>
            <img src={movie.poster} alt={`${movie.title} poster`}/>
            <h3>{movie.title}</h3>
            <div>
                <p>
                    <span>⭐️</span>
                    <span>{movie.imdbRating}</span>
                </p>
                <p>
                    <span>🌟</span>
                    <span>{movie.userRating}</span>
                </p>
                <p>
                    <span>⏳</span>
                    <span>{movie.runtime} min</span>
                </p>

                <button className="btn-delete" onClick={() => onDelete(movie.imdbID)}></button>
            </div>
        </li>}
    </>;
}

function WatchedSummary({watched}) {
    const avgImdbRating = average(watched.map((movie) => movie?.imdbRating));
    const avgUserRating = average(watched.map((movie) => movie?.userRating));
    const avgRuntime = average(watched.map((movie) => movie?.runtime));

    return <div className="summary">
        <h2>Movies you watched</h2>
        <div>
            <p>
                <span>#️⃣</span>
                <span>{watched.length} movies</span>
            </p>
            <p>
                <span>⭐️</span>
                <span>{avgImdbRating}</span>
            </p>
            <p>
                <span>🌟</span>
                <span>{avgUserRating.toFixed(2)}</span>
            </p>
            <p>
                <span>⏳</span>
                <span>{avgRuntime} min</span>
            </p>
        </div>
    </div>
}

function Box({children}) {
    const [isOpen, setIsOpen] = useState(true);

    return <div className="box">
        <button
            className="btn-toggle"
            onClick={() => setIsOpen((open) => !open)}
        >
            {isOpen ? "–" : "+"}
        </button>
        {isOpen && children}
    </div>;
}

function MovieList({movies, handleMovieSelection}) {
    return <ul className="list list-movies">
        {movies?.map((movie) => (
            <Movie handleMovieSelection={handleMovieSelection} key={movie.imdbID} movie={movie}/>
        ))}
    </ul>;
}

function Movie({movie, handleMovieSelection}) {
    return <li onClick={() => handleMovieSelection(movie.imdbID)}>
        <img src={movie.Poster} alt={`${movie.Title} poster`}/>
        <h3>{movie.Title}</h3>
        <div>
            <p>
                <span>🗓</span>
                <span>{movie.Year}</span>
            </p>
        </div>
    </li>;
}

function SelectedMovie({watched, selectedId, onCloseMovie, onAddWatched}) {
    const [movie, setMovie] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [userRating, setUserRating] = useState('');
    const isWatched = watched.map(m => m.imdbID).includes(selectedId);
    const watchedUserRating = watched.find(m => m.imdbID === selectedId)?.userRating;
    const {
        Title: title,
        Year: year,
        Poster: poster,
        Runtime: runtime,
        imdbRating,
        Plot: plot,
        Released: released,
        Actors: actors,
        Director: director,
        Genre: genre
    } = movie;

    useEffect(() => {
        const cb = (e) => {
            if (e.code === 'Escape') {
                onCloseMovie();
            }
        };
        document.addEventListener('keydown', cb);

        return document.removeEventListener('keydown', cb);
    }, [onCloseMovie]);

    useEffect(() => {
        if (!title) {
            return;
        }
        document.title = `Movie | ${movie.title}`;

        return () => document.title = 'Use Popcorn';
    }, [title]);

    useEffect(() => {
        async function getMovieDetails() {
            setIsLoading(true);
            const res = await fetch(`http://www.omdbapi.com/?apikey=${key}&i=${selectedId}`);
            const data = await res.json();

            setMovie(data);
            setIsLoading(false);
        }

        getMovieDetails();
    }, [selectedId]);

    function handleAddWatched() {
        const newMovie = {
            imdbID: selectedId,
            imdbRating: +imdbRating,
            runtime: +(runtime.split('').at(0)),
            title,
            year,
            poster,
            userRating
        };
        onAddWatched(newMovie);
        onCloseMovie();
    }

    return <div className="details">
        {isLoading ? <Loader></Loader> : <>
            <header>
                <button className="btn-back" onClick={onCloseMovie}>&larr;</button>
                <img src={poster} alt="Poster"/>
                <div className="details-overview">
                    <h2>{title}</h2>
                    <p>{released} &bull; {runtime}</p>
                    <p>{genre}</p>
                    <p><span>⭐</span>{imdbRating} IMBD rating</p>

                </div>
            </header>

            <section>
                <div className="rating">
                    {!isWatched ? <StarRating onSetRatingHandler={setUserRating} maxRating={10}
                                              size={24}></StarRating> : <p>You rated this movie {watchedUserRating}
                        <span>⭐</span></p>}
                    {userRating > 0 &&
                        <button onClick={handleAddWatched} className="btn-add">Add to list</button>}
                </div>
                <p><em>{plot}</em></p>

                <p>Starring {actors}</p>
                <p>Directed by {director}</p>
            </section>
        </>}
    </div>;
}

