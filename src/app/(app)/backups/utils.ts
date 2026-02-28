// Utility functions for backup management

export function parseCronExpression(cron: string): string {
  // Common cron patterns
  const patterns: Record<string, string> = {
    '0 2 * * *': 'Daily at 2:00 AM',
    '0 2 * * 0': 'Weekly on Sunday at 2:00 AM',
    '0 2 * * 1': 'Weekly on Monday at 2:00 AM',
    '0 2 * * 2': 'Weekly on Tuesday at 2:00 AM',
    '0 2 * * 3': 'Weekly on Wednesday at 2:00 AM',
    '0 2 * * 4': 'Weekly on Thursday at 2:00 AM',
    '0 2 * * 5': 'Weekly on Friday at 2:00 AM',
    '0 2 * * 6': 'Weekly on Saturday at 2:00 AM',
    '0 2 1 * *': 'Monthly on 1st at 2:00 AM',
    '0 2 15 * *': 'Monthly on 15th at 2:00 AM',
    '0 0 * * *': 'Daily at midnight',
    '0 12 * * *': 'Daily at noon',
    '0 0 * * 0': 'Weekly on Sunday at midnight',
    '0 0 1 * *': 'Monthly on 1st at midnight',
  }

  if (patterns[cron]) {
    return patterns[cron]
  }

  // Parse custom cron expressions
  const parts = cron.split(' ')
  if (parts.length !== 5) {
    return cron // Return as-is if not valid format
  }

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts

  // Build human-readable description
  let description = ''

  // Time
  if (minute !== '*' && hour !== '*') {
    const h = parseInt(hour)
    const m = parseInt(minute)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h
    description += `at ${displayHour}:${m.toString().padStart(2, '0')} ${ampm}`
  }

  // Day of week
  if (dayOfWeek !== '*') {
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ]
    const dayNum = parseInt(dayOfWeek)
    if (dayNum >= 0 && dayNum <= 6) {
      description = `Weekly on ${days[dayNum]} ${description}`
    }
  }
  // Day of month
  else if (dayOfMonth !== '*') {
    const day = parseInt(dayOfMonth)
    const suffix = day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'
    description = `Monthly on ${day}${suffix} ${description}`
  }
  // Daily
  else if (minute !== '*' && hour !== '*') {
    description = `Daily ${description}`
  }

  return description || cron
}

export function getNextRunTime(cron: string): Date {
  // Simple implementation - for production, use a library like cron-parser
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Parse hour and minute from cron
  const parts = cron.split(' ')
  if (parts.length >= 2) {
    const minute = parseInt(parts[0]) || 0
    const hour = parseInt(parts[1]) || 2

    tomorrow.setHours(hour, minute, 0, 0)

    // If the time has already passed today, use tomorrow
    if (tomorrow < now) {
      tomorrow.setDate(tomorrow.getDate() + 1)
    }
  }

  return tomorrow
}

export function getFormatIcon(format: string): { icon: string; color: string } {
  const formats: Record<string, { icon: string; color: string }> = {
    csv: { icon: 'csv', color: 'text-green-600' },
    json: { icon: 'json', color: 'text-yellow-600' },
    parquet: { icon: 'parquet', color: 'text-blue-600' },
    full_dump: { icon: 'database', color: 'text-purple-600' },
  }

  return formats[format] || formats.parquet
}

export function validateCronExpression(cron: string): boolean {
  // Basic validation - check if it has 5 parts
  const parts = cron.split(' ')
  if (parts.length !== 5) {
    return false
  }

  // Check each part
  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts

  // Minute: 0-59 or *
  if (
    minute !== '*' &&
    (isNaN(parseInt(minute)) || parseInt(minute) < 0 || parseInt(minute) > 59)
  ) {
    return false
  }

  // Hour: 0-23 or *
  if (
    hour !== '*' &&
    (isNaN(parseInt(hour)) || parseInt(hour) < 0 || parseInt(hour) > 23)
  ) {
    return false
  }

  // Day of month: 1-31 or *
  if (
    dayOfMonth !== '*' &&
    (isNaN(parseInt(dayOfMonth)) ||
      parseInt(dayOfMonth) < 1 ||
      parseInt(dayOfMonth) > 31)
  ) {
    return false
  }

  // Month: 1-12 or *
  if (
    month !== '*' &&
    (isNaN(parseInt(month)) || parseInt(month) < 1 || parseInt(month) > 12)
  ) {
    return false
  }

  // Day of week: 0-6 or *
  if (
    dayOfWeek !== '*' &&
    (isNaN(parseInt(dayOfWeek)) ||
      parseInt(dayOfWeek) < 0 ||
      parseInt(dayOfWeek) > 6)
  ) {
    return false
  }

  return true
}
