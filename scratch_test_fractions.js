const { segmentMeal } = require('./src/utils/nlpExtractor');

const testCases = [
    "one fourth cup of milk",
    "three quarters of an apple",
    "two thirds of a pizza slice",
    "half a banana",
    "1.5 cups of juice"
];

testCases.forEach(t => {
    console.log(`Input: "${t}"`);
    const result = segmentMeal(t);
    console.log('Result:', JSON.stringify(result.segments.map(s => `${s.quantity}x ${s.name} (Unit: ${s.unit || 'N/A'})`), null, 2));
    console.log('---');
});
