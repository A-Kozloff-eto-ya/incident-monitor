import type { IncidentEvent, RegionGroup, SeverityFilter } from '../types/incident'

export function buildIncidentTree(
  events: IncidentEvent[],
  severity: SeverityFilter,
): RegionGroup[] {
  const regions = new Map<string, Map<string, IncidentEvent[]>>()
  for (const event of events) {
    const departments = regions.get(event.region) ?? new Map<string, IncidentEvent[]>()
    const incidents = departments.get(event.department) ?? []
    incidents.push(event)
    departments.set(event.department, incidents)
    regions.set(event.region, departments)
  }

  return [...regions.entries()]
    .map(([name, departments]) => {
      const departmentGroups = [...departments.entries()]
        .map(([departmentName, incidents]) => ({
          name: departmentName,
          totalCount: incidents.length,
          criticalCount: incidents.filter((event) => event.severity === 'critical').length,
          incidents: severity === 'all'
            ? incidents
            : incidents.filter((event) => event.severity === severity),
        }))
        .filter((department) => department.incidents.length > 0)
        .sort((a, b) => a.name.localeCompare(b.name, 'ru'))

      const regionEvents = [...departments.values()].flat()
      return {
        name,
        totalCount: regionEvents.length,
        criticalCount: regionEvents.filter((event) => event.severity === 'critical').length,
        departments: departmentGroups,
      }
    })
    .filter((region) => region.departments.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name, 'ru'))
}
