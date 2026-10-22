import type { IncidentEvent, RegionGroup, SeverityFilter } from '../types/incident'

interface DepartmentAccumulator {
  name: string
  totalCount: number
  criticalCount: number
  incidents: IncidentEvent[]
}

interface RegionAccumulator {
  name: string
  totalCount: number
  criticalCount: number
  departments: Map<string, DepartmentAccumulator>
}

export function buildIncidentTree(
  events: IncidentEvent[],
  severity: SeverityFilter,
): RegionGroup[] {
  const regions = new Map<string, RegionAccumulator>()

  for (const event of events) {
    let region = regions.get(event.region)
    if (!region) {
      region = {
        name: event.region,
        totalCount: 0,
        criticalCount: 0,
        departments: new Map(),
      }
      regions.set(event.region, region)
    }

    region.totalCount += 1
    if (event.severity === 'critical') region.criticalCount += 1

    let department = region.departments.get(event.department)
    if (!department) {
      department = {
        name: event.department,
        totalCount: 0,
        criticalCount: 0,
        incidents: [],
      }
      region.departments.set(event.department, department)
    }

    department.totalCount += 1
    if (event.severity === 'critical') department.criticalCount += 1

    if (severity === 'all' || event.severity === severity) {
      department.incidents.push(event)
    }
  }

  return [...regions.values()]
    .map((region) => ({
      name: region.name,
      totalCount: region.totalCount,
      criticalCount: region.criticalCount,
      departments: [...region.departments.values()]
        .filter((department) => department.incidents.length > 0)
        .sort((a, b) => a.name.localeCompare(b.name, 'ru')),
    }))
    .filter((region) => region.departments.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name, 'ru'))
}
