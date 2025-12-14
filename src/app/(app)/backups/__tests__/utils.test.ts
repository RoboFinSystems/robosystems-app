import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getFormatIcon,
  getNextRunTime,
  parseCronExpression,
  validateCronExpression,
} from '../utils'

describe('Backup Utils', () => {
  describe('parseCronExpression', () => {
    it('should parse common cron patterns', () => {
      expect(parseCronExpression('0 2 * * *')).toBe('Daily at 2:00 AM')
      expect(parseCronExpression('0 2 * * 0')).toBe(
        'Weekly on Sunday at 2:00 AM'
      )
      expect(parseCronExpression('0 2 1 * *')).toBe('Monthly on 1st at 2:00 AM')
      expect(parseCronExpression('0 0 * * *')).toBe('Daily at midnight')
      expect(parseCronExpression('0 12 * * *')).toBe('Daily at noon')
    })

    it('should parse custom cron expressions', () => {
      expect(parseCronExpression('30 14 * * *')).toBe('Daily at 2:30 PM')
      expect(parseCronExpression('0 9 * * 1')).toBe(
        'Weekly on Monday at 9:00 AM'
      )
      expect(parseCronExpression('0 0 15 * *')).toBe(
        'Monthly on 15th at 12:00 AM'
      )
    })

    it('should return original cron for invalid patterns', () => {
      expect(parseCronExpression('invalid')).toBe('invalid')
      expect(parseCronExpression('')).toBe('')
    })
  })

  describe('validateCronExpression', () => {
    it('should validate correct cron expressions', () => {
      expect(validateCronExpression('0 2 * * *')).toBe(true)
      expect(validateCronExpression('30 14 * * *')).toBe(true)
      expect(validateCronExpression('0 0 1 * *')).toBe(true)
      expect(validateCronExpression('* * * * *')).toBe(true)
    })

    it('should reject invalid cron expressions', () => {
      expect(validateCronExpression('invalid')).toBe(false)
      expect(validateCronExpression('0 25 * * *')).toBe(false) // Invalid hour
      expect(validateCronExpression('60 0 * * *')).toBe(false) // Invalid minute
      expect(validateCronExpression('0 0 32 * *')).toBe(false) // Invalid day
      expect(validateCronExpression('0 0 * 13 *')).toBe(false) // Invalid month
      expect(validateCronExpression('0 0 * * 7')).toBe(false) // Invalid day of week
      expect(validateCronExpression('0 0 * *')).toBe(false) // Too few parts
    })
  })

  describe('getNextRunTime', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2024-01-15 10:00:00'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should calculate next run time for daily cron', () => {
      const next = getNextRunTime('0 2 * * *')
      // Should be tomorrow at 2 AM since current time is 10 AM
      expect(next.getDate()).toBe(16)
      expect(next.getHours()).toBe(2)
      expect(next.getMinutes()).toBe(0)
    })

    it('should calculate next run time when time has not passed today', () => {
      vi.setSystemTime(new Date('2024-01-15 01:00:00'))
      const next = getNextRunTime('0 2 * * *')
      // The function adds 1 day by default, so it will be tomorrow
      expect(next.getDate()).toBe(16)
      expect(next.getHours()).toBe(2)
      expect(next.getMinutes()).toBe(0)
    })
  })

  describe('getFormatIcon', () => {
    it('should return correct icon info for each format', () => {
      expect(getFormatIcon('csv')).toEqual({
        icon: 'csv',
        color: 'text-green-600',
      })
      expect(getFormatIcon('json')).toEqual({
        icon: 'json',
        color: 'text-yellow-600',
      })
      expect(getFormatIcon('parquet')).toEqual({
        icon: 'parquet',
        color: 'text-blue-600',
      })
      expect(getFormatIcon('full_dump')).toEqual({
        icon: 'database',
        color: 'text-purple-600',
      })
    })

    it('should return default parquet for unknown format', () => {
      expect(getFormatIcon('unknown')).toEqual({
        icon: 'parquet',
        color: 'text-blue-600',
      })
    })
  })
})
