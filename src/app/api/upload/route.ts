import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/database/supabase/server'
import { getUser } from '@/lib/data-access/auth'
import { logError, logCriticalError, logApiError } from '@/src/lib/errors/logger'
import crypto from 'crypto'
import path from 'path'
// Upload configuration
const UPLOAD_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  allowedDocumentTypes: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  allowedBuckets: ['avatars', 'logos', 'documents', 'gallery'] as const,
} as const
type AllowedBucket = typeof UPLOAD_CONFIG.allowedBuckets[number]
// Types for upload request
interface _UploadRequest {
  bucket: AllowedBucket
  folder?: string
  filename?: string
  public?: boolean
}
interface UploadResult {
  success: boolean
  url?: string
  path?: string
  publicUrl?: string
  error?: string
  metadata?: {
    size: number
    type: string
    originalName: string
    uploadedBy: string
  }
}
// Validate file type based on bucket
function validateFileType(file: File, bucket: AllowedBucket): boolean {
  const { type } = file
  switch (bucket) {
    case 'avatars':
    case 'logos':
    case 'gallery':
      return UPLOAD_CONFIG.allowedImageTypes.includes(type)
    case 'documents':
      return UPLOAD_CONFIG.allowedDocumentTypes.includes(type)
    default:
      return false
  }
}
// Generate secure filename
function generateSecureFilename(originalName: string, userId: string): string {
  const ext = path.extname(originalName)
  const timestamp = Date.now()
  const randomString = crypto.randomBytes(8).toString('hex')
  const userPrefix = userId.slice(0, 8)
  return `${userPrefix}_${timestamp}_${randomString}${ext}`
}
// Get file path based on bucket and folder
function getFilePath(
  bucket: AllowedBucket,
  folder: string | undefined,
  filename: string,
  userId: string
): string {
  const basePath = folder ? `${folder}/${filename}` : filename
  switch (bucket) {
    case 'avatars':
      return `users/${userId}/avatar/${filename}`
    case 'logos':
      return `salons/${folder || 'default'}/${filename}`
    case 'documents':
      return `users/${userId}/documents/${basePath}`
    case 'gallery':
      return `gallery/${folder || 'default'}/${basePath}`
    default:
      return basePath
  }
}
// Check user permissions for bucket
async function checkUploadPermissions(
  userId: string,
  userRole: string | null,
  bucket: AllowedBucket,
  _folder?: string
): Promise<{ allowed: boolean; reason?: string }> {
  switch (bucket) {
    case 'avatars':
      // Users can upload their own avatars
      return { allowed: true }
    case 'logos':
      // Only salon owners and admins can upload logos
      if (!['salon_owner', 'location_manager', 'super_admin'].includes(userRole || '')) {
        return { 
          allowed: false, 
          reason: 'Insufficient permissions to upload logos' 
        }
      }
      return { allowed: true }
    case 'documents':
      // All authenticated users can upload documents
      return { allowed: true }
    case 'gallery':
      // Staff and above can upload gallery images
      if (!['staff', 'location_manager', 'salon_owner', 'super_admin'].includes(userRole || '')) {
        return { 
          allowed: false, 
          reason: 'Insufficient permissions to upload gallery images' 
        }
      }
      return { allowed: true }
    default:
      return { 
        allowed: false, 
        reason: 'Invalid upload bucket' 
      }
  }
}
// Upload file to Supabase Storage
async function uploadFile(
  file: File,
  filePath: string,
  bucket: AllowedBucket,
  isPublic: boolean = false
): Promise<UploadResult> {
  try {
    const supabase = await createClient()
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false, // Don't overwrite existing files
      })
    if (error) {
      logError(
        `Failed to upload file to ${bucket}/${filePath}: ${error.message}`,
        'medium',
        'api',
        { bucket, filePath, error: error.message }
      )
      return {
        success: false,
        error: error.message
      }
    }
    // Get public URL if needed
    let publicUrl: string | undefined
    if (isPublic) {
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path)
      publicUrl = urlData.publicUrl
    }
    // Get signed URL for private files
    let signedUrl: string | undefined
    if (!isPublic) {
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from(bucket)
        .createSignedUrl(data.path, 3600) // 1 hour expiry
      if (signedUrlError) {
        logError(
          `Failed to create signed URL for ${bucket}/${data.path}: ${signedUrlError.message}`,
          'low',
          'api'
        )
      } else {
        signedUrl = signedUrlData.signedUrl
      }
    }
    return {
      success: true,
      url: signedUrl || publicUrl,
      path: data.path,
      publicUrl: isPublic ? publicUrl : undefined,
      metadata: {
        size: file.size,
        type: file.type,
        originalName: file.name,
        uploadedBy: 'current-user' // Will be updated with actual user ID
      }
    }
  } catch (_error) {
    logCriticalError(
      error as Error,
      'api',
      { context: 'file_upload', bucket, filePath }
    )
    return {
      success: false,
      error: (error as Error).message
    }
  }
}
// POST handler for file uploads
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Check authentication
    const { user, error: authError } = await getUser()
    if (authError || !user) {
      logApiError(
        'Unauthorized upload attempt',
        '/api/upload',
        401
      )
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    // Get user role
    const supabase = await createClient()
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle()
    const userRole = roleData?.role || 'customer'
    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const bucket = formData.get('bucket') as AllowedBucket
    const folder = formData.get('folder') as string | undefined
    const filename = formData.get('filename') as string | undefined
    const isPublic = formData.get('public') === 'true'
    // Validate required fields
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }
    if (!bucket || !UPLOAD_CONFIG.allowedBuckets.includes(bucket)) {
      return NextResponse.json(
        { 
          error: 'Invalid bucket',
          allowedBuckets: UPLOAD_CONFIG.allowedBuckets
        },
        { status: 400 }
      )
    }
    // Validate file size
    if (file.size > UPLOAD_CONFIG.maxFileSize) {
      return NextResponse.json(
        { 
          error: 'File too large',
          maxSize: UPLOAD_CONFIG.maxFileSize,
          receivedSize: file.size
        },
        { status: 400 }
      )
    }
    // Validate file type
    if (!validateFileType(file, bucket)) {
      const allowedTypes = bucket === 'documents' 
        ? UPLOAD_CONFIG.allowedDocumentTypes
        : UPLOAD_CONFIG.allowedImageTypes
      return NextResponse.json(
        { 
          error: 'Invalid file type',
          allowedTypes,
          receivedType: file.type
        },
        { status: 400 }
      )
    }
    // Check upload permissions
    const permissionCheck = await checkUploadPermissions(user.id, userRole, bucket, folder)
    if (!permissionCheck.allowed) {
      return NextResponse.json(
        { error: permissionCheck.reason },
        { status: 403 }
      )
    }
    // Generate secure filename
    const secureFilename = filename 
      ? generateSecureFilename(filename, user.id)
      : generateSecureFilename(file.name, user.id)
    // Get file path
    const filePath = getFilePath(bucket, folder, secureFilename, user.id)
    // Uploading file: ${file.name} (${file.size} bytes) to ${bucket}/${filePath}
    // Upload file
    const result = await uploadFile(file, filePath, bucket, isPublic)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Upload failed' },
        { status: 500 }
      )
    }
    // Update metadata with actual user ID
    if (result.metadata) {
      result.metadata.uploadedBy = user.id
    }
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        url: result.url,
        path: result.path,
        publicUrl: result.publicUrl,
        bucket,
        filename: secureFilename,
        originalName: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
        uploadedBy: user.id,
        isPublic
      }
    })
  } catch (_error) {
    logCriticalError(
      error as Error,
      'api',
      { context: 'upload_handler', endpoint: '/api/upload' }
    )
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to upload file'
      },
      { status: 500 }
    )
  }
}
// DELETE handler for file deletion
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    // Check authentication
    const { user, error: authError } = await getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    const { searchParams } = new URL(request.url)
    const bucket = searchParams.get('bucket') as AllowedBucket
    const filePath = searchParams.get('path')
    if (!bucket || !filePath) {
      return NextResponse.json(
        { error: 'Bucket and path are required' },
        { status: 400 }
      )
    }
    if (!UPLOAD_CONFIG.allowedBuckets.includes(bucket)) {
      return NextResponse.json(
        { error: 'Invalid bucket' },
        { status: 400 }
      )
    }
    // Check if user has permission to delete this file
    const supabase = await createClient()
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle()
    const userRole = roleData?.role || 'customer'
    const permissionCheck = await checkUploadPermissions(user.id, userRole, bucket)
    if (!permissionCheck.allowed) {
      return NextResponse.json(
        { error: permissionCheck.reason },
        { status: 403 }
      )
    }
    // Additional check: users can only delete their own files (except super_admin)
    if (userRole !== 'super_admin' && !filePath.includes(user.id)) {
      return NextResponse.json(
        { error: 'Can only delete your own files' },
        { status: 403 }
      )
    }
    const supabase = await createClient()
    // Delete file from storage
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath])
    if (error) {
      logError(
        `Failed to delete file ${bucket}/${filePath}: ${error.message}`,
        'medium',
        'api',
        { bucket, filePath, userId: user.id }
      )
      return NextResponse.json(
        { error: 'Failed to delete file' },
        { status: 500 }
      )
    }
    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
      bucket,
      path: filePath
    })
  } catch (_error) {
    logCriticalError(
      error as Error,
      'api',
      { context: 'upload_delete_handler', endpoint: '/api/upload' }
    )
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to delete file'
      },
      { status: 500 }
    )
  }
}
// GET handler for upload status and configuration
export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    const { user, error: authError } = await getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    const supabase = await createClient()
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle()
    const userRole = roleData?.role || 'customer'
    // Get allowed buckets for this user
    const allowedBuckets: AllowedBucket[] = []
    for (const bucket of UPLOAD_CONFIG.allowedBuckets) {
      const permissionCheck = await checkUploadPermissions(user.id, userRole, bucket)
      if (permissionCheck.allowed) {
        allowedBuckets.push(bucket)
      }
    }
    return NextResponse.json({
      status: 'active',
      userId: user.id,
      userRole,
      configuration: {
        maxFileSize: UPLOAD_CONFIG.maxFileSize,
        allowedImageTypes: UPLOAD_CONFIG.allowedImageTypes,
        allowedDocumentTypes: UPLOAD_CONFIG.allowedDocumentTypes,
        allowedBuckets,
      },
      timestamp: new Date().toISOString()
    })
  } catch (_error) {
    logError(
      error as Error,
      'low',
      'api',
      { context: 'upload_status_check' }
    )
    return NextResponse.json(
      { error: 'Failed to get upload status' },
      { status: 500 }
    )
  }
}