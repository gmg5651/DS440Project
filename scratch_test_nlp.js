const { segmentMeal } = require('./src/utils/nlpExtractor');

const testCases = [
    "I had an apple a bagel and two oranges",
    "apple a bagel oranges",
    "one banana and a bowl of cereal",
    "two eggs 3 slices of toast",
    "i ate a burger and fries"
];

testCases.forEach(t => {
    console.log(`Input: "${t}"`);
    const result = segmentMeal(t);
    console.log('Result:', JSON.stringify(result.segments.map(s => `${s.quantity}x ${s.name}`), null, 2));
    console.log('---');
});
