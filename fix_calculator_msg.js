const fs = require('fs');

let content = fs.readFileSync('src/pages/ResinCalculator.js', 'utf8');

// Fix the alert message for orders
content = content.replace(
  'alert("✅ Resin produced and order completed!\\nCheck Produced Resins → History to see the dispatched entry.");',
  'alert("✅ Resin produced successfully!\\nCheck Produced Resins → Active Orders to proceed/complete/dispatch.");'
);

fs.writeFileSync('src/pages/ResinCalculator.js', content, 'utf8');
console.log('✅ Updated ResinCalculator message');
