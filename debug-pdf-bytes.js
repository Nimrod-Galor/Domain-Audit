/**
 * Debug PDF buffer format
 */

const bytes = [37, 80, 68, 70];
const stringRepresentation = bytes.map(b => String.fromCharCode(b)).join('');
console.log('Bytes as string:', stringRepresentation);
console.log('Bytes as hex:', bytes.map(b => b.toString(16).padStart(2, '0')).join(' '));

// Check if this matches %PDF
console.log('Expected %PDF as bytes:', ['%', 'P', 'D', 'F'].map(c => c.charCodeAt(0)));
