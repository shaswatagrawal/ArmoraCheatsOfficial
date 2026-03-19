const DISCORD_CLIENT_ID = '1483970245222994093';
const DISCORD_CLIENT_SECRET = 'W_AYqboQ2ttPTAWv0dt4750Hw2uFxt1M';

exports.handler = async (event, context) => {
    const code = event.queryStringParameters.code;
    const protocol = event.headers['x-forwarded-proto'] || 'https';
    const host = event.headers.host;
    const redirectUri = `${protocol}://${host}/callback`;

    if (!code) {
        return {
            statusCode: 302,
            headers: { Location: '/?error=no_code' }
        };
    }

    try {
        // 1. Exchange code for token
        const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            body: new URLSearchParams({
                client_id: DISCORD_CLIENT_ID,
                client_secret: DISCORD_CLIENT_SECRET,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirectUri,
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        if (!tokenResponse.ok) {
            return {
                statusCode: 302,
                headers: { Location: '/?error=auth_failed' }
            };
        }

        const tokenData = await tokenResponse.json();

        // 2. Fetch User Profile
        const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });

        if (!userResponse.ok) {
            return {
                statusCode: 302,
                headers: { Location: '/?error=profile_failed' }
            };
        }

        const userData = await userResponse.json();
        
        // 3. Construct Avatar URL
        let avatarUrl;
        if (userData.avatar) {
            avatarUrl = `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`;
        } else {
            const defaultIndex = (BigInt(userData.id) >> 22n) % 6n;
            avatarUrl = `https://cdn.discordapp.com/embed/avatars/${defaultIndex}.png`;
        }

        // 4. Redirect back to home with data
        const params = new URLSearchParams({
            login: 'success',
            user: userData.global_name || userData.username,
            avatar: avatarUrl
        });

        return {
            statusCode: 302,
            headers: {
                Location: `/?${params.toString()}`
            }
        };

    } catch (error) {
        console.error('Auth Error:', error);
        return {
            statusCode: 302,
            headers: { Location: '/?error=server_error' }
        };
    }
};
