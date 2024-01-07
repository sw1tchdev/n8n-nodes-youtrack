import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export const CREDENTIAL_NAME = 'youtrackOAuth2';

export class YouTrackOAuth2Api implements ICredentialType {
	extends = ['oAuth2Api'];
	displayName = 'YouTrack OAuth2 API';
	documentationUrl =
		'https://www.jetbrains.com/help/youtrack/devportal/OAuth-authorization-in-hub.html';
	name = CREDENTIAL_NAME;
	properties: INodeProperties[] = [
		{
			displayName: 'API base url',
			name: 'baseUrl',
			type: 'string',
			default: 'https://youtrack.local/api',
			required: true,
		},
		{
			displayName: 'Grant Type',
			name: 'grantType',
			type: 'hidden',
			default: 'pkce',
		},
		{
			displayName: 'Authorization URL',
			name: 'authUrl',
			type: 'string',
			default: 'https://youtrack.local/hub/api/rest/oauth2/auth',
		},
		{
			displayName: 'Access Token URL',
			name: 'accessTokenUrl',
			type: 'string',
			default: 'https://youtrack.local/hub/api/rest/oauth2/token',
		},
		{
			displayName: 'Auth URI Query Parameters',
			name: 'authQueryParameters',
			type: 'hidden',
			default: 'access_type=offline&request_credentials=skip',
		},
		{
			displayName: 'Authentication',
			name: 'authentication',
			type: 'hidden',
			default: 'body',
		},
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'hidden',
			default: 'YouTrack',
		},
	];

	test: ICredentialTestRequest = {
		request: {
			method: 'GET',
			baseURL: '={{$credentials.baseUrl}}',
			url: '/users/me',
		},
	};

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '={{"Bearer " + $credentials.apiToken}}',
			},
		},
	};
}
