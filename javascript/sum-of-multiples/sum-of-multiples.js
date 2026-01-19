export const sum = (factors, limit) => {
  // Use a Set to store unique multiples
  const multiples = new Set();

  // For each factor, add its multiples to the set
  factors.forEach(factor => {
    // Skip 0 as a factor since it doesn't produce meaningful multiples
    if (factor === 0) return;

    // Find all multiples of this factor less than the limit
    for (let i = factor; i < limit; i += factor) {
      multiples.add(i);
    }
  });

  // Sum all unique multiples
  return Array.from(multiples).reduce((sum, num) => sum + num, 0);
};
