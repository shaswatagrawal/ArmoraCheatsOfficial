const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable trust proxy to correctly identify protocol (http/https)
app.set('trust proxy', true);

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static assets from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Route for home page
app.get('/', (req, res) => {
    res.render('index');
});

// Discord Credentials
const DISCORD_CLIENT_ID = '1483970245222994093';
const DISCORD_CLIENT_SECRET = 'W_AYqboQ2ttPTAWv0dt4750Hw2uFxt1M';

const DISCORD_REDIRECT_URI = (req) => {
    // Better way to get protocol and host dynamically
    const protocol = req.protocol;
    const host = req.get('host');
    return `${protocol}://${host}/callback`;
};

// Route for Login
app.get('/login', (req, res) => {
    const redirectUri = DISCORD_REDIRECT_URI(req);
    const params = new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'identify'
    });
    res.redirect(`https://discord.com/api/oauth2/authorize?${params.toString()}`);
});

// Discord OAuth2 Callback Route
app.get('/callback', async (req, res) => {
    const { code } = req.query;
    if (!code) return res.redirect('/?error=no_code');

    try {
        // 1. Exchange Code for Access Token
        const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            body: new URLSearchParams({
                client_id: DISCORD_CLIENT_ID,
                client_secret: DISCORD_CLIENT_SECRET,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: DISCORD_REDIRECT_URI(req),
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.json();
            console.error('[Discord] Token Exchange Failed:', errorData);
            return res.redirect('/?error=auth_failed');
        }

        const tokenData = await tokenResponse.json();
        
        // 2. Fetch User Profile Info
        const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });

        if (!userResponse.ok) {
            console.error('[Discord] User Profile Fetch Failed');
            return res.redirect('/?error=profile_failed');
        }

        const userData = await userResponse.json();
        console.log(`[Discord] Authenticated user: ${userData.username}`);

        // Construct Avatar URL (Discord updated their system, handling fallback)
        let avatarUrl;
        if (userData.avatar) {
            avatarUrl = `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`;
        } else {
            // New default avatar logic: (id >> 22) % 6
            const defaultIndex = (BigInt(userData.id) >> 22n) % 6n;
            avatarUrl = `https://cdn.discordapp.com/embed/avatars/${defaultIndex}.png`;
        }

        // 3. Pass data back to Frontend
        const params = new URLSearchParams({
            login: 'success',
            user: userData.global_name || userData.username, // Use global_name if available
            avatar: avatarUrl
        });

        res.redirect(`/?${params.toString()}`);
    } catch (error) {
        console.error('[Discord] OAuth Error:', error);
        res.redirect('/?error=server_error');
    }
});

// Dynamic route handler to serve any other .ejs file
app.get('/:page', (req, res) => {
    let page = req.params.page;
    
    // Check if the requested view exists
    if (fs.existsSync(path.join(__dirname, 'views', `${page}.ejs`))) {
        res.render(page, { query: req.query });
    } else {
        res.status(404).render('index', { title: '404 - Page Not Found' }); // Fallback
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🚀 Armora Cheats FULL Node.js Backend is live:`);
    console.log(`➡️  http://localhost:${PORT}`);
    console.log(`===============================================`);
});
