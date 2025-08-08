import { JSDOM } from 'jsdom';

// Create a simple JSDOM instance like the crawler does
const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Test Page</title>
</head>
<body>
    <h1>Test Content</h1>
    <p>This is a test paragraph.</p>
</body>
</html>
`;

const dom = new JSDOM(html);

console.log('DOM object type:', typeof dom);
console.log('DOM has window:', !!dom.window);
console.log('DOM window has document:', !!(dom.window && dom.window.document));
console.log('DOM window document type:', typeof (dom.window && dom.window.document));

// Test if document methods work
const document = dom.window.document;
console.log('Document querySelector method:', typeof document.querySelector);
console.log('Document querySelectorAll method:', typeof document.querySelectorAll);

// Test the querySelector methods
try {
    const titleElement = document.querySelector('title');
    console.log('Title element found:', !!titleElement);
    console.log('Title content:', titleElement ? titleElement.textContent : 'null');
    
    const paragraphs = document.querySelectorAll('p');
    console.log('Paragraphs found:', paragraphs.length);
} catch (error) {
    console.error('Error using document methods:', error.message);
}

// Now test what happens when we try to use the DOM object directly
console.log('\nTesting DOM object directly:');
console.log('DOM querySelector method:', typeof dom.querySelector);
console.log('DOM querySelectorAll method:', typeof dom.querySelectorAll);

try {
    const titleElement = dom.querySelector('title');
    console.log('DOM direct querySelector worked:', !!titleElement);
} catch (error) {
    console.error('Error using DOM methods directly:', error.message);
}
