export interface RubricCriteria {
  id: string
  label: string
  points: number
  description?: string
}

export interface Rubric {
  id: string
  title: string
  criteriaList: RubricCriteria[]
}
