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
    'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
    'half': 0.5, 'quarter': 0.25, 'third': 0.33, 'a': 1, 'an': 1
};

export function segmentMeal(utterance: string): ExtractionResult {
    const lower = utterance.toLowerCase().trim();
    if (!lower || lower.length < 3) return { segments: [], glucose: null, confidence: 0 };

    const segments: FoodSegment[] = [];
    let glucose: number | null = null;

    // 1. Extract glucose
    const glucoseMatch = lower.match(/(?:glucose|sugar|level)\s+(?:is\s+)?(\d+)/) || lower.match(/(\d+)\s+(?:mg\/dl|mgdl)/);
    if (glucoseMatch) glucose = parseInt(glucoseMatch[1]);

    // 2. Clear Delimiters: split by 'and', ',', 'with'
    const delimiterPattern = /\s+and\s+|,|\s+with\s+/gi;
    let initialParts = lower.split(delimiterPattern).map(p => p.trim()).filter(p => p.length > 2);

    // 3. Pre-process "of": e.g. "3/4 of a banana" -> "3/4 banana"
    initialParts = initialParts.map(part => {
        return part.replace(/(\d+(?:\/\d+|\.\d+)?|one|two|three|four|five|six|seven|eight|nine|ten)\s+of\b\s*(?:a|an|the)?\s*/i, '$1 ');
    });

    // 4. Refining segments: look for numbers that aren't at the start and split there too
    // Note: We don't split on 'a' or 'an' here to avoid breaking articles
    const numberPattern = /\b(\d+(?:\/\d+|\.\d+)?|one|two|three|four|five|six|seven|eight|nine|ten)\b/gi;
    const finalParts: string[] = [];

    for (const part of initialParts) {
        let matches;
        let lastIndex = 0;
        const subParts: string[] = [];

        while ((matches = numberPattern.exec(part)) !== null) {
            if (matches.index > 0) {
                subParts.push(part.substring(lastIndex, matches.index).trim());
                lastIndex = matches.index;
            }
        }
        subParts.push(part.substring(lastIndex).trim());
        finalParts.push(...subParts.filter(p => p.length > 2));
    }

    for (const part of finalParts) {
        let cleaned = part.trim();

        // Remove glucose part
        let cleanedNoGlucose = cleaned.replace(/(?:glucose|sugar|level)\s+(?:is\s+)?\d+/, '').replace(/\d+\s+(?:mg\/dl|mgdl)/, '').trim();

        // Skip if empty or conversational filler
        const isFiller = /^(i\s+had|i\s+ate|a|an|some|the|and|with|of)$/i.test(cleanedNoGlucose);
        if (cleanedNoGlucose.length < 2 || isFiller) continue;

        const fractionMatch = cleanedNoGlucose.match(/^(?:a\s+)?(half|quarter|third)\s+(?:a\s+)?(.+)/);
        const qtyMatch = cleanedNoGlucose.match(/^(\d+(?:\/\d+|\.\d+)?)\s+(.+)/);
        const wordMatch = cleanedNoGlucose.match(/^(one|two|three|four|five|six|seven|eight|nine|ten)\s+(.+)/);

        if (fractionMatch) {
            segments.push({
                quantity: NUMBER_WORDS[fractionMatch[1]],
                name: fractionMatch[2].trim(),
                originalText: cleaned
            });
        } else if (qtyMatch) {
            const rawQty = qtyMatch[1].trim();
            let qty = 1;
            if (rawQty.includes('/')) {
                const [num, den] = rawQty.split('/').map(Number);
                qty = num / den;
            } else {
                qty = parseFloat(rawQty);
            }
            segments.push({
                quantity: qty,
                name: qtyMatch[2].trim(),
                originalText: cleaned
            });
        } else if (wordMatch) {
            segments.push({
                quantity: NUMBER_WORDS[wordMatch[1]],
                name: wordMatch[2].trim(),
                originalText: cleaned
            });
        } else {
            const articleMatch = cleanedNoGlucose.match(/^(?:a|an|some)\s+(.+)/);
            segments.push({
                quantity: 1,
                name: articleMatch ? articleMatch[1].trim() : cleanedNoGlucose,
                originalText: cleaned
            });
        }
    }

    let confidence = segments.length > 0 ? 0.9 : 0.1;
    if (segments.length === 1 && segments[0].name.split(' ').length === 1) confidence = 0.3;

    return { segments, glucose, confidence };
}
