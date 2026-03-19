const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, 'views');
const publicDir = path.join(__dirname, 'public');
const distDir = path.join(__dirname, 'dist');

// Create dist directory
if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir);

// Copy static assets from public to dist
function copyFolderSync(from, to) {
    if (!fs.existsSync(to)) fs.mkdirSync(to);
    fs.readdirSync(from).forEach(element => {
        const fromPath = path.join(from, element);
        const toPath = path.join(to, element);
        if (fs.lstatSync(fromPath).isFile()) {
            fs.copyFileSync(fromPath, toPath);
        } else {
            copyFolderSync(fromPath, toPath);
        }
    });
}

console.log('Copying static assets...');
copyFolderSync(publicDir, distDir);

// Render EJS files to HTML
console.log('Compiling dynamic EJS views to static HTML for Netlify...');
const files = fs.readdirSync(viewsDir).filter(f => f.endsWith('.ejs'));

files.forEach(file => {
    const filename = file.replace('.ejs', '');
    const templatePath = path.join(viewsDir, file);

    // Customize page titles for SEO
    let pageTitle;
    if (filename === 'index') {
      pageTitle = 'Armora Cheats | Best Bypass & External Panels';
    } else if (filename === 'uid-bypass') {
      pageTitle = 'UID Bypass - Armora Cheats';
    } else {
      pageTitle = filename.charAt(0).toUpperCase() + filename.slice(1) + ' - Armora Cheats';
    }
    
    ejs.renderFile(templatePath, { title: pageTitle }, (err, htmlString) => {
        if (err) {
            console.error(`Error rendering ${file}:`, err);
        } else {
            fs.writeFileSync(path.join(distDir, `${filename}.html`), htmlString);
            console.log(`✅ Built ${filename}.html`);
        }
    });
});

// SAFETY: Copy deployment configs into dist for easier manual upload
console.log('\nFinalizing deployment package...');

// Netlify Support
if (fs.existsSync(path.join(__dirname, 'netlify.toml'))) {
    fs.copyFileSync(path.join(__dirname, 'netlify.toml'), path.join(distDir, 'netlify.toml'));
    console.log('✅ Prepared Netlify config');
}
const functionsDir = path.join(__dirname, 'functions');
const distFunctionsDir = path.join(distDir, 'functions');
if (fs.existsSync(functionsDir)) {
    if (!fs.existsSync(distFunctionsDir)) fs.mkdirSync(distFunctionsDir);
    fs.readdirSync(functionsDir).forEach(f => fs.copyFileSync(path.join(functionsDir, f), path.join(distFunctionsDir, f)));
    console.log('✅ Prepared Netlify Functions');
}

// Vercel Support
if (fs.existsSync(path.join(__dirname, 'vercel.json'))) {
    fs.copyFileSync(path.join(__dirname, 'vercel.json'), path.join(distDir, 'vercel.json'));
    console.log('✅ Prepared Vercel config');
}
const apiDir = path.join(__dirname, 'api');
const distApiDir = path.join(distDir, 'api');
if (fs.existsSync(apiDir)) {
    if (!fs.existsSync(distApiDir)) fs.mkdirSync(distApiDir);
    fs.readdirSync(apiDir).forEach(f => fs.copyFileSync(path.join(apiDir, f), path.join(distApiDir, f)));
    console.log('✅ Prepared Vercel API');
}

console.log('\n🎉 Build strictly prepared for deployment! You can now upload the "dist" folder.');
