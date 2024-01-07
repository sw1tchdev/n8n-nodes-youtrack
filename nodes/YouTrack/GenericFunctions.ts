import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';
import type { OptionsWithUri } from 'request';
import * as YouTrackTokenApi from '../../credentials/YouTrackTokenApi.credentials';
import * as YouTrackOAuth2Api from '../../credentials/YouTrackOAuth2Api.credentials';
import { IYouTrackCredentialsProperties } from '../../credentials/types';

export async function apiRequest<Type>(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	method: string,
	endpoint: string,
	body: object,
	query?: IDataObject,
): Promise<Type> {
	query = query || {};
	const authentication = this.getNodeParameter('authentication', 0);
	const credentialName =
		authentication === 'accessToken'
			? YouTrackTokenApi.CREDENTIAL_NAME
			: YouTrackOAuth2Api.CREDENTIAL_NAME;
	const credentials = (await this.getCredentials(
		credentialName,
	)) as unknown as IYouTrackCredentialsProperties;
	const baseUrl = credentials.baseUrl;

	const options: OptionsWithUri = {
		method,
		body,
		qs: query,
		uri: `${baseUrl.replace(new RegExp('/$'), '')}${endpoint}`,
		json: true,
	};

	try {
		return await this.helpers.requestWithAuthentication.call(this, credentialName, options);
	} catch (error) {
		if (error instanceof NodeApiError) {
			throw error;
		}

		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}
