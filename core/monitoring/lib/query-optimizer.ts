/**
 * Query Optimizer
 * Provides query optimization suggestions and automatic query improvements
 */

import { createClient } from '@/lib/supabase/server'
import type { QueryPerformance } from '../types'
import { performanceTracker } from './performance-tracker'

interface QueryPlan {
  query: string
  estimatedCost: number
  indexes: string[]
  suggestions: string[]
}

interface IndexRecommendation {
  table: string
  columns: string[]
  type: 'btree' | 'hash' | 'gin' | 'gist'
  reason: string
  estimatedImprovement: number // percentage
}

export class QueryOptimizer {
  private static instance: QueryOptimizer
  private queryCache = new Map<string, QueryPlan>()

  private constructor() {}

  static getInstance(): QueryOptimizer {
    if (!QueryOptimizer.instance) {
      QueryOptimizer.instance = new QueryOptimizer()
    }
    return QueryOptimizer.instance
  }

  /**
   * Analyze query and provide optimization suggestions
   */
  async analyzeQuery(query: string): Promise<QueryPlan> {
    // Check cache first
    const cached = this.queryCache.get(query)
    if (cached) return cached

    const suggestions: string[] = []
    const indexes: string[] = []

    // Basic query analysis
    const queryLower = query.toLowerCase()

    // Check for SELECT *
    if (queryLower.includes('select *')) {
      suggestions.push('Avoid SELECT *, specify only needed columns')
    }

    // Check for missing WHERE clause in UPDATE/DELETE
    if ((queryLower.includes('update') || queryLower.includes('delete')) && !queryLower.includes('where')) {
      suggestions.push('WARNING: UPDATE/DELETE without WHERE clause affects all rows')
    }

    // Check for OR conditions that might benefit from UNION
    if (queryLower.match(/where.*\bor\b.*\bor\b/)) {
      suggestions.push('Multiple OR conditions might perform better as UNION')
    }

    // Check for LIKE with leading wildcard
    if (queryLower.match(/like\s+['"]%/)) {
      suggestions.push('Leading wildcard in LIKE prevents index usage')
    }

    // Check for NOT IN with subquery
    if (queryLower.includes('not in (select')) {
      suggestions.push('NOT IN with subquery can be slow, consider NOT EXISTS')
    }

    // Check for missing JOIN conditions
    const joinCount = (queryLower.match(/\bjoin\b/g) || []).length
    const onCount = (queryLower.match(/\bon\b/g) || []).length
    if (joinCount > onCount) {
      suggestions.push('Possible missing JOIN condition detected')
    }

    // Check for functions in WHERE clause
    if (queryLower.match(/where.*\b(upper|lower|substring|date|cast)\s*\(/)) {
      suggestions.push('Functions in WHERE clause prevent index usage, consider function indexes')
    }

    // Estimate cost (simplified)
    let estimatedCost = 100
    if (queryLower.includes('select *')) estimatedCost += 50
    if (!queryLower.includes('limit')) estimatedCost += 100
    if (queryLower.includes('join')) estimatedCost += 50 * joinCount
    if (queryLower.includes('order by')) estimatedCost += 30

    const plan: QueryPlan = {
      query,
      estimatedCost,
      indexes,
      suggestions
    }

    this.queryCache.set(query, plan)
    return plan
  }

  /**
   * Get index recommendations for a table
   */
  async getIndexRecommendations(tableName: string): Promise<IndexRecommendation[]> {
    const recommendations: IndexRecommendation[] = []

    try {
      const supabase = await createClient()

      // Get table statistics
      const { data: tableStats } = await supabase
        .rpc('get_table_statistics', { table_name: tableName })
        .single()

      // Common index recommendations
      const commonPatterns = [
        {
          pattern: 'foreign_key',
          columns: ['salon_id'],
          reason: 'Foreign key column should be indexed for JOIN performance',
          improvement: 40
        },
        {
          pattern: 'timestamp',
          columns: ['created_at'],
          reason: 'Timestamp columns used for sorting should be indexed',
          improvement: 30
        },
        {
          pattern: 'status',
          columns: ['status'],
          reason: 'Status columns used for filtering should be indexed',
          improvement: 25
        },
        {
          pattern: 'composite',
          columns: ['salon_id', 'created_at'],
          reason: 'Composite index for common filter + sort combination',
          improvement: 50
        }
      ]

      // Check each pattern
      for (const pattern of commonPatterns) {
        recommendations.push({
          table: tableName,
          columns: pattern.columns,
          type: 'btree',
          reason: pattern.reason,
          estimatedImprovement: pattern.improvement
        })
      }

      return recommendations
    } catch (error) {
      console.error('Failed to get index recommendations:', error)
      return recommendations
    }
  }

  /**
   * Optimize a query automatically
   */
  optimizeQuery(query: string): string {
    let optimized = query

    // Replace SELECT * with specific columns (requires schema knowledge)
    if (query.toLowerCase().includes('select *')) {
      console.warn('SELECT * detected - specify columns for better performance')
    }

    // Add LIMIT if missing for SELECT queries without aggregation
    const queryLower = optimized.toLowerCase()
    if (queryLower.includes('select') &&
        !queryLower.includes('limit') &&
        !queryLower.includes('count(') &&
        !queryLower.includes('sum(') &&
        !queryLower.includes('avg(')) {
      optimized += ' LIMIT 1000' // Default limit
    }

    // Convert NOT IN to NOT EXISTS for better performance
    optimized = optimized.replace(
      /NOT IN\s*\(\s*SELECT/gi,
      'NOT EXISTS (SELECT 1 FROM'
    )

    // Convert OR to UNION for better index usage (simplified)
    // This is a complex optimization that requires careful query parsing

    return optimized
  }

  /**
   * Batch multiple queries for efficiency
   */
  createBatchQuery(queries: string[]): string {
    // Combine multiple queries into a single transaction
    return `
      BEGIN;
      ${queries.join(';\n')};
      COMMIT;
    `
  }

  /**
   * Create cursor-based pagination query
   */
  createPaginatedQuery(
    baseQuery: string,
    cursor?: string,
    limit = 20
  ): string {
    const whereClause = cursor ? `WHERE id > '${cursor}'` : ''

    // Extract the FROM clause
    const fromMatch = baseQuery.match(/FROM\s+(\S+)/i)
    if (!fromMatch) return baseQuery

    const table = fromMatch[1]

    return `
      ${baseQuery}
      ${whereClause}
      ORDER BY id ASC
      LIMIT ${limit}
    `
  }

  /**
   * Monitor and track query performance
   */
  async executeWithTracking<T>(
    query: string,
    executor: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now()

    try {
      const result = await executor()
      const executionTime = performance.now() - startTime

      // Track query performance
      const rowCount = Array.isArray(result) ? result.length : 1
      performanceTracker.trackQuery(query, executionTime, rowCount)

      // Log slow queries
      if (executionTime > 1000) {
        console.warn(`Slow query detected (${executionTime}ms):`, query.substring(0, 100))
        const plan = await this.analyzeQuery(query)
        if (plan.suggestions.length > 0) {
          console.warn('Optimization suggestions:', plan.suggestions)
        }
      }

      return result
    } catch (error) {
      const executionTime = performance.now() - startTime
      performanceTracker.trackQuery(query, executionTime, 0)
      throw error
    }
  }

  /**
   * Preload data that will likely be needed
   */
  async prefetchRelated(
    mainQuery: string,
    relatedQueries: string[]
  ): Promise<void> {
    // Execute related queries in parallel for efficiency
    await Promise.all(
      relatedQueries.map(query =>
        this.executeWithTracking(query, async () => {
          // Execute query (implementation depends on your data layer)
          // Prefetching query
        })
      )
    )
  }

  /**
   * Get query execution plan
   */
  async getExecutionPlan(query: string): Promise<any> {
    const supabase = await createClient()

    try {
      const { data, error } = await supabase
        .rpc('explain_query', { query_text: `EXPLAIN ANALYZE ${query}` })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Failed to get execution plan:', error)
      return null
    }
  }
}

export const queryOptimizer = QueryOptimizer.getInstance()