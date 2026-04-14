import { describe, expect, it } from 'vitest'
import { matchesWhitelist } from './auth-middleware'

describe('matchesWhitelist', () => {
  describe('string path', () => {
    const whitelist = [{ path: '/public', method: 'GET' }]

    it('passes when path and method both match', () => {
      expect(matchesWhitelist('/public', 'GET', whitelist)).toBe(true)
    })

    it('blocks when path matches but method differs', () => {
      expect(matchesWhitelist('/public', 'POST', whitelist)).toBe(false)
    })

    it('blocks when method matches but path differs', () => {
      expect(matchesWhitelist('/other', 'GET', whitelist)).toBe(false)
    })
  })

  describe('RegExp path', () => {
    const whitelist = [{ path: /^\/public\//, method: 'POST' }]

    it('passes when regex and method both match', () => {
      expect(matchesWhitelist('/public/anything', 'POST', whitelist)).toBe(true)
    })

    it('blocks when regex matches but method differs', () => {
      expect(matchesWhitelist('/public/anything', 'GET', whitelist)).toBe(false)
    })

    it('blocks when method matches but path does not', () => {
      expect(matchesWhitelist('/private/anything', 'POST', whitelist)).toBe(
        false,
      )
    })
  })

  describe('method case-insensitivity', () => {
    const whitelist = [{ path: '/api', method: 'GET' }]

    it('passes for lowercase method', () => {
      expect(matchesWhitelist('/api', 'get', whitelist)).toBe(true)
    })

    it('passes for mixed-case method', () => {
      expect(matchesWhitelist('/api', 'Get', whitelist)).toBe(true)
    })
  })

  describe('multiple entries', () => {
    const whitelist = [
      { path: '/login', method: 'POST' },
      { path: '/health', method: 'GET' },
    ]

    it('passes for each matching entry', () => {
      expect(matchesWhitelist('/login', 'POST', whitelist)).toBe(true)
      expect(matchesWhitelist('/health', 'GET', whitelist)).toBe(true)
    })

    it('blocks when path matches but method is wrong', () => {
      expect(matchesWhitelist('/login', 'GET', whitelist)).toBe(false)
    })
  })

  it('blocks all requests with empty whitelist', () => {
    expect(matchesWhitelist('/anything', 'GET', [])).toBe(false)
  })
})
