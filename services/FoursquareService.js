const axios = require('axios');

class FoursquareService {
  constructor() {
    this.apiKey = process.env.FOURSQUARE_API_KEY;
    this.baseUrl = 'https://places-api.foursquare.com/places';
  }

  /**
   * Search for places using Foursquare API
   * @param {Object} params - Search parameters
   * @returns {Array} - Array of places
   */
  async searchPlaces(params) {
    const { query, location, categories, limit = 20 } = params;

    try {
      const searchParams = {
        query: query || 'restaurant',
        limit
      };

      // Add location parameter (prefer 'near' for text-based location)
      if (location) {
        searchParams.near = location;
      }

      const response = await axios.get(`${this.baseUrl}/search`, {
        headers: {
          'X-Places-Api-Version': '2025-06-17',
          'Accept': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        params: searchParams
      });

      return this.transformFoursquareData(response.data.results || []);
    } catch (error) {
      console.error('Foursquare API error:', error.response?.data || error.message);
      throw new Error('Failed to fetch places from Foursquare');
    }
  }

  /**
   * Get place details by Foursquare ID
   * @param {string} fsqId - Foursquare place ID
   * @returns {Object} - Place details
   */
  async getPlaceDetails(fsqId) {
    try {
      const response = await axios.get(`${this.baseUrl}/${fsqId}`, {
        headers: {
          'X-Places-Api-Version': '2025-06-17',
          'Accept': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return this.transformFoursquarePlace(response.data);
    } catch (error) {
      console.error('Foursquare API error:', error.response?.data || error.message);
      throw new Error('Failed to fetch place details from Foursquare');
    }
  }

  /**
   * Transform Foursquare data to our schema
   * @param {Array} places - Foursquare places
   * @returns {Array} - Transformed places
   */
  transformFoursquareData(places) {
    return places.map(place => this.transformFoursquarePlace(place));
  }

  /**
   * Transform single Foursquare place to our schema
   * @param {Object} place - Foursquare place
   * @returns {Object} - Transformed place
   */
  transformFoursquarePlace(place) {
    const category = this.mapCategory(place.categories?.[0]?.name);
    const priceRange = this.mapPriceRange(place.price);

    return {
      externalId: place.fsq_place_id,
      name: place.name,
      category,
      location: {
        address: place.location?.address || '',
        city: place.location?.locality || '',
        state: place.location?.region || '',
        zipCode: place.location?.postcode || '',
        coordinates: {
          lat: place.latitude || 0,
          lng: place.longitude || 0
        }
      },
      description: place.description || `${category} in ${place.location?.locality || 'the area'}`,
      priceRange,
      averageRating: place.rating ? place.rating / 2 : 0, // Foursquare uses 0-10, we use 0-5
      photos: place.photos?.map(p => `${p.prefix}original${p.suffix}`) || []
    };
  }

  /**
   * Map Foursquare category to our categories
   * @param {string} fsCategory - Foursquare category name
   * @returns {string} - Our category
   */
  mapCategory(fsCategory) {
    if (!fsCategory) return 'other';
    
    const categoryLower = fsCategory.toLowerCase();
    
    // Restaurant categories
    if (categoryLower.includes('restaurant') || 
        categoryLower.includes('dining') ||
        categoryLower.includes('pizzeria') ||
        categoryLower.includes('pizza') ||
        categoryLower.includes('eatery') ||
        categoryLower.includes('bistro') ||
        categoryLower.includes('grill') ||
        categoryLower.includes('diner')) {
      return 'restaurant';
    } 
    
    // Coffee shop categories
    if (categoryLower.includes('coffee') || 
        categoryLower.includes('coffee shop') ||
        categoryLower.includes('coffeehouse')) {
      return 'coffee_shop';
    } 
    
    // Cafe categories
    if (categoryLower.includes('café') || 
        categoryLower.includes('cafe') ||
        categoryLower.includes('tea room') ||
        categoryLower.includes('bakery')) {
      return 'cafe';
    } 
    
    // Bar categories
    if (categoryLower.includes('bar') || 
        categoryLower.includes('pub') || 
        categoryLower.includes('lounge') ||
        categoryLower.includes('tavern') ||
        categoryLower.includes('brewery') ||
        categoryLower.includes('wine bar')) {
      return 'bar';
    }
    
    return 'other';
  }

  /**
   * Map Foursquare price to our price range
   * @param {number} price - Foursquare price (1-4)
   * @returns {string} - Our price range
   */
  mapPriceRange(price) {
    if (!price) return '';
    
    switch (price) {
      case 1:
        return '$';
      case 2:
        return '$$';
      case 3:
      case 4:
        return '$$$';
      default:
        return '';
    }
  }
}

module.exports = new FoursquareService();
