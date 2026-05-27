export interface ExportSettings {
  mode: 'student' | 'teacher'
  showMetadata: boolean
  showInstructions: boolean
  showStudentCard: boolean
  margin: 'compact' | 'normal' | 'wide'
  fontSize: 'sm' | 'base' | 'lg'
  twoColumnChoices: boolean
}
