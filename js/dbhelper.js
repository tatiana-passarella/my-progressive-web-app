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

  static myDB(restaurants) {
    idb.open('EAT_restaurant-review', 1, function (upgradeDB) {

      upgradeDB.createObjectStore('Restaurants', {keyPath: 'id'});
      upgradeDB.createObjectStore('outbox', {keyPath: 'id', autoIncrement: true});
      // In production 10 could be replaced  a number given from Google Maps results
      for (var i = 1; i <= 10; i++) {
        upgradeDB.createObjectStore('Reviews-' + i, {keyPath: 'id'});
      }
    });

    idb.open('EAT_restaurant-review', 1).then(function (db) {
      var tx = db.transaction('Restaurants', 'readwrite');
      var store = tx.objectStore('Restaurants');
      return Promise.all(restaurants.map(function (item) {
          return store.put(item);
        })
      ).then(function (e) {
        console.log("Restaurants added");
      }).catch(function (e) {
        tx.abort();
        console.log(e);
      });
    });
  }

  static createIDBreviews(restaurantId, reviews) {
    idb.open('EAT_restaurant-review', 1).then(function (db) {
      var tx = db.transaction('Reviews-'+restaurantId, 'readwrite');
      var store = tx.objectStore('Reviews-'+restaurantId);
      return Promise.all(reviews.map(function (item) {
          return store.put(item);
        })
      ).then(function (e) {
        console.log("Reviews added");
      }).catch(function (e) {
        tx.abort();
        console.log(e);
      });
    });
  }

	static createIDBoutbox(review) {
		idb.open('EAT_restaurant-review', 1).then(function (db) {
    	var tx = db.transaction('outbox', 'readwrite');
    	var store = tx.objectStore('outbox');
    	return new Promise(function(resolve, reject) {
    		store.put(review, undefined);
    	}).then(function (e) {
    		console.log("Outbox added");
    	}).catch(function (e) {
        	tx.abort();
        	console.log(e);
    	});
    });
  }

	static getData (callback) {
		idb.open('EAT_restaurant-review', 1).then(function (db) {

	        var tx = db.transaction('Restaurants', 'readonly');
	        var store = tx.objectStore('Restaurants');
	        return store.getAll();
	    });
	}


  /**
   * Fetch all restaurants.
  */
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
      console.log('Offline state, using cache');
      DBHelper.getData((restaurants) => {
        if (restaurants.length > 0) {
          callback(null, restaurants);
        }
      });
    }
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
        DBHelper.createIDBreviews(id, reviews);
        callback(null, reviews);
      })
      .catch(err => {
        const error = `Request failed. Returned status of ${err.status}`;
        callback(error, null);
      })
  }
  
  /**
  * Toggle favorite restaurant
  */
  static toggleRestaurantFavorite(id, favorite, callback) {
    return fetch(DBHelper.DATABASE_URL + `/restaurants/${id}/?is_favorite=${favorite}`,
      { method: 'PUT' })
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
