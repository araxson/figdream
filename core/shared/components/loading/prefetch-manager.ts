export class PrefetchManager {
  private cache = new Map<string, Promise<any>>()
  private pending = new Set<string>()

  async prefetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl = 60000
  ): Promise<T> {
    // Return cached if available
    if (this.cache.has(key)) {
      return this.cache.get(key)!
    }

    // Prevent duplicate fetches
    if (this.pending.has(key)) {
      return new Promise((resolve, reject) => {
        const check = setInterval(() => {
          if (this.cache.has(key)) {
            clearInterval(check)
            resolve(this.cache.get(key)!)
          }
        }, 100)

        // Add timeout to prevent infinite waiting
        const timeout = setTimeout(() => {
          clearInterval(check)
          reject(new Error('Prefetch timeout'))
        }, 10000) // 10 second timeout

        // Store cleanup function
        const originalResolve = resolve
        resolve = (value: any) => {
          clearTimeout(timeout)
          originalResolve(value)
        }
      })
    }

    this.pending.add(key)

    const promise = fetcher().then(data => {
      this.pending.delete(key)

      // Set TTL for cache
      setTimeout(() => {
        this.cache.delete(key)
      }, ttl)

      return data
    })

    this.cache.set(key, promise)
    return promise
  }

  clear(key?: string) {
    if (key) {
      this.cache.delete(key)
    } else {
      this.cache.clear()
    }
  }
}

export const prefetchManager = new PrefetchManager()