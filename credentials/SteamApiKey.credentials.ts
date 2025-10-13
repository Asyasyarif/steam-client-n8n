import {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class SteamApiKey implements ICredentialType {
  name = 'steamApiKey';
  displayName = 'Steam API Key';
  icon = 'file:steam.svg' as const;
  documentationUrl = 'https://steamcommunity.com/dev/apikey';
  properties: INodeProperties[] = [
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: { 
        password: true 
      },
      default: '',
      description: 'Steam Web API Key from https://steamcommunity.com/dev/apikey',
      required: true,
    },
  ];

  // This allows the credential to be used by other parts of n8n
  // stating how this credential is injected as part of the request
  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      qs: {
        key: '={{$credentials.apiKey}}',
      },
    },
  };

  // The block below tells how this credential can be tested
  test: ICredentialTestRequest = {
    request: {
      baseURL: 'https://api.steampowered.com',
      url: '/ISteamApps/GetAppList/v2/',
    },
  };
}
