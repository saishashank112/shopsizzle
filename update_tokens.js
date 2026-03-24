const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('client/src');
files.forEach(f => {
    let text = fs.readFileSync(f, 'utf8');
    if (text.includes("localStorage.getItem('token')")) {
        // Safe regex replacement keeping sessionStorage fallback
        let newText = text.replace(/localStorage\.getItem\('token'\)/g, "(sessionStorage.getItem('token') || localStorage.getItem('token'))");
        fs.writeFileSync(f, newText);
        console.log('Updated ' + f);
    }
});
