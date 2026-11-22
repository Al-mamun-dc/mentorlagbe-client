import { getDatabase } from "@/lib/db"
import { getUserPlanInfo, type SubscriptionPlan } from "@/lib/subscription"

export interface StudentDashboardStats {
  totalApplied: number
  acceptedApplications: number
  pendingApplications: number
  currentPlan: SubscriptionPlan
}

export interface TutorDashboardStats {
  totalTuitionsPosted: number
  activeApprovedTuitions: number
  totalApplicantsReceived: number
  currentPlan: SubscriptionPlan
}

function asPlan(value: unknown): SubscriptionPlan {
  return value === "pro" ? "pro" : "free"
}

export async function getStudentDashboardStats(userId: string): Promise<StudentDashboardStats> {
  const db = await getDatabase()
  const [totalApplied, acceptedApplications, pendingApplications, planInfo] = await Promise.all([
    db.collection("application").countDocuments({ studentId: userId }),
    db.collection("application").countDocuments({ studentId: userId, status: "accepted" }),
    db.collection("application").countDocuments({ studentId: userId, status: "pending" }),
    getUserPlanInfo(userId),
  ])

  return {
    totalApplied,
    acceptedApplications,
    pendingApplications,
    currentPlan: asPlan(planInfo?.plan),
  }
}

export async function getTutorDashboardStats(userId: string): Promise<TutorDashboardStats> {
  const db = await getDatabase()
  const tuitions = await db
    .collection("tution")
    .find({ tutorId: userId }, { projection: { _id: 1, approvalStatus: 1, isActive: 1 } })
    .toArray()

  const totalTuitionsPosted = tuitions.length
  const activeApprovedTuitions = tuitions.filter(
    (t) => t.approvalStatus === "approved" && t.isActive === true
  ).length

  const tuitionIds = tuitions.map((t) => String(t._id))
  const totalApplicantsReceived =
    tuitionIds.length === 0
      ? 0
      : await db.collection("application").countDocuments({ tuitionId: { $in: tuitionIds } })

  const planInfo = await getUserPlanInfo(userId)

  return {
    totalTuitionsPosted,
    activeApprovedTuitions,
    totalApplicantsReceived,
    currentPlan: asPlan(planInfo?.plan),
  }
}
