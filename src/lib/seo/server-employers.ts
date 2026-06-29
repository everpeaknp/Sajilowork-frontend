import type { Employer } from '@/components/employers/employerData';
import {
  extractEmployerList,
  mapEmployerPublicDtoToEmployer,
} from '@/lib/employerApi';
import type { EmployerPublicDto } from '@/services/employer.service';

import { fetchPublicJson, type Paginated } from './api';

export async function fetchServerEmployers(limit = 200): Promise<Employer[]> {
  const data = await fetchPublicJson<Paginated<EmployerPublicDto>>(
    `/employers/?page_size=${limit}`,
    { revalidate: 300 },
  );
  const dtos = extractEmployerList(data);
  return dtos.map(mapEmployerPublicDtoToEmployer);
}
