import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../GenericFunctions';

export const RESOURCE_VALUE = 'users';

export const RESOURCE = [{ name: 'Users', value: RESOURCE_VALUE }];

export const FIELDS: INodeProperties[] = [
	{
		displayName: 'Receive Fields',
		name: 'fields',
		type: 'string',
		placeholder: 'fields',
		displayOptions: {
			show: {
				resource: [RESOURCE_VALUE],
				operation: ['info'],
			},
		},
		default: '$type,banned,email,fullName,guest,id,login,ringId',
	},
];

export const OPERATIONS: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		displayOptions: { show: { resource: [RESOURCE_VALUE] } },
		options: [
			{
				name: 'Info',
				value: 'info',
				description: 'Get user info',
				action: 'Get user info',
				// routing: {
				// 	request: {
				// 		method: 'GET',
				// 		url: '=/users/me?fields={{$parameter.fields}}',
				// 	},
				// },
			},
		],
		default: 'info',
		noDataExpression: true,
	},
];

export async function execute(this: IExecuteFunctions): Promise<unknown> {
	const operation = this.getNodeParameter('operation', 0);
	let resultData;

	if (operation === 'info') {
		const fields = this.getNodeParameter('fields', 0);
		resultData = await apiRequest.call(this, 'GET', '/users/me', {}, { fields: fields });
	}

	return resultData;
}
