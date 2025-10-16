import {
  INodeType,
  INodeTypeDescription,
  IExecuteFunctions,
  IPollFunctions,
  INodeExecutionData,
  IDataObject,
  NodeOperationError,
  IHttpRequestOptions,
} from 'n8n-workflow';

async function getPlayerSummaries(context: IExecuteFunctions | IPollFunctions, apiKey: string, steamId: string): Promise<any> {
  const options: IHttpRequestOptions = {
    method: 'GET',
    url: `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steamId}`,
    json: true,
  };
  return await context.helpers.httpRequest(options);
}

async function getOwnedGames(context: IExecuteFunctions | IPollFunctions, apiKey: string, steamId: string): Promise<any> {
  const options: IHttpRequestOptions = {
    method: 'GET',
    url: `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${apiKey}&steamid=${steamId}&include_appinfo=true&include_played_free_games=true`,
    json: true,
  };
  return await context.helpers.httpRequest(options);
}

async function getRecentlyPlayedGames(context: IExecuteFunctions | IPollFunctions, apiKey: string, steamId: string): Promise<any> {
  const options: IHttpRequestOptions = {
    method: 'GET',
    url: `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/?key=${apiKey}&steamid=${steamId}`,
    json: true,
  };
  return await context.helpers.httpRequest(options);
}

async function getFriendList(context: IExecuteFunctions | IPollFunctions, apiKey: string, steamId: string): Promise<any> {
  const options: IHttpRequestOptions = {
    method: 'GET',
    url: `https://api.steampowered.com/ISteamUser/GetFriendList/v1/?key=${apiKey}&steamid=${steamId}&relationship=friend`,
    json: true,
  };
  return await context.helpers.httpRequest(options);
}

function getPersonaStateText(personastate: number): string {
  switch (personastate) {
    case 0: return 'Offline';
    case 1: return 'Online';
    case 2: return 'Busy';
    case 3: return 'Away';
    case 4: return 'Snooze';
    case 5: return 'Looking to trade';
    case 6: return 'Looking to play';
    default: return 'Unknown';
  }
}

function formatPlaytime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

