// Kairos Documentation - Search Functionality

// This would be expanded with actual search implementation
class DocumentationSearch {
  constructor() {
    this.index = null;
    this.loadSearchIndex();
  }

  async loadSearchIndex() {
    try {
      const response = await fetch('assets/search-index.json');
      this.index = await response.json();
    } catch (error) {
      console.warn('Failed to load search index:', error);
    }
  }

  search(query) {
    if (!this.index) return [];

    const results = [];
    const lowerQuery = query.toLowerCase();

    for (const item of this.index.items) {
      if (item.name.toLowerCase().includes(lowerQuery) ||
          item.description.toLowerCase().includes(lowerQuery)) {
        results.push(item);
      }
    }

    return results;
  }
}

// Initialize search
const docSearch = new DocumentationSearch();