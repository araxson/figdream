// Database Enum Types - Shared across all domains

export type AppointmentStatus =
  | "draft"
  | "pending"
  | "confirmed"
  | "checked_in"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show"
  | "rescheduled"

export type AuditCategory =
  | "authentication"
  | "data_modification"
  | "access_control"
  | "system_monitoring"
  | "compliance"
  | "maintenance"
  | "security"
  | "performance"

export type AuditEventType =
  | "user_action"
  | "system_event"
  | "data_access"
  | "authentication"
  | "authorization"
  | "api_call"
  | "security_event"

export type AuditSeverity =
  | "info"
  | "debug"
  | "warning"
  | "error"
  | "critical"

export type ComplianceType =
  | "gdpr"
  | "hipaa"
  | "sox"
  | "pci_dss"
  | "ccpa"
  | "iso27001"
  | "security_audit"
  | "data_retention"

export type DataOperation =
  | "INSERT"
  | "UPDATE"
  | "DELETE"

export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday"

export type IncidentSeverity =
  | "low"
  | "medium"
  | "high"
  | "critical"

export type IncidentStatus =
  | "detected"
  | "investigating"
  | "contained"
  | "resolved"
  | "false_positive"

export type LoyaltyTransactionType =
  | "earned"
  | "redeemed"
  | "expired"
  | "adjusted"
  | "bonus"

export type NotificationChannel =
  | "email"
  | "sms"
  | "push"
  | "in_app"
  | "whatsapp"

export type NotificationStatus =
  | "queued"
  | "sending"
  | "sent"
  | "delivered"
  | "opened"
  | "clicked"
  | "failed"
  | "bounced"
  | "unsubscribed"

export type NotificationType =
  | "appointment_confirmation"
  | "appointment_reminder"
  | "appointment_cancelled"
  | "appointment_rescheduled"
  | "promotion"
  | "review_request"
  | "loyalty_update"
  | "staff_message"
  | "system_alert"
  | "welcome"
  | "birthday"
  | "other"

export type PaymentMethod =
  | "cash"
  | "card"
  | "online"
  | "wallet"
  | "loyalty_points"
  | "gift_card"
  | "other"

export type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "refunded"
  | "partially_refunded"
  | "cancelled"

export type PeriodType =
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "yearly"

export type ProficiencyLevel =
  | "trainee"
  | "beginner"
  | "intermediate"
  | "advanced"
  | "expert"
  | "master"

export type RoleType =
  | "super_admin"
  | "platform_admin"
  | "tenant_owner"
  | "salon_owner"
  | "salon_manager"
  | "senior_staff"
  | "staff"
  | "junior_staff"
  | "customer"
  | "vip_customer"
  | "guest"

export type SecurityIncidentType =
  | "failed_login"
  | "brute_force"
  | "suspicious_activity"
  | "data_breach"
  | "unauthorized_access"
  | "privilege_escalation"
  | "high_risk_event"
  | "malware_detected"
  | "sql_injection"
  | "xss_attempt"

export type ServiceStatus =
  | "active"
  | "inactive"
  | "discontinued"
  | "seasonal"

export type StaffStatus =
  | "available"
  | "busy"
  | "break"
  | "off_duty"
  | "vacation"
  | "sick_leave"
  | "training"

export type ThreadPriority =
  | "low"
  | "normal"
  | "high"
  | "urgent"

export type ThreadStatus =
  | "open"
  | "in_progress"
  | "resolved"
  | "closed"
  | "archived"

export type TimeOffStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled"

// Database Enums Interface for compatibility
export interface DatabaseEnums {
  appointment_status: AppointmentStatus
  audit_category: AuditCategory
  audit_event_type: AuditEventType
  audit_severity: AuditSeverity
  compliance_type: ComplianceType
  data_operation: DataOperation
  day_of_week: DayOfWeek
  incident_severity: IncidentSeverity
  incident_status: IncidentStatus
  loyalty_transaction_type: LoyaltyTransactionType
  notification_channel: NotificationChannel
  notification_status: NotificationStatus
  notification_type: NotificationType
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  period_type: PeriodType
  proficiency_level: ProficiencyLevel
  role_type: RoleType
  security_incident_type: SecurityIncidentType
  service_status: ServiceStatus
  staff_status: StaffStatus
  thread_priority: ThreadPriority
  thread_status: ThreadStatus
  time_off_status: TimeOffStatus
}