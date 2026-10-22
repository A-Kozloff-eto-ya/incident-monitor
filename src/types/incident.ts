export const SEVERITIES = ['info', 'warning', 'critical'] as const

export type Severity = (typeof SEVERITIES)[number]
export type SeverityFilter = Severity | 'all'

export interface IncidentEvent {
  id: string
  region: string
  department: string
  severity: Severity
  message: string
  timestamp: number
}

export interface DepartmentGroup {
  name: string
  totalCount: number
  criticalCount: number
  incidents: IncidentEvent[]
}

export interface RegionGroup {
  name: string
  totalCount: number
  criticalCount: number
  departments: DepartmentGroup[]
}
