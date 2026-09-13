const fs = require('fs');
const content = fs.readFileSync('C:/Users/cvbha/.gemini/antigravity-ide/brain/6320d912-a9dc-4081-8e25-ca6f2effcebe/.system_generated/steps/191/content.md', 'utf8');

// Try to find and parse the JSON
const jsonStart = content.indexOf('{"results"');
const jsonStart2 = content.indexOf('{"page"');
const start = jsonStart !== -1 ? jsonStart : jsonStart2;

if (start !== -1) {
  try {
    const json = JSON.parse(content.substring(start));
    const targets = [8, 9, 337, 350, 2, 15, 1899, 384, 531, 386, 283, 43, 528, 582, 192, 73, 300, 188];
    json.results.filter(p => targets.includes(p.provider_id)).forEach(p => {
      console.log(p.provider_id + ' | ' + p.provider_name + ' | ' + p.logo_path);
    });
  } catch(e) {
    console.log('JSON parse failed:', e.message);
    // Show raw content to diagnose
    console.log(content.substring(0, 2000));
  }
} else {
  console.log('No JSON found, showing first 3000 chars:');
  console.log(content.substring(0, 3000));
}
