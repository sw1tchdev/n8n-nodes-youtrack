import { IDataObject, IExecuteFunctions, INodeProperties, NodeOperationError } from 'n8n-workflow';
import { apiRequest } from '../GenericFunctions';

export const RESOURCE_VALUE = 'issues';

export const RESOURCE = [{ name: 'Issues', value: RESOURCE_VALUE }];

export const FIELDS: INodeProperties[] = [
	{
		displayName: 'Issue ID',
		name: 'issueId',
		type: 'string',
		placeholder: '0',
		displayOptions: {
			show: {
				resource: [RESOURCE_VALUE],
				operation: ['get', 'update', 'delete'],
			},
		},
		required: true,
		default: '',
	},
	{
		displayName: 'Receive Fields',
		name: 'fields',
		type: 'string',
		placeholder: 'fields',
		displayOptions: {
			show: {
				resource: [RESOURCE_VALUE],
				operation: ['create', 'get', 'update'],
			},
		},
		default:
			'$type,created,customFields($type,id,name,value($type,id,name)),description,id,idReadable,links($type,direction,id,linkType($type,id,localizedName,name)),numberInProject,project($type,id,name,shortName),reporter($type,id,login,ringId),resolved,summary,updated,updater($type,id,login,ringId),visibility($type,id,permittedGroups($type,id,name,ringId),permittedUsers($type,id,login,ringId))',
	},
	{
		displayName: 'Project',
		name: 'project',
		type: 'resourceLocator',
		description: 'Project ID',
		modes: [
			{
				displayName: 'ID',
				name: 'id',
				type: 'string',
				hint: 'Enter an ID',
				validation: [
					{
						type: 'regex',
						properties: {
							regex: '^.+$',
							errorMessage: 'The ID is required',
						},
					},
				],
				placeholder: 'string',
			},
			{
				displayName: 'List',
				name: 'list',
				type: 'list',
				typeOptions: {
					searchListMethod: 'searchProjects',
					searchable: true,
					searchFilterRequired: true,
				},
			},
		],
		displayOptions: {
			show: {
				resource: [RESOURCE_VALUE],
				operation: ['create', 'update'],
			},
		},
		default: undefined,
		required: true,
	},
	{
		displayName: 'Title',
		name: 'summary',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: [RESOURCE_VALUE],
				operation: ['create', 'update'],
			},
		},
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		required: true,
		typeOptions: {
			rows: 4,
		},
		default: '',
		displayOptions: {
			show: {
				resource: [RESOURCE_VALUE],
				operation: ['create', 'update'],
			},
		},
	},
	{
		displayName: 'Assignee',
		name: 'assignee',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: [RESOURCE_VALUE],
				operation: ['create', 'update'],
			},
		},
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
				name: 'Create',
				value: 'create',
				description: 'Create issue',
				action: 'Create issue',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get issue',
				action: 'Get issue',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update issue',
				action: 'Update issue',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete issue',
				action: 'Delete issue',
			},
		],
		default: 'create',
		noDataExpression: true,
	},
];

export async function execute(this: IExecuteFunctions): Promise<unknown> {
	const operation = this.getNodeParameter('operation', 0);
	let resultData;

	if (operation === 'create') {
		const fields = this.getNodeParameter('fields', 0);
		const { value: projectId } = this.getNodeParameter('project', 0) as IDataObject;
		const description = this.getNodeParameter('description', 0);
		const summary = this.getNodeParameter('summary', 0);
		const assignee = this.getNodeParameter('assignee', 0);
		resultData = await apiRequest.call(
			this,
			'POST',
			'/issues',
			{
				project: { id: projectId },
				summary,
				description,
				customFields: [
					{
						name: 'Assignee',
						$type: 'SingleUserIssueCustomField',
						value: assignee
							? {
									login: assignee,
							  }
							: null,
					},
				],
			},
			{ fields },
		);
	}

	if (operation === 'get') {
		const issueId = this.getNodeParameter('issueId', 0);

		if (typeof issueId !== 'string' || issueId === '') {
			throw new NodeOperationError(this.getNode(), 'Empty IssueId');
		}

		const fields = this.getNodeParameter('fields', 0);
		resultData = await apiRequest.call(this, 'GET', `/issues/${issueId}`, {}, { fields });
	}

	if (operation === 'update') {
		const fields = this.getNodeParameter('fields', 0);
		const { value: projectId } = this.getNodeParameter('project', 0) as IDataObject;
		const description = this.getNodeParameter('description', 0);
		const summary = this.getNodeParameter('summary', 0);
		const issueId = this.getNodeParameter('issueId', 0);
		const assignee = this.getNodeParameter('assignee', 0);

		if (typeof issueId !== 'string' || issueId === '') {
			throw new NodeOperationError(this.getNode(), 'Empty IssueId');
		}

		resultData = await apiRequest.call(
			this,
			'POST',
			`/issues/${issueId}`,
			{
				project: { id: projectId },
				summary,
				description,
				customFields: [
					{
						name: 'Assignee',
						$type: 'SingleUserIssueCustomField',
						value: assignee
							? {
									login: assignee,
							  }
							: null,
					},
				],
			},
			{ fields },
		);
	}

	if (operation === 'delete') {
		const issueId = this.getNodeParameter('issueId', 0);

		if (typeof issueId !== 'string' || issueId === '') {
			throw new NodeOperationError(this.getNode(), 'Empty IssueId');
		}

		await apiRequest.call(this, 'DELETE', `/issues/${issueId}`, {});
		resultData = { success: true };
	}

	return resultData;
}
