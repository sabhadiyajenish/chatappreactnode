import { LRUCache } from "lru-cache";

// Create an LRU cache instance
const cache = new LRUCache({
  max: 500,

  // for use with tracking overall storage size
  maxSize: 5000,
  sizeCalculation: (value, key) => {
    return 1;
  },
});

export default cache;
