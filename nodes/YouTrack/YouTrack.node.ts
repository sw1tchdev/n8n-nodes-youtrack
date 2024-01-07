import {
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IExecuteFunctions,
	IDataObject,
} from 'n8n-workflow';
import * as YouTrackTokenApi from '../../credentials/YouTrackTokenApi.credentials';
import * as YouTrackOAuth2Api from '../../credentials/YouTrackOAuth2Api.credentials';
import { Users, Issues, Projects } from './resources';

export class YouTrack implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'YouTrack',
		name: 'YouTrack',
		icon: 'file:YouTrack.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with YouTrack API',
		defaults: {
			name: 'YouTrack',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: YouTrackTokenApi.CREDENTIAL_NAME,
				required: true,
				displayOptions: {
					show: {
						authentication: ['accessToken'],
					},
				},
			},
			{
				name: YouTrackOAuth2Api.CREDENTIAL_NAME,
				required: true,
				displayOptions: {
					show: {
						authentication: ['oAuth2'],
					},
				},
			},
		],
		requestDefaults: {
			baseURL: '={{$credentials.baseUrl.replace(new RegExp("/+$"), "")}}',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Authentication',
				name: 'authentication',
				type: 'options',
				options: [
					{
						name: 'Access Token',
						value: 'accessToken',
					},
					{
						name: 'OAuth2',
						value: 'oAuth2',
					},
				],
				default: 'accessToken',
			},
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				options: [...Users.RESOURCE, ...Issues.RESOURCE],
				default: '',
				noDataExpression: true,
				required: true,
				description: 'YouTrack resources',
			},
			...Users.OPERATIONS,
			...Users.FIELDS,
			...Issues.OPERATIONS,
			...Issues.FIELDS,
		],
	};
	methods = {
		listSearch: {
			searchProjects: Projects.searchProjects,
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const length = items.length;
		let responseData;
		const resource = this.getNodeParameter('resource', 0);
		for (let i = 0; i < length; i++) {
			try {
				if (resource === Users.RESOURCE_VALUE) {
					responseData = await Users.execute.call(this);
				}

				if (resource === Issues.RESOURCE_VALUE) {
					responseData = await Issues.execute.call(this);
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData as unknown as IDataObject[]),
					{ itemData: { item: i } },
				);
				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ error: error.message, json: {}, itemIndex: i });
					continue;
				}
				throw error;
			}
		}
		return [returnData];
	}
}
