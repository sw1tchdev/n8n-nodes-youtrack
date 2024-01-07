import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export const CREDENTIAL_NAME = 'youtrackToken';

export class YouTrackTokenApi implements ICredentialType {
	displayName = 'YouTrack Token API';
	documentationUrl =
		'https://www.jetbrains.com/help/youtrack/devportal/Manage-Permanent-Token.html';
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
			displayName: 'API Token',
			name: 'apiToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
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
