// Validation utilities for forms and API requests
export const validateStudentId = (studentId: string): boolean => {
  const regex = /^\d{4}\/\d{3}$/
  return regex.test(studentId)
}

export const validateElectionTimes = (startTime: number, endTime: number): string | null => {
  const now = Math.floor(Date.now() / 1000)

  if (startTime <= now) {
    return "Start time must be in the future"
  }

  if (endTime <= startTime) {
    return "End time must be after start time"
  }

  if (endTime - startTime < 3600) {
    return "Election must run for at least 1 hour"
  }

  return null
}

export const validateCandidateData = (name: string, position: string, manifesto: string): string | null => {
  if (!name.trim()) {
    return "Candidate name is required"
  }

  if (name.length < 2) {
    return "Candidate name must be at least 2 characters"
  }

  if (!position.trim()) {
    return "Position is required"
  }

  if (!manifesto.trim()) {
    return "Manifesto is required"
  }

  if (manifesto.length < 50) {
    return "Manifesto must be at least 50 characters"
  }

  return null
}

export const validateElectionData = (title: string, description: string): string | null => {
  if (!title.trim()) {
    return "Election title is required"
  }

  if (title.length < 5) {
    return "Election title must be at least 5 characters"
  }

  if (!description.trim()) {
    return "Election description is required"
  }

  if (description.length < 20) {
    return "Election description must be at least 20 characters"
  }

  return null
}