export class SteamClient implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Steam Client',
    name: 'steamClient',
    group: ['trigger'],
    version: 1,
    description: 'Steam Web API client with polling trigger',
    icon: 'file:steam.svg',
    defaults: {
      name: 'Steam Client',
      color: '#1F8EB2',
    },
    inputs: [],
    outputs: ['main'],
    polling: true,
    credentials: [
      {
        name: 'steamApiKey',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Steam ID',
        name: 'steamId',
        type: 'string',
        default: '',
        placeholder: 'Enter Steam ID or Profile URL',
        description: 'Steam ID or Profile URL target',
        required: true,
      },
      {
        displayName: 'Action',
        name: 'action',
        type: 'options',
        options: [
          {
            name: 'User Stats',
            value: 'userStats',
            description: 'Get user statistics (name, avatar, total games, etc)',
          },
          {
            name: 'Friend List',
            value: 'friendList',
            description: 'Get list of Steam friends',
          },
          {
            name: 'Recent Games',
            value: 'recentGames',
            description: 'Get recently played games (last 2 weeks)',
          },
        ],
        default: 'userStats',
        description: 'Action to be performed',
      },
    ],
  };

  async execute(this: IExecuteFunctions) {

    const credentials = await this.getCredentials('steamApiKey') as IDataObject;
    const apiKey = credentials.apiKey as string;

    const steamId = this.getNodeParameter('steamId', 0) as string;
    const action = this.getNodeParameter('action', 0) as string;

    try {
      let result: any = {};

      switch (action) {
        case 'userStats':
          const userInfo = await getPlayerSummaries(this, apiKey, steamId);
          const user = userInfo.response.players[0];
          const ownedGames = await getOwnedGames(this, apiKey, steamId);

          const topGames = ownedGames.response.games
            ?.sort((a: any, b: any) => b.playtime_forever - a.playtime_forever)
            ?.slice(0, 5)
            ?.map((game: any) => ({
              name: game.name,
              playtime: formatPlaytime(game.playtime_forever)
            })) || [];

          result = {
            action: action,
            // User Info
            personaname: user.personaname,
            steamid: user.steamid,
            profileurl: user.profileurl,
            avatar: user.avatarfull,
            status: getPersonaStateText(user.personastate),
            playingGame: user.gameextrainfo || 'Not playing game',
            gameDetails: user.gameextrainfo ? {
              gameName: user.gameextrainfo,
              gameId: user.gameid || null,
              richPresence: user.gameextrainfo.includes(':') ? user.gameextrainfo : null
            } : null,
            totalGames: ownedGames.response.game_count,
            topPlayingGames: topGames,
            realname: user.realname || 'Not set',
            primaryClanId: user.primaryclanid || 'Not set',
            communityVisibilityState: user.communityvisibilitystate || 0,
            commentPermission: user.commentpermission || 0,
            country: user.loccountrycode || 'Not set',
            state: user.locstatecode || 'Not set',
            city: user.loccityid || 'Not set',
            accountCreated: new Date(user.timecreated * 1000).toISOString(),
            lastLogoff: new Date(user.lastlogoff * 1000).toISOString(),
            timestamp: new Date().toISOString()
          };
          break;

        case 'friendList':
          const friendList = await getFriendList(this, apiKey, steamId);

          let friends = [];
          let friendError = null;

          if (friendList.friendslist && friendList.friendslist.friends) {
            friends = friendList.friendslist.friends.map((friend: any) => ({
              steamid: friend.steamid,
              relationship: friend.relationship,
              friendSince: new Date(friend.friend_since * 1000).toISOString()
            }));
          } else if (friendList.friendslist && friendList.friendslist.friends && friendList.friendslist.friends.length === 0) {
            friendError = "No friends found or profile is private";
          } else {
            friendError = "Friend list is private or API key doesn't have access. Note: Friend list requires the API key to be linked to the Steam ID being queried.";
          }

          result = {
            action: action,
            totalFriends: friends.length,
            friends: friends,
            error: friendError,
            rawResponse: friendList,
            note: "Friend list requires API key to be linked to the Steam ID being queried due to privacy restrictions",
            timestamp: new Date().toISOString()
          };
          break;

        case 'recentGames':
          const recentGames = await getRecentlyPlayedGames(this, apiKey, steamId);

          let recentGamesList = [];
          let errorMessage = null;

          if (recentGames.response && recentGames.response.games) {
            recentGamesList = recentGames.response.games
              .slice(0, 10)
              .map((game: any) => ({
                name: game.name,
                appid: game.appid,
                playtime2weeks: formatPlaytime(game.playtime_2weeks || 0),
                playtimeForever: formatPlaytime(game.playtime_forever || 0)
              }));
          } else if (recentGames.response && recentGames.response.total_count === 0) {
            errorMessage = "No recent games found or profile is private";
          } else {
            errorMessage = "Recent games are private or API key doesn't have access. Note: Recent games requires the API key to be linked to the Steam ID being queried.";
          }

          result = {
            action: action,
            totalRecentGames: recentGamesList.length,
            recentGames: recentGamesList,
            error: errorMessage,
            rawResponse: recentGames,
            note: "Recent games requires API key to be linked to the Steam ID being queried due to privacy restrictions",
            timestamp: new Date().toISOString()
          };
          break;


        default:
          throw new Error(`Unknown action: ${action}`);
      }

      return [this.helpers.returnJsonArray([{ ...result, json: result, pairedItem: { item: 0 } }])];

    } catch (error: any) {
      throw new NodeOperationError(this.getNode(), `Steam API Error: ${error.message}`);
    }
  }

  async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
    const credentials = await this.getCredentials('steamApiKey') as IDataObject;
    const apiKey = credentials.apiKey as string;

    const steamId = this.getNodeParameter('steamId') as string;
    const action = this.getNodeParameter('action') as string;

    try {
      let result: any = {};

      switch (action) {
        case 'userStats':
          const userInfo = await getPlayerSummaries(this, apiKey, steamId);
          const user = userInfo.response.players[0];
          const ownedGames = await getOwnedGames(this, apiKey, steamId);


          const topGames = ownedGames.response.games
            ?.sort((a: any, b: any) => b.playtime_forever - a.playtime_forever)
            ?.slice(0, 5)
            ?.map((game: any) => ({
              name: game.name,
              playtime: formatPlaytime(game.playtime_forever)
            })) || [];

          result = {
            action: action,
            personaname: user.personaname,
            steamid: user.steamid,
            profileurl: user.profileurl,
            avatar: user.avatarfull,
            personastate: user.personastate,
            status: getPersonaStateText(user.personastate),
            playingGame: user.gameextrainfo || 'Not playing game',
            gameDetails: user.gameextrainfo ? {
              gameName: user.gameextrainfo,
              gameId: user.gameid || null,
              serverIp: user.gameserverip || null,
              richPresence: user.gameextrainfo.includes(':') ? user.gameextrainfo : null
            } : null,
            totalGames: ownedGames.response.game_count,
            topPlayingGames: topGames,
            realname: user.realname || 'Not set',
            primaryClanId: user.primaryclanid || 'Not set',
            profileState: user.profilestate || 0,
            communityVisibilityState: user.communityvisibilitystate || 0,
            commentPermission: user.commentpermission || 0,
            country: user.loccountrycode || 'Not set',
            state: user.locstatecode || 'Not set',
            city: user.loccityid || 'Not set',

            accountCreated: new Date(user.timecreated * 1000).toISOString(),
            lastLogoff: new Date(user.lastlogoff * 1000).toISOString(),
            timestamp: new Date().toISOString()
          };
          break;

        case 'friendList':
          const friendList = await getFriendList(this, apiKey, steamId);

          let friends = [];
          let friendError = null;

          if (friendList.friendslist && friendList.friendslist.friends) {
            friends = friendList.friendslist.friends.map((friend: any) => ({
              steamid: friend.steamid,
              relationship: friend.relationship,
              friendSince: new Date(friend.friend_since * 1000).toISOString()
            }));
          } else if (friendList.friendslist && friendList.friendslist.friends && friendList.friendslist.friends.length === 0) {
            friendError = "No friends found or profile is private";
          } else {
            friendError = "Unable to fetch friend list data";
          }

          result = {
            action: action,
            totalFriends: friends.length,
            friends: friends,
            error: friendError,
            rawResponse: friendList,
            timestamp: new Date().toISOString()
          };
          break;

        case 'recentGames':
          const recentGames = await getRecentlyPlayedGames(this, apiKey, steamId);

          let recentGamesList = [];
          let errorMessage = null;

          if (recentGames.response && recentGames.response.games) {
            recentGamesList = recentGames.response.games
              .slice(0, 10)
              .map((game: any) => ({
                name: game.name,
                appid: game.appid,
                playtime2weeks: formatPlaytime(game.playtime_2weeks || 0),
                playtimeForever: formatPlaytime(game.playtime_forever || 0)
              }));
          } else if (recentGames.response && recentGames.response.total_count === 0) {
            errorMessage = "No recent games found or profile is private";
          } else {
            errorMessage = "Unable to fetch recent games data";
          }

          result = {
            action: action,
            totalRecentGames: recentGamesList.length,
            recentGames: recentGamesList,
            error: errorMessage,
            rawResponse: recentGames,
            timestamp: new Date().toISOString()
          };
          break;

      }

      return [this.helpers.returnJsonArray([result])];

    } catch (error: any) {
      throw new NodeOperationError(this.getNode(), `Steam API Error: ${error.message}`);
    }
  }
}
