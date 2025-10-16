# Steam Custom Node for n8n

Custom n8n node for accessing Steam Web API with polling trigger.

[![npm version](https://img.shields.io/npm/v/n8n-nodes-steam-client.svg)](https://www.npmjs.com/package/n8n-nodes-steam-client)
[![npm downloads](https://img.shields.io/npm/dm/n8n-nodes-steam-client.svg)](https://www.npmjs.com/package/n8n-nodes-steam-client)
[![GitHub stars](https://img.shields.io/github/stars/Asyasyarif/steam-client-n8n)](https://github.com/Asyasyarif/steam-client-n8n)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Note**: This is a custom node for n8n. Make sure you have n8n installed and configured before using this node.

## Features

### **Actions Available:**

- **User Stats** - Complete Steam user information
- **Friend List** - Steam friends list
- **Recent Games** - Games played in the last 2 weeks

### **Returned Data:**

#### **User Stats:**

```json
{
  "personaname": "Username",
  "steamid": "76561198...",
  "profileurl": "https://steamcommunity.com/...",
  "avatar": "https://avatars.steamstatic.com/...",
  "status": "Online",
  "playingGame": "Counter-Strike 2",
  "gameDetails": {
    "gameName": "Counter-Strike 2",
    "gameId": "730",
    "richPresence": "Competitive Match"
  },
  "totalGames": 150,
  "topPlayingGames": [
    {
      "name": "Counter-Strike 2",
      "playtime": "150h 30m"
    }
  ],
  "realname": "Real Name",
  "primaryClanId": "103582791429521412",
  "communityVisibilityState": 3,
  "commentPermission": 1,
  "country": "ID",
  "state": "Not set",
  "city": "Not set",
  "accountCreated": "2013-09-15T00:02:55.000Z",
  "lastLogoff": "2025-01-12T15:24:10.000Z",
  "timestamp": "2025-01-13T10:30:00.000Z"
}
```

#### **Friend List:**

```json
{
  "action": "friendList",
  "totalFriends": 25,
  "friends": [
    {
      "steamid": "76561198...",
      "relationship": "friend",
      "friendSince": "2020-01-15T00:00:00.000Z"
    }
  ],
  "timestamp": "2025-01-13T10:30:00.000Z"
}
```

#### **Recent Games:**

```json
{
  "action": "recentGames",
  "totalRecentGames": 5,
  "recentGames": [
    {
      "name": "Counter-Strike 2",
      "appid": 730,
      "playtime2weeks": "15h 30m",
      "playtimeForever": "150h 30m"
    }
  ],
  "timestamp": "2025-01-13T10:30:00.000Z"
}
```

## Configuration

### **Node Parameters:**

1. **Steam API Key** (Required)

   - Get from: https://steamcommunity.com/dev/apikey
   - Type: Password field

2. **Steam ID** (Required)

   - Steam ID or Profile URL
   - Example: `765611981073xxxx` or `https://steamcommunity.com/id/username`

3. **Action** (Required)
   - `User Stats` - Complete user information
   - `Friend List` - Friends list (requires API key same as Steam ID)
   - `Recent Games` - Recent games (requires API key same as Steam ID)

### **Poll Settings:**

- **Mode**: Every Minute, Every 5 Minutes, Every 10 Minutes, Every 30 Minutes, Every Hour, Custom
- **Custom Interval**: Minimum 10 seconds

## Installation

### **Prerequisites:**

- n8n installed and running
- Steam Web API Key ([Get one here](https://steamcommunity.com/dev/apikey))

### **Installation Steps:**

#### **Method 1: NPM Package (Recommended)**

```bash
# Install via npm
npm install n8n-nodes-steam-client
```

#### **Method 2: From Source**

```bash
# Clone repository
git clone https://github.com/Asyasyarif/steam-client-n8n.git
cd steam-client-n8n

# Install dependencies
npm install

# Build the node
npm run build
```

### **Verify Installation:**

1. Open n8n interface
2. Go to **Settings** → **Community Nodes**
3. Look for **Steam Client** in **Trigger** category
4. Node should appear with Steam icon

## Usage

### **Step 1: Setup Credentials**

1. Go to **Credentials** in n8n
2. Click **Create New**
3. Select **Steam API Key**
4. Enter your Steam Web API Key
5. **Save** credentials

### **Step 2: Create Workflow**

1. Create new workflow
2. Add **Steam Client** node (from Trigger category)
3. Configure node:
   - **Credentials**: Select your Steam API Key
   - **Steam ID**: Enter target Steam ID
   - **Action**: Choose desired action
4. Set **Poll Times** in workflow settings
5. **Activate** workflow

### **Example Workflows:**

#### **Basic User Monitoring:**

```
Steam Client (User Stats) → Slack/Email Notification
```

#### **Game Activity Tracking:**

```
Steam Client (Recent Games) → Database → Analytics Dashboard
```

#### **Friend Activity Monitor:**

```
Steam Client (Friend List) → Webhook → Discord Bot
```

### **Advanced Configuration:**

- **Polling Interval**: Set based on your needs (minimum 1 minute recommended)
- **Error Handling**: Add error handling nodes for API failures
- **Data Processing**: Use n8n's data transformation nodes for custom formatting

## Important Notes

### **Privacy Restrictions:**

- **Friend List** and **Recent Games** require API key **same** as Steam ID being queried
- If querying other people's Steam ID, data will be empty due to privacy settings
- Ensure target Steam ID has profile visibility set to "Public"

### **API Limits:**

- Steam Web API has rate limits
- Use reasonable polling interval (minimum 1 minute)
- Monitor usage in Steam API key dashboard

## Troubleshooting

### **"No node to start workflow":**

- Ensure node is built and restart n8n
- Check n8n logs for any errors

### **"Friend List/Recent Games empty":**

- API key must be same as Steam ID being queried
- Target profile must be set to "Public"
- Check error message in output

### **"Steam API Error":**

- Verify API key is valid
- Check Steam ID format
- Monitor rate limits

## Rich Presence Examples

Node supports **Rich Presence** for currently playing games:

- **Dota 2**: "Demo hero: lvl 1", "Playing as Invoker"
- **CS2**: "Competitive Match", "Deathmatch"
- **TF2**: "Playing as Scout", "On cp_dustbowl"
- **GTA V**: "Playing as Michael", "In Los Santos"

## Links

- [Steam Web API Documentation](https://developer.valvesoftware.com/wiki/Steam_Web_API)
- [Get Steam API Key](https://steamcommunity.com/dev/apikey)
- [n8n Custom Nodes Guide](https://docs.n8n.io/integrations/creating-nodes/)

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### **Development Setup:**

```bash
# Fork and clone repository
git clone https://github.com/Asyasyarif/steam-client-n8n.git
cd steam-client-n8n

# Install dependencies
npm install

# Build for production
npm run build
```

### **Reporting Issues:**

- Use GitHub Issues for bug reports
- Include n8n version and node configuration
- Provide error logs when possible

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- [n8n](https://n8n.io/) for the amazing workflow automation platform
- [Steam Web API](https://developer.valvesoftware.com/wiki/Steam_Web_API) for providing the API
- Community contributors and testers

---

## Disclaimer

This project is an independent development and is not officially associated with Valve Corporation or Steam. All Steam-related trademarks, logos, and brand names are the exclusive property of Valve Corporation. Steam and the Steam logo are registered trademarks of Valve Corporation in the United States and other countries.

---

**Made with ❤️ for the n8n community**
