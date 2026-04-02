/**
 * Simple similarity scoring using a combined Jaccard and subset match.
 * Optimized for short food names.
 */
export function calculateSimilarity(s1: string, s2: string): number {
    const str1 = s1.toLowerCase().trim();
    const str2 = s2.toLowerCase().trim();

    if (str1 === str2) return 1.0;
    if (str1.includes(str2) || str2.includes(str1)) return 0.8;

    const words1 = new Set(str1.split(/\s+/));
    const words2 = new Set(str2.split(/\s+/));

    let intersection = 0;
    for (const word of words1) {
        if (words2.has(word)) intersection++;
    }

    const union = new Set([...words1, ...words2]).size;
    return intersection / union;
}
