import { ICredentialType, INodeProperties } from 'n8n-workflow';

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
}
