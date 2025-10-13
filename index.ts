import { INodeType, ICredentialType } from 'n8n-workflow';
import { SteamClient } from './nodes/SteamClient/SteamClient.node';
import { SteamApiKey } from './credentials/SteamApiKey.credentials';

export const nodes: INodeType[] = [
  new SteamClient(),
];

export const credentials: ICredentialType[] = [
  new SteamApiKey(),
];