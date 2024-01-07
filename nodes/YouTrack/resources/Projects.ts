import { ILoadOptionsFunctions, INodeListSearchResult } from 'n8n-workflow';
import { apiRequest } from '../GenericFunctions';

export type Project = {
	$type: string;
	archived: boolean;
	customFields: unknown;
	id: string;
	leader: {
		$type: string;
		login: string;
		ringId: string;
	};
	name: string;
	shortName: string;
};

// TODO add pagination
export async function searchProjects(
	this: ILoadOptionsFunctions,
	query?: string,
): Promise<INodeListSearchResult> {
	const searchResults = (await apiRequest.call(
		this,
		'GET',
		'/admin/projects',
		{},
		{ fields: '$type,archived,customFields,id,leader($type,id,login,ringId),name,shortName' },
	)) as Project[];
	return {
		results: searchResults
			.map((w) => ({
				name: `${w.name} (#${w.id})`,
				value: w.id,
			}))
			.filter(
				(w) =>
					!query ||
					w.name.toLowerCase().includes(query.toLowerCase()) ||
					w.value?.toString() === query,
			)
			.sort((a, b) => {
				const nameA = a.name.toUpperCase(); // ignore upper and lowercase
				const nameB = b.name.toUpperCase(); // ignore upper and lowercase
				if (nameA < nameB) {
					return -1;
				}
				if (nameA > nameB) {
					return 1;
				}

				// names must be equal
				return 0;
			}),
	};
}
