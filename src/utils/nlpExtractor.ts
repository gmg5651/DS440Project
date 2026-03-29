export interface FoodSegment {
    name: string;
    quantity: number;
    originalText: string;
}

export interface ExtractionResult {
    segments: FoodSegment[];
    glucose: number | null;
    confidence: number;
}

const NUMBER_WORDS: Record<string, number> = {
    'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
    'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10
};

export function segmentMeal(utterance: string): ExtractionResult {
    const lower = utterance.toLowerCase().trim();
    if (!lower || lower.length < 3) return { segments: [], glucose: null, confidence: 0 };

    const segments: FoodSegment[] = [];
    let glucose: number | null = null;

    // 1. Extract glucose
    const glucoseMatch = lower.match(/(?:glucose|sugar|level)\s+(?:is\s+)?(\d+)/) || lower.match(/(\d+)\s+(?:mg\/dl|mgdl)/);
    if (glucoseMatch) glucose = parseInt(glucoseMatch[1]);

    // 2. Advanced Segmentation: split by number words AND delimiters
    // Pattern matches numbers/quantities as potential new segment starts
    // e.g. "three tacos one tomato" -> ["three tacos", "one tomato"]
    const numberPattern = '\\b(?:\\d+|one|two|three|four|five|six|seven|eight|nine|ten|a|an|some)\\b';
    const splitRegex = new RegExp(`(?=${numberPattern}\\s+)|\\s+and\\s+|,|\\s+with\\s+`, 'g');

    const parts = lower.split(splitRegex).filter(p => p.trim().length > 2);

    for (const part of parts) {
        let cleaned = part.trim();
        if (cleaned.startsWith('i ate') || cleaned.startsWith('i had')) {
            cleaned = cleaned.replace(/i\s+(?:ate|had)\s+/, '').trim();
        }

        // Remove glucose part
        cleaned = cleaned.replace(/(?:glucose|sugar|level)\s+(?:is\s+)?\d+/, '').trim();
        cleaned = cleaned.replace(/\d+\s+(?:mg\/dl|mgdl)/, '').trim();

        // Skip if empty or just conversational filler
        if (cleaned.length < 2 || cleaned === 'i had' || cleaned === 'i ate') continue;

        const qtyMatch = cleaned.match(/^(\d+)\s+(.+)/);
        const wordMatch = cleaned.match(/^(one|two|three|four|five|six|seven|eight|nine|ten)\s+(.+)/);

        if (qtyMatch) {
            segments.push({
                quantity: parseInt(qtyMatch[1]),
                name: qtyMatch[2].trim(),
                originalText: cleaned
            });
        } else if (wordMatch) {
            segments.push({
                quantity: NUMBER_WORDS[wordMatch[1] as string],
                name: wordMatch[2].trim(),
                originalText: cleaned
            });
        } else {
            const articleMatch = cleaned.match(/^(?:a|an|some)\s+(.+)/);
            segments.push({
                quantity: 1,
                name: articleMatch ? articleMatch[1].trim() : cleaned,
                originalText: cleaned
            });
        }
    }

    let confidence = segments.length > 0 ? 0.9 : 0.1;
    if (segments.length === 1 && segments[0].name.split(' ').length === 1) confidence = 0.3;

    return { segments, glucose, confidence };
}
