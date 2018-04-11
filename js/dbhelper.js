/**
 * Common database helper functions.
 */

class DBHelper {
  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}`;
  }

  static myDB(restaurants) {
    // This works on all devices/browsers, and uses IndexedDBShim as a final fallback 
    var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
    
    if (!window.indexedDB) {
        window.alert("Your browser doesn't support IndexedDB.");
    }

    // Open database
    var open = indexedDB.open("EAT_restaurant-review", 1);

    // Create table
    open.onupgradeneeded = function() {
      var db = open.result;
      db.createObjectStore("Restaurants", { keyPath: "id" });
      restaurants.forEach(function(restaurant) {
        db.createObjectStore("Reviews-" + restaurant.id, { keyPath: "id" });
      });

    };

    open.onerror = function(err) {
      console.error("IndexedDB error: " + err.target.errorCode);
    }

    open.onsuccess = function() {
      // Start a new transaction
      var db = open.result;
      var tx = db.transaction("Restaurants", "readwrite");
      var store = tx.objectStore("Restaurants");

      // Add the restaurant data
      restaurants.forEach(function(restaurant) {
        store.put(restaurant);
      });

      // Close the db when the transaction is done
      tx.oncomplete = function() {
        db.close();
      };
    }
  }

  static createIDBreviews(restaurantId, reviews) {
    // Get the compatible IndexedDB version
    var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;

    // Open (or create) the database
    var open = indexedDB.open("EAT_restaurant-review", 1);

    // Create the schema
    open.onupgradeneeded = function() {
      var db = open.result;
      db.createObjectStore("Reviews-" + restaurantId, { keyPath: "id" });
    };


    open.onerror = function(err) {
      console.error("IndexedDB error: " + err.target.errorCode);
    }

    open.onsuccess = function() {
      // Start a new transaction
      var db = open.result;
      var tx = db.transaction("Reviews-" + restaurantId, "readwrite");
      var store = tx.objectStore("Reviews-" + restaurantId);

      // Add the restaurant data
      reviews.forEach(function(review) {
        store.put(review);
      });

      // Close the db when the transaction is done
      tx.oncomplete = function() {
        db.close();
      };
    }
  }

  static getData(callback) {
    var restaurants = [];

    // This works on all devices/browsers, and uses IndexedDBShim as a final fallback 
    var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
    
    if (!window.indexedDB) {
        window.alert("Your browser doesn't support IndexedDB.");
    }

    // Open (or create) the database
    var open = indexedDB.open("EAT_restaurant-review", 1);


    open.onsuccess = function() {
      var db = open.result;
      var tx = db.transaction("Restaurants", "readwrite");
      var store = tx.objectStore("Restaurants");
      var getData = store.getAll();

      getData.onsuccess = function() {
        callback(null, getData.result);
      }
      // Close DB
      tx.oncomplete = function() {
        db.close();
      };
    }

  }

  /**
   * Fetch all restaurants.
  
  static fetchRestaurants(callback) {
    if (navigator.onLine) {
      fetch(`${DBHelper.DATABASE_URL}/restaurants`)
        .then(res => res.json())
        .then(restaurants => {
          DBHelper.myDB(restaurants); // Cache restaurants
          callback(null, restaurants);
        })
        .catch(err => {
          const error = `Request failed. Returned status of ${err.status}`;
          callback(error, null);
        })
    } else {
      console.log('Browser Offline - Using cached data!');
      DBHelper.getCachedData((error, restaurants) => {
        if (restaurants.length > 0) {
          callback(null, restaurants);
        }
      });
    }
  }
   */
    static fetchRestaurants(callback) {
    const restaurantsURL = `${DBHelper.DATABASE_URL}/restaurants`;
    fetch(restaurantsURL)
      .then(response => {
        if (response.status === 200) {
          response.json()
            .then(json => {
              callback(null, json);
            }).catch(error => {
              callback(error, null);
            });
        } else {
          callback((`Request failed. ${response.status}`), null);
        }
      }
      ).catch(error => callback(error, null));
  }

    /**
   * Fetch all reviews.
   */
  static fetchReviews(callback) {
    const url = DBHelper.DATABASE_URL + '/reviews';
    fetch(url)
      .then(res => res.json())
      .then(reviews => {
        callback(null, reviews);
      })
      .catch(err => {
        const error = `Request failed. Returned status of ${err.status}`;
        callback(error, null);
      })
  }

  /**
   * Fetch reviews by id.
   */
  static fetchReviewsByRestaurantId(id, callback) {
    const url = DBHelper.DATABASE_URL + '/reviews/?restaurant_id=' + id;
    fetch(url)
      .then(res => res.json())
      .then(reviews => {
        reviews = reviews.sort(function(a, b) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        DBHelper.createReviewsStore(id, reviews);
        callback(null, reviews);
      })
      .catch(err => {
        const error = `Request failed. Returned status of ${err.status}`;
        callback(error, null);
      })
  }

  static addRestaurantToFavorites(restaurantId, isFav, callback) {
    const url = DBHelper.DATABASE_URL + '/restaurants/' + restaurantId + '/?is_favorite=' + isFav;
    fetch(url, { method: 'put' })
      .then(res => callback(null, 1))
      .catch(err => callback(err, null));
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.id}.jpg`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP
    });
    return marker;
  }
}
