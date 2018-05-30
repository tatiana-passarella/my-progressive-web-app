
let restaurant;
var map;
document.addEventListener('DOMContentLoaded', (event) => {
  registerServiceWorker();

    const map = document.getElementById("map");
    const skip = document.getElementById("skip");
    let visible = 0;
    map.addEventListener('focus',function(){
      skip.style.setProperty("left", "0px");
      skip.focus();
      visible = 1;
    });

    skip.addEventListener("keydown", function(e) {
      if( (e.which == 9) && (visible == 1) ){
        skip.style.display = 'none';
        visible = 0;
      }
    });
});
  
/**
 * Register service worker
 */
registerServiceWorker = () => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js').then((reg) => {
                console.log('Service worker registration successful with scope: ', reg.scope);
                if (reg.installing) {
                    console.log('Service worker installing');
                } else if (reg.waiting) {
                    console.log('Service worker installed');
                } else if (reg.active) {
                    console.log('Service worker active');
                }

            }).catch((error) => {
            // registration failed
            console.log('Registration failed with ' + error);
        });
    }
}
/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      let setTitle = () => {
        const iFrameGoogleMaps = document.querySelector('#map iframe');
        iFrameGoogleMaps.setAttribute('title', 'Google Maps with restaurants markers');
      }
      map.addListener('tilesloaded', setTitle);
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}
/**
 * Get reviews from URL
 */
const fetchReviewsFromURL = (callback) => {
  if (self.reviews) { // review already fetched!
    callback(null, self.reviews)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No review id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchReviewsByRestaurantId(id, (error, reviews) => {
      self.reviews = reviews;
      if (!reviews) {
        fillReviewsHTML(null);
        return;
      }
      fillReviewsHTML();
    });
  }
}
/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const favoriteIcon = document.createElement('span');
  favoriteIcon.className = 'fav-wrap';

  const favoriteIconImg = document.createElement('img');
  if (restaurant.is_favorite === "true") {
    favoriteIconImg.alt = `${restaurant.name} is your favorite`;
    favoriteIconImg.setAttribute("src", './img/ico-fav.png');
    favoriteIconImg.className = 'fav-restaurant';
  } else {
    favoriteIconImg.alt = `${restaurant.name} is not your favorite`;
    favoriteIconImg.setAttribute("src", './img/ico-fav-o.png');
    favoriteIconImg.className = 'fav-restaurant';
  }

  favoriteIconImg.addEventListener('click', () => {
    const src = favoriteIconImg.src;
    if (src.includes('img/ico-fav-o.png')) {
      DBHelper.toggleRestaurantFavorite(restaurant.id, true, (err, res) => {
        favoriteIconImg.src = './img/ico-fav.png';
      });
    } else {
      DBHelper.toggleRestaurantFavorite(restaurant.id, false, (err, res) => {
        favoriteIconImg.src = './img/ico-fav-o.png';
      });
    }
  })

  favoriteIcon.append(favoriteIconImg);
  name.prepend(favoriteIcon);

  const address = document.getElementById('restaurant-address');
  address.innerHTML = `<b>${restaurant.address}</b>`;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img';

  const imgSrc = DBHelper.imageUrlForRestaurant(restaurant);
  const parts = imgSrc.match(/[^\.]+/);
  const imgNum = parts[0];
  const imgS = `${imgNum}_s.jpg`;
  const imgM = `${imgNum}_m.jpg`;
  const imgL = imgSrc;
  const imgSrcset = `${imgS} 500w, ${imgM} 800w, ${imgL} 1200w`;
  image.src = `${imgNum}_s.jpg`;
  image.setAttribute('srcset', imgSrcset);

  image.alt = `${restaurant.name} restaurant image`;

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
    fetchReviewsFromURL();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = `<b>${key}</b>`;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = new Date(review.updatedAt).toLocaleDateString();
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}
/**
 * Send review to server
 */
const submitReview = (review) => {
  fetch(`${DBHelper.DATABASE_URL}/reviews`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(review),
  })
  .then(res => res.json())
  .catch(err => {
    const error = `Error during send review because on ${err.status}`;
    console.log(error);
  });
}
/**
 * Prepend user review
 */
const prependReview = (review) => {
  const ul = document.getElementById('reviews-list');
  ul.prepend(createReviewHTML(review));
}
/**
 * Add restaurant review
 */
const reviewRestaurant = (restaurant = self.restaurant) => {
  const id = restaurant.id;
  const name = document.getElementById("review-name").value;
  const rating = document.getElementById("review-rating").value;
  const message = document.getElementById("review-comment").value;

  if (name != "" && message != "") {
    const review = {
      restaurant_id: id,
      name: name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      rating: rating,
      comments: message,
    }

    if (navigator.onLine) {
      submitReview(review);
      prependReview(review);
    }else{
      const offline_review = JSON.stringify(review);
      console.log(offline_review);
      DBHelper.createIDBoutbox(id, review);
      prependReview(review);
      console.log("Offline status - Review went in outbox waiting for sync")
    }
  }

  return false;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  li.setAttribute('aria-current', 'page');
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

