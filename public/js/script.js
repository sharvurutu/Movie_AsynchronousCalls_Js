'use strict';
(function () {
    const movieListElement = document.getElementById('movie-list');
    const movieCardElement = document.getElementById('movie-card');
    const favoriteListElement = document.getElementById('favorites');
    const favoriteCardElement = favoriteListElement.querySelector('.favorite-card');
    const movieSectionHeading = document.getElementById('movie-section-heading');
    const favoriteSectionHeading = document.getElementById('fav-section-heading');

    const paginationElement = document.getElementById('pagination');
    const maxCountSpan = document.getElementById('movie-total');
    const indexToSpan = document.getElementById('index-to');
    const indexFromSpan = document.getElementById('index-from');
    const pageNextBtn = document.getElementById('page-next-btn');
    const pagePrevBtn = document.getElementById('page-prev-btn');

    movieListElement.innerText = '';
    movieCardElement.removeAttribute('id');

    favoriteListElement.innerText = '';
    favoriteCardElement.style.display = 'block';

    let _favMovies = [];
    let _displayedMovies = [];

    const moviesPerPage = 4;
    const firstPageLink = `http://localhost:3000/movies?_limit=${moviesPerPage}&_page=1`;
    let nextPageLink = undefined;
    let prevPageLink = undefined;
    let currentMovieIndex = 1;

    window.addEventListener('load', () => {
        loadMovieList(firstPageLink);
        loadFavoriteList();
    });
    pageNextBtn.addEventListener('click', () => {
        currentMovieIndex += moviesPerPage;
        loadMovieList(nextPageLink);
    });
    pagePrevBtn.addEventListener('click', () => {
        currentMovieIndex -= moviesPerPage;
        loadMovieList(prevPageLink);
    });

    const console = window.console;

    function loadMovieList(movieLink) {
        movieListElement.innerHTML = '';
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                const links = this.getResponseHeader('Link');
                maxCountSpan.innerText = this.getResponseHeader('X-Total-Count');
                parseLinks(links);
                if (this.responseText) {
                    let movieList;
                    try {
                        movieList = JSON.parse(this.responseText);
                    } catch (err) {
                        console.error('Failed to process movie list response');
                    }

                    populateMovieList(movieList);
                }
            }
        };
        xhttp.open('GET', movieLink, true);
        xhttp.send();
    }

    function parseLinks(responseHeaderLink) {
        const links = responseHeaderLink.split(',');
        nextPageLink = undefined;
        prevPageLink = undefined;
        pageNextBtn.style.display = 'none';
        pagePrevBtn.style.display = 'none';
        if (links.length) {
            links.forEach(link => {
                const linkParts = link.split(';');
                if (linkParts.length == 2) {
                    const rel = linkParts[1].split('=');
                    if (rel[0].trim() === 'rel' && rel[1] === '"next"') {
                        nextPageLink = linkParts[0].replace(/[<>\s]/g, '');
                        pageNextBtn.style.display = 'block';
                    } else if (rel[0].trim() === 'rel' && rel[1] === '"prev"') {
                        prevPageLink = linkParts[0].replace(/[<>\s]/g, '');
                        pagePrevBtn.style.display = 'block';
                    }
                }
            });
        }

    }

    function loadFavoriteList() {
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                if (this.responseText) {
                    let favoriteList;
                    try {
                        favoriteList = JSON.parse(this.responseText);
                    } catch (err) {
                        console.error('Failed to process favorite list response');
                    }

                    populateFavorites(favoriteList);
                }
            }
        };
        xhttp.open('GET', 'http://localhost:3000/favorites', true);
        xhttp.send();
    }

    function populateFavorites(favoriteList) {
        if (favoriteList && favoriteList.length) {
            if (favoriteList.length) {
                favoriteSectionHeading.style.display = 'block';
            }
            _favMovies = favoriteList;
            const movieIds = favoriteList.map(fav => `id=${fav.movieId}`);

            const xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    if (this.responseText) {
                        let movieList;
                        try {
                            movieList = JSON.parse(this.responseText);
                        } catch (err) {
                            console.error('Failed to process movie list response');
                        }

                        movieList.forEach(movie => {
                            if (movie) {
                                addMovieToFavList(movie);
                            }
                        });
                    }
                }
            };
            xhttp.open('GET', `http://localhost:3000/movies?${movieIds.join('&')}`, true);
            xhttp.send();
        }
    }

    function addToFavorite(event) {
        const movieId = event.target.getAttribute('data-movie');
        if (movieId) {
            if (_favMovies) {
                const favMovie = _favMovies.find(fav => fav.movieId == movieId);
                if (favMovie) {
                    removeFavoriteById(movieId);
                    return;
                }
            }

            const movie = _displayedMovies.find(movie => movie.id == movieId);

            const xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 201) {
                    addMovieToFavList(movie);

                    if (!_favMovies) {
                        _favMovies = [];
                    }

                    if (_favMovies.length == 0) {
                        favoriteSectionHeading.style.display = 'block';
                    }
                    _favMovies.push(JSON.parse(this.response));
                }
            };

            if (movie) {
                xhttp.open('POST', 'http://localhost:3000/favorites/', true);
                xhttp.setRequestHeader('Content-Type', 'application/json');
                xhttp.send(JSON.stringify({
                    movieId: movieId
                }));
            }
        }
    }

    function removeFavorite(event) {
        const movieId = event.target.getAttribute('data-movie');
        removeFavoriteById(movieId);
    }

    function removeFavoriteById(movieId) {
        if (movieId) {
            const favMovie = _favMovies.find(_fav => _fav.movieId == movieId);

            const xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    const favCard = document.getElementById(`fav-${movieId}`);
                    if (favCard) {
                        favCard.parentElement.removeChild(favCard);
                    }

                    const movieCard = document.getElementById(`movie-${movieId}`);
                    if (movieCard) {
                        const favIcon = movieCard.querySelector('.favorite');
                        if (favIcon) {
                            favIcon.classList.remove('fas');
                            favIcon.classList.remove('text-danger');
                            favIcon.classList.add('far');
                        }
                    }

                    if (_favMovies) {
                        const favIndex = _favMovies.findIndex(fav => fav.movieId == movieId);
                        if (favIndex >= 0) {
                            _favMovies.splice(favIndex, 1);
                        }

                        if (_favMovies.length == 0) {
                            favoriteSectionHeading.style.display = 'none';
                        }
                    }
                }
            };

            if (favMovie) {
                xhttp.open('DELETE', `http://localhost:3000/favorites/${favMovie.id}`, true);
                xhttp.send();
            }
        }
    }

    function displayTransitionEnd() {
        const element = this;
        if (element.classList.contains('zoomIn')) {
            element.classList.remove('zoomIn');
            element.classList.remove('animated');
            element.style.display = 'block';
        }
    }

    function populateMovieList(movieList) {
        if (movieList && Array.isArray(movieList)) {
            if (movieList.length) {
                movieSectionHeading.style.display = 'block';
                paginationElement.style.display = 'block';
            }
            indexFromSpan.innerText = currentMovieIndex;
            indexToSpan.innerText = currentMovieIndex + movieList.length - 1;
            _displayedMovies = movieList;
            movieList.forEach(movie => {
                const newMovieCardElement = movieCardElement.cloneNode(true);
                newMovieCardElement.setAttribute('id', `movie-${movie.id}`);
                const imgCover = newMovieCardElement.querySelector('.movie-cover');
                if (imgCover) {
                    imgCover.src = `images/${movie.poster}`;
                    imgCover.setAttribute('alt', movie.name);
                }
                const movieName = newMovieCardElement.querySelector('.movie-name');
                if (movieName) {
                    movieName.innerText = movie.name;
                }
                const releaseYear = newMovieCardElement.querySelector('.release-year');
                if (releaseYear) {
                    releaseYear.innerText = `(${movie.year})`;
                }

                const favoriteIcon = newMovieCardElement.querySelector('.favorite');
                if (favoriteIcon) {
                    favoriteIcon.setAttribute('data-movie', movie.id);
                    favoriteIcon.addEventListener('click', addToFavorite);
                    if (_favMovies && _favMovies.length) {
                        const favMovie = _favMovies.find(fav => fav.movieId == movie.id);
                        if (favMovie) {
                            favoriteIcon.classList.remove('far');
                            favoriteIcon.classList.add('fas');
                            favoriteIcon.classList.add('text-danger');
                        }
                    }
                }

                const rating = newMovieCardElement.querySelector('.rating');
                if (rating) {
                    if (movie.user_score >= 80) {
                        rating.classList.add('text-success');
                    } else if (movie.user_score >= 60) {
                        rating.classList.add('text-primary');
                    } else if (movie.user_score >= 40) {
                        rating.classList.add('text-secondary');
                    } else {
                        rating.classList.add('text-danger');
                    }
                    const ratingSpan = rating.querySelector('span');
                    if (ratingSpan) {
                        ratingSpan.innerText = movie.user_score / 10;
                    }
                }
                const releaseDate = newMovieCardElement.querySelector('.release-date');
                if (releaseDate) {
                    releaseDate.innerText = movie.release;
                }
                const movieLength = newMovieCardElement.querySelector('.movie-length');
                if (movieLength) {
                    if (movie.run_time < 60) {
                        movieLength.innerText = `${movie.run_time}m`;
                    } else {
                        movieLength.innerText = `${Math.floor(movie.run_time / 60)}h ${movie.run_time % 60}m`;
                    }
                }
                const genre = newMovieCardElement.querySelector('.genre');
                if (genre && movie.genre && Array.isArray(movie.genre)) {
                    movie.genre.forEach(movieGenre => {
                        const badgePill = document.createElement('span');
                        badgePill.className = 'badge badge-pill badge-secondary mr-1';
                        badgePill.innerText = movieGenre;
                        genre.appendChild(badgePill);
                    });
                }
                const storyLine = newMovieCardElement.querySelector('.story-line span');
                if (storyLine) {
                    let overview = movie.overview;
                    if (overview && overview.length > 250) {
                        overview = overview.substring(0, 247);
                        overview = `${overview.substring(0, overview.lastIndexOf(' '))} ...`;
                    }
                    storyLine.innerText = overview;
                }
                const director = newMovieCardElement.querySelector('.director span');
                if (director) {
                    director.innerText = movie.director;
                }
                const casts = newMovieCardElement.querySelector('.casts span');
                if (casts && movie.top_casts && Array.isArray(movie.top_casts)) {
                    casts.innerText = movie.top_casts.join(', ');
                }

                newMovieCardElement.style.display = 'block';
                newMovieCardElement.addEventListener('animationend', displayTransitionEnd);
                newMovieCardElement.addEventListener('MSAnimationEnd', displayTransitionEnd);
                newMovieCardElement.addEventListener('webkitAnimationEnd', displayTransitionEnd);
                newMovieCardElement.addEventListener('mozAnimationEnd', displayTransitionEnd);
                newMovieCardElement.addEventListener('oanimationend', displayTransitionEnd);

                movieListElement.appendChild(newMovieCardElement);
            });
        }
    }

    function addMovieToFavList(movie) {
        const newFavCardElement = favoriteCardElement.cloneNode(true);
        newFavCardElement.setAttribute('id', `fav-${movie.id}`);

        const imgCover = newFavCardElement.querySelector('.movie-cover');
        if (imgCover) {
            imgCover.src = `images/${movie.poster}`;
            imgCover.setAttribute('alt', movie.name);
        }

        const removeIcon = newFavCardElement.querySelector('.remove');
        if (removeIcon) {
            removeIcon.setAttribute('data-movie', movie.id);
            removeIcon.addEventListener('click', removeFavorite);
        }

        const movieName = newFavCardElement.querySelector('.movie-name');
        if (movieName) {
            movieName.innerText = movie.name;
        }
        const releaseYear = newFavCardElement.querySelector('.release-year');
        if (releaseYear) {
            releaseYear.innerText = `(${movie.year})`;
        }
        favoriteListElement.appendChild(newFavCardElement);

        const movieCard = document.getElementById(`movie-${movie.id}`);
        if (movieCard) {
            const favIcon = movieCard.querySelector('.favorite');
            if (favIcon) {
                favIcon.classList.remove('far');
                favIcon.classList.add('fas');
                favIcon.classList.add('text-danger');
            }
        }
    }
})();