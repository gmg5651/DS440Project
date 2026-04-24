export interface FoodSegment {
    name: string;
    quantity: number;
    originalText: string;
    /** If a volume/weight unit was stated (e.g. 'cups'), total grams for the stated quantity */
    gramsOverride?: number;
    unit?: string;
}

export interface ExtractionResult {
    segments: FoodSegment[];
    glucose: number | null;
    confidence: number;
}

/** Common volume/weight units → mL or g per 1 unit */
const UNIT_ML: Record<string, number> = {
    'cup': 240, 'cups': 240,
    'oz': 29.5, 'ounce': 29.5, 'ounces': 29.5, 'fl oz': 29.5,
    'tbsp': 14.8, 'tablespoon': 14.8, 'tablespoons': 14.8,
    'tsp': 4.9, 'teaspoon': 4.9, 'teaspoons': 4.9,
    'ml': 1, 'milliliter': 1, 'milliliters': 1,
    'l': 1000, 'liter': 1000, 'liters': 1000,
    'g': 1, 'gram': 1, 'grams': 1,
    'lb': 453.6, 'pound': 453.6, 'pounds': 453.6,
    'slice': 28, 'slices': 28,
    'piece': 100, 'pieces': 100,
};

/** Canonical unit name for display */
const UNIT_CANONICAL: Record<string, string> = {
    'cup': 'cup', 'cups': 'cup',
    'oz': 'oz', 'ounce': 'oz', 'ounces': 'oz', 'fl oz': 'oz',
    'tbsp': 'tbsp', 'tablespoon': 'tbsp', 'tablespoons': 'tbsp',
    'tsp': 'tsp', 'teaspoon': 'tsp', 'teaspoons': 'tsp',
    'ml': 'ml', 'milliliter': 'ml', 'milliliters': 'ml',
    'l': 'l', 'liter': 'l', 'liters': 'l',
    'g': 'g', 'gram': 'g', 'grams': 'g',
    'lb': 'lb', 'pound': 'lb', 'pounds': 'lb',
    'slice': 'slice', 'slices': 'slice',
    'piece': 'piece', 'pieces': 'piece',
};

const NUMBER_WORDS: Record<string, number> = {
    'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
    'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
    'half': 0.5, 'quarter': 0.25, 'third': 0.33, 'a': 1, 'an': 1,
    'fourth': 0.25, 'fourths': 0.25, 'fifth': 0.2, 'fifths': 0.2,
    'sixth': 0.166, 'sixths': 0.166, 'eighth': 0.125, 'eighths': 0.125,
};

const NUM_WORDS_LIST = '(?:one|two|three|four|five|six|seven|eight|nine|ten|a|an)';
const FRAC_WORDS_LIST = '(?:half|quarter|third|fourth|fifth|sixth|eighth)s?';

