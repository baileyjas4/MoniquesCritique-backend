const axios = require('axios');

class YelpService {
  constructor() {
    this.apiKey = process.env.YELP_API_KEY;
    this.baseUrl = 'https://api.yelp.com/v3';
  }

  /**
   * Search for businesses using Yelp API
   * @param {Object} params - Search parameters
   * @returns {Array} - Array of places
   */
  async searchPlaces(params) {
    const { query, location, categories, limit = 20 } = params;

    try {
      const searchParams = {
        term: query || 'restaurant',
        location: location || 'Atlanta, GA',
        limit,
        sort_by: 'best_match'
      };

      // Add category filter if provided
      if (categories) {
        searchParams.categories = this.mapToYelpCategory(categories);
      }

      const response = await axios.get(`${this.baseUrl}/businesses/search`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        },
        params: searchParams
      });

      return this.transformYelpData(response.data.businesses || []);
    } catch (error) {
      console.error('Yelp API error:', error.response?.data || error.message);
      throw new Error('Failed to fetch places from Yelp');
    }
  }

  /**
   * Get business details by Yelp ID
   * @param {string} yelpId - Yelp business ID
   * @returns {Object} - Place details
   */
  async getPlaceDetails(yelpId) {
    try {
      const response = await axios.get(`${this.baseUrl}/businesses/${yelpId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        }
      });

      return this.transformYelpPlace(response.data);
    } catch (error) {
      console.error('Yelp API error:', error.response?.data || error.message);
      throw new Error('Failed to fetch place details from Yelp');
    }
  }

  /**
   * Transform Yelp data to our schema
   * @param {Array} businesses - Yelp businesses
   * @returns {Array} - Transformed places
   */
  transformYelpData(businesses) {
    return businesses.map(business => this.transformYelpPlace(business));
  }

  /**
   * Transform single Yelp business to our schema
   * @param {Object} business - Yelp business
   * @returns {Object} - Transformed place
   */
  transformYelpPlace(business) {
    const category = this.mapCategory(business.categories?.[0]?.alias);
    const priceRange = business.price || '';

    return {
      externalId: business.id,
      name: business.name,
      category,
      location: {
        address: business.location?.address1 || '',
        city: business.location?.city || '',
        state: business.location?.state || '',
        zipCode: business.location?.zip_code || '',
        coordinates: {
          lat: business.coordinates?.latitude || 0,
          lng: business.coordinates?.longitude || 0
        }
      },
      description: this.generateDescription(business),
      priceRange,
      averageRating: business.rating || 0, // Yelp uses 0-5, same as us
      phone: business.phone || business.display_phone || '',
      website: business.url || '',
      images: business.image_url ? [business.image_url] : []
    };
  }

  /**
   * Generate description from Yelp data
   * @param {Object} business - Yelp business
   * @returns {string} - Description
   */
  generateDescription(business) {
    const parts = [];
    
    // Add categories
    if (business.categories && business.categories.length > 0) {
      const categoryNames = business.categories.map(c => c.title).join(', ');
      parts.push(categoryNames);
    }
    
    // Add location
    if (business.location?.city) {
      parts.push(`in ${business.location.city}`);
    }
    
    // Add review snippet if available
    if (business.review_count > 0) {
      parts.push(`with ${business.review_count} reviews on Yelp`);
    }

    return parts.join(' ') || 'Local business';
  }

  /**
   * Map our category to Yelp category
   * @param {string} ourCategory - Our category
   * @returns {string} - Yelp category
   */
  mapToYelpCategory(ourCategory) {
    const categoryMap = {
      'restaurant': 'restaurants',
      'cafe': 'cafes',
      'coffee_shop': 'coffee',
      'bar': 'bars',
      'other': 'food'
    };
    
    return categoryMap[ourCategory] || 'restaurants';
  }

  /**
   * Map Yelp category to our categories
   * @param {string} yelpCategory - Yelp category alias
   * @returns {string} - Our category
   */
  mapCategory(yelpCategory) {
    if (!yelpCategory) return 'other';
    
    const categoryLower = yelpCategory.toLowerCase();
    
    // Restaurant categories
    if (categoryLower.includes('restaurant') || 
        categoryLower.includes('food') ||
        categoryLower.includes('pizza') ||
        categoryLower.includes('burgers') ||
        categoryLower.includes('mexican') ||
        categoryLower.includes('italian') ||
        categoryLower.includes('chinese') ||
        categoryLower.includes('japanese') ||
        categoryLower.includes('thai') ||
        categoryLower.includes('indian') ||
        categoryLower.includes('greek') ||
        categoryLower.includes('mediterranean')) {
      return 'restaurant';
    } 
    
    // Coffee shop categories
    if (categoryLower.includes('coffee') || 
        categoryLower.includes('coffeeshops')) {
      return 'coffee_shop';
    } 
    
    // Cafe categories
    if (categoryLower.includes('cafes') || 
        categoryLower.includes('cafe') ||
        categoryLower.includes('tea') ||
        categoryLower.includes('bakeries')) {
      return 'cafe';
    } 
    
    // Bar categories
    if (categoryLower.includes('bars') || 
        categoryLower.includes('pubs') || 
        categoryLower.includes('lounges') ||
        categoryLower.includes('breweries') ||
        categoryLower.includes('wine')) {
      return 'bar';
    }
    
    return 'other';
  }
}

module.exports = new YelpService();
