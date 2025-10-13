import { INodeType, ICredentialType } from 'n8n-workflow';
import { SteamClient } from './SteamClient.node';
import { SteamApiKey } from './SteamApiKey.credentials';

export const nodes: INodeType[] = [
  new SteamClient(),
];

export const credentials: ICredentialType[] = [
  new SteamApiKey(),
];