export function segmentMeal(utterance: string): ExtractionResult {
    let lower = utterance.toLowerCase().trim();
    if (!lower || lower.length < 3) return { segments: [], glucose: null, confidence: 0 };

    // 0. Extract and STRIP Glucose/Blood Sugar readings at the very start
    // This prevents phrases like "my glucose is 120" from ever being processed as food
    let glucose: number | null = null;
    const glucoseReadingPattern = /\b(?:my\s+)?(?:glucose|sugar|blood\s+sugar|level|reading|my\s+sugar)\s+(?:is|was|at|of)?\s*(\d+)\b|\b(\d+)\s*(?:mg\/dl|mgdl)\b/gi;
    
    let gMatch;
    while ((gMatch = glucoseReadingPattern.exec(lower)) !== null) {
        glucose = parseInt(gMatch[1] || gMatch[2]);
    }
    lower = lower.replace(glucoseReadingPattern, '').trim();

    // 0.1 Pre-process "point" as a decimal (e.g. "one point five" -> "1.5")
    lower = lower.replace(/\b(one|two|three|four|five|six|seven|eight|nine|ten)\s+point\s+(one|two|three|four|five|six|seven|eight|nine|ten)\b/gi, (m, p1, p2) => {
        const n1 = NUMBER_WORDS[p1.toLowerCase()] ?? 1;
        const n2 = NUMBER_WORDS[p2.toLowerCase()] ?? 0;
        return `${n1}.${n2}`;
    });

    const segments: FoodSegment[] = [];

    // 2. Clear Delimiters: split by 'and', ',', 'with'
    const delimiterPattern = /\s+and\s+|,|\s+with\s+/gi;
    let initialParts = lower.split(delimiterPattern).map(p => p.trim()).filter(p => p.length > 2);

    // 3. Pre-process "of": e.g. "3/4 of a banana" -> "3/4 banana"
    initialParts = initialParts.map(part => {
        return part.replace(new RegExp(`((?:\\d+(?:/\\d+|\\.\\d+)?|\\.\\d+)|${NUM_WORDS_LIST})\\s+of\\b\\s*(?:a|an|the)?\\s*`, 'i'), '$1 ');
    });

    // 4. Refining segments: look for numbers that aren't at the start and split there too
    // Supports compound fractions like "one fourth"
    const numberPattern = new RegExp(`(?:\\b\\d+(?:/\\d+|\\.\\d+)?|\\.\\d+)\\b|\\b${NUM_WORDS_LIST}\\b(?:\\s+${FRAC_WORDS_LIST})?|\\b${FRAC_WORDS_LIST}\\b`, 'gi');
    const finalParts: string[] = [];

    for (const part of initialParts) {
        let matches;
        let lastIndex = 0;
        const subParts: string[] = [];

        while ((matches = numberPattern.exec(part)) !== null) {
            // Special Case: Don't split on "a/an" if it follows a fraction word (e.g. "half a banana")
            const prevText = part.substring(0, matches.index).trim();
            const prevWord = prevText.split(/\s+/).pop()?.toLowerCase();
            const matchedText = matches[0].toLowerCase();
            
            if ((matchedText === 'a' || matchedText === 'an') && 
                ['half', 'quarter', 'third', 'fourth', 'fifth', 'sixth', 'eighth'].includes(prevWord || '')) {
                continue;
            }

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
        let nameOnly = cleaned;

        // 2. Aggressive Filler Stripping
        // Strips common pronouns and verbs to prevent "my glucose is" noise
        const fillerPrefixes = /^(i\s+had|i\s+ate|i've\s+had|i've\s+eaten|i\s+am\s+having|having|ate|had|my|is|was|the|this|that|sugar|glucose|level|blood|reading)(?:\s+|$)/i;
        nameOnly = nameOnly.replace(fillerPrefixes, '').trim();

        // One more pass for common connectors and health terms
        nameOnly = nameOnly.replace(/^(my|is|was|for|of|to|that|this|blood|sugar|glucose|level)(?:\s+|$)/i, '').trim();

        if (nameOnly.length < 2) continue;

        // --- Quantity Extraction & Unit Detection ---
        const numRegex = /(?:\d+(?:\/\d+|\.\d+)?|\.\d+)/;
        const unitKeys = Object.keys(UNIT_ML).join('|');
        const unitPattern = new RegExp(`^(${unitKeys})\\s+(?:of\\s+)?(.+)$`, 'i');

        const resolveUnit = (qty: number, text: string, original: string) => {
            // Clean articles from the name part here, after quantity/unit split
            const cleanedText = text.replace(/^(?:a|an|some|the)\s+/i, '').trim();
            const unitMatch = cleanedText.match(unitPattern);
            
            if (unitMatch) {
                const unitKey = unitMatch[1].toLowerCase();
                const foodName = unitMatch[2].trim().replace(/^(?:a|an|some|the)\s+/i, '');
                const mlPerUnit = UNIT_ML[unitKey] ?? 100;
                return {
                    quantity: qty,
                    name: foodName,
                    originalText: original,
                    gramsOverride: qty * mlPerUnit,
                    unit: UNIT_CANONICAL[unitKey] ?? unitKey,
                };
            }
            return {
                quantity: qty,
                name: cleanedText,
                originalText: original
            };
        };
        
        // A. Fractions: "half a banana", "one fourth cup", "a fourth of an apple"
        const compoundFracPattern = new RegExp(`^(${NUM_WORDS_LIST})\\s+(${FRAC_WORDS_LIST})\\s+(?:a\\s+|of\\s+)?(.+)`, 'i');
        const simpleFracPattern = new RegExp(`^(${FRAC_WORDS_LIST})\\s+(?:a\\s+|of\\s+)?(.+)`, 'i');
        
        const compoundMatch = nameOnly.match(compoundFracPattern);
        const simpleFracMatch = nameOnly.match(simpleFracPattern);
        const qtyMatch = nameOnly.match(new RegExp(`^(${numRegex.source})\\s+(.+)`));
        const wordMatch = nameOnly.match(new RegExp(`^(${NUM_WORDS_LIST})\\s+(.+)`, 'i'));

        if (compoundMatch) {
            const numPart = compoundMatch[1].toLowerCase();
            const fracPart = compoundMatch[2].toLowerCase();
            const qty = (NUMBER_WORDS[numPart] || 1) * (NUMBER_WORDS[fracPart] || 1);
            segments.push(resolveUnit(qty, compoundMatch[3].trim(), cleaned));
        } else if (simpleFracMatch) {
            const fracPart = simpleFracMatch[1].toLowerCase();
            segments.push(resolveUnit(NUMBER_WORDS[fracPart] || 1, simpleFracMatch[2].trim(), cleaned));
        } else if (qtyMatch) {
            const rawQty = qtyMatch[1].trim();
            let qty = 1;
            if (rawQty.includes('/')) {
                const [num, den] = rawQty.split('/').map(Number);
                qty = num / den;
            } else {
                qty = parseFloat(rawQty);
            }
            segments.push(resolveUnit(qty, qtyMatch[2].trim(), cleaned));
        } else if (wordMatch) {
            const wordQty = NUMBER_WORDS[wordMatch[1].toLowerCase()];
            segments.push(resolveUnit(wordQty, wordMatch[2].trim(), cleaned));
        } else {
            // Final fallback: just strip articles and treat as 1 unit
            segments.push({
                quantity: 1,
                name: nameOnly.replace(/^(?:a|an|some|the)\s+/i, '').trim(),
                originalText: cleaned
            });
        }
    }

    let confidence = segments.length > 0 ? 0.9 : 0.1;
    if (segments.length === 1 && segments[0].name.split(' ').length === 1) confidence = 0.3;

    return { segments, glucose, confidence };
}
