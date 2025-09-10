// import { ProfileHeader } from '@/components/sections/staff/profile/header'
// import { PersonalInfo } from '@/components/sections/staff/profile/personal'
// import { WorkInfo } from '@/components/sections/staff/profile/work'
// import { Skills } from '@/components/sections/staff/profile/skills'
// import { Availability } from '@/components/sections/staff/profile/availability'

export default function StaffProfilePage() {
  return (
    <div className="flex-1 space-y-8 p-8">
      {/* <ProfileHeader /> */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* <PersonalInfo /> */}
        <div className="border rounded-lg p-6">
          <h3 className="font-semibold mb-2">Personal Information</h3>
          <p className="text-muted-foreground">Your personal details will appear here</p>
        </div>
        {/* <WorkInfo /> */}
        <div className="border rounded-lg p-6">
          <h3 className="font-semibold mb-2">Work Information</h3>
          <p className="text-muted-foreground">Your work details will appear here</p>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {/* <Skills /> */}
        <div className="border rounded-lg p-6">
          <h3 className="font-semibold mb-2">Skills & Services</h3>
          <p className="text-muted-foreground">Your skills will appear here</p>
        </div>
        {/* <Availability /> */}
        <div className="border rounded-lg p-6">
          <h3 className="font-semibold mb-2">Availability</h3>
          <p className="text-muted-foreground">Your schedule will appear here</p>
        </div>
      </div>
    </div>
  )
}