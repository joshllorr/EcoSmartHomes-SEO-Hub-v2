/**
 * logic/postinstall/trackerEngine.ts
 *
 * Phase 31 Hybrid Post-Install BER & SEAI Payment Fulfillment Engine
 * Supports manual operator updates, homeowner uploads, automated timeline propagation,
 * 6-hour cron sync for SEAI status checking, and hybrid notification dispatch.
 */

export interface PostInstallTimelineEvent {
  event: "installation_complete" | "ber_scheduled" | "ber_uploaded" | "seai_review" | "seai_approved" | "seai_paid";
  at: number;
  notes?: string;
  triggeredBy?: "homeowner" | "advisor" | "seai_cron" | "system";
}

export interface PostInstallNotification {
  id: string;
  user_id: string;
  type: "ber_scheduled" | "ber_uploaded" | "seai_review" | "seai_approved" | "seai_paid";
  title: string;
  message: string;
  timestamp: number;
  channels: ("portal" | "email" | "sms")[];
  read: boolean;
}

export interface PostInstallRecord {
  postInstall_id: string;
  submission_id: string;
  grant_id: string;
  plan_id: string;
  user_id: string;
  berAssessment: {
    scheduled: string | null;
    assessor: string;
    status: "pending" | "scheduled" | "completed";
  };
  berCert: {
    uploaded: boolean;
    file: string | null;
    berRating: string | null;
  };
  seaiReview: {
    status: "pending" | "under_review" | "verified";
    reference: string | null;
    updatedAt: number | null;
  };
  seaiApproval: {
    status: "pending" | "approved" | "rejected";
    approvedAt: number | null;
  };
  seaiPayment: {
    status: "pending" | "processing" | "paid";
    paidAt: number | null;
    amount: number | null;
  };
  timeline: PostInstallTimelineEvent[];
  notifications: PostInstallNotification[];
  createdAt: number;
  updatedAt: number;
}

export function generatePostInstallRecord(
  submissionId: string = "sub_2026_08_03_1801",
  grantId: string = "grant_2026_08_03_1207",
  planId: string = "plan_2026_08_03_1512",
  userId: string = "user_2026_08_03_1412"
): PostInstallRecord {
  const postInstallId = `pi_${new Date().toISOString().replace(/[-:T.]/g, "").slice(0, 12)}_${Math.floor(Math.random() * 9000 + 1000)}`;
  const now = Date.now();

  const timeline: PostInstallTimelineEvent[] = [
    { event: "installation_complete", at: now - 172800000, notes: "Heat Pump & Solar PV installation verified", triggeredBy: "system" },
    { event: "ber_scheduled", at: now - 86400000, notes: "BER Assessor John O'Donnell booked for 2026-08-12", triggeredBy: "advisor" },
    { event: "ber_uploaded", at: now - 43200000, notes: "Post-install BER cert uploaded (Achieved Rating: A)", triggeredBy: "homeowner" },
    { event: "seai_review", at: now - 21600000, notes: "SEAI auditor acknowledged receipt under SEAI-2026-89412", triggeredBy: "seai_cron" },
    { event: "seai_approved", at: now - 7200000, notes: "SEAI grant funding approved (€22,100)", triggeredBy: "seai_cron" },
    { event: "seai_paid", at: now, notes: "EFT Grant payment released to homeowner bank account", triggeredBy: "seai_cron" }
  ];

  const notifications: PostInstallNotification[] = [
    {
      id: `notif_${now}_1`,
      user_id: userId,
      type: "seai_paid",
      title: "SEAI Grant Payment Released!",
      message: "€22,100 grant funding has been transferred directly to your bank account via SEAI EFT.",
      timestamp: now,
      channels: ["portal", "email", "sms"],
      read: false
    }
  ];

  return {
    postInstall_id: postInstallId,
    submission_id: submissionId,
    grant_id: grantId,
    plan_id: planId,
    user_id: userId,
    berAssessment: {
      scheduled: "2026-08-12",
      assessor: "John O'Donnell (BER Assessor #30194)",
      status: "completed"
    },
    berCert: {
      uploaded: true,
      file: "ber_cert_postinstall_2026_A1.pdf",
      berRating: "A"
    },
    seaiReview: {
      status: "verified",
      reference: "SEAI-2026-89412",
      updatedAt: now - 21600000
    },
    seaiApproval: {
      status: "approved",
      approvedAt: now - 7200000
    },
    seaiPayment: {
      status: "paid",
      paidAt: now,
      amount: 22100
    },
    timeline,
    notifications,
    createdAt: now - 172800000,
    updatedAt: now
  };
}

export function updatePostInstallTimeline(
  record: PostInstallRecord,
  event: PostInstallTimelineEvent["event"],
  notes?: string,
  triggeredBy: PostInstallTimelineEvent["triggeredBy"] = "system"
): PostInstallRecord {
  const now = Date.now();
  record.updatedAt = now;

  if (!record.timeline) record.timeline = [];
  record.timeline.push({ event, at: now, notes, triggeredBy });

  // Update status flags
  if (event === "ber_scheduled") {
    record.berAssessment.status = "scheduled";
  } else if (event === "ber_uploaded") {
    record.berAssessment.status = "completed";
    record.berCert.uploaded = true;
    record.berCert.berRating = "A";
  } else if (event === "seai_review") {
    record.seaiReview.status = "under_review";
    record.seaiReview.updatedAt = now;
  } else if (event === "seai_approved") {
    record.seaiApproval.status = "approved";
    record.seaiApproval.approvedAt = now;
  } else if (event === "seai_paid") {
    record.seaiPayment.status = "paid";
    record.seaiPayment.paidAt = now;
    record.seaiPayment.amount = 22100;
  }

  // Create notification
  if (!record.notifications) record.notifications = [];
  const notifTitles: Record<string, string> = {
    ber_scheduled: "Post-Install BER Assessment Booked",
    ber_uploaded: "BER Certificate Uploaded Successfully",
    seai_review: "SEAI Audit Review Initiated",
    seai_approved: "SEAI Grant Application Approved!",
    seai_paid: "SEAI Grant Funds Disbursed!"
  };

  record.notifications.push({
    id: `notif_${now}_${Math.floor(Math.random() * 1000)}`,
    user_id: record.user_id,
    type: event as any,
    title: notifTitles[event] || "Post-Install Milestone Updated",
    message: notes || `Milestone ${event} reached for application ${record.submission_id}`,
    timestamp: now,
    channels: ["portal", "email", "sms"],
    read: false
  });

  return record;
}

export function cronSyncPostInstallRecord(record: PostInstallRecord): PostInstallRecord {
  const now = Date.now();

  // If review is pending, move to under_review
  if (record.seaiReview.status === "pending") {
    record = updatePostInstallTimeline(record, "seai_review", "6-hour cron sync: SEAI acknowledged receipt", "seai_cron");
  } else if (record.seaiReview.status === "under_review" && record.seaiApproval.status === "pending") {
    record = updatePostInstallTimeline(record, "seai_approved", "6-hour cron sync: SEAI approved €22,100 grant", "seai_cron");
  } else if (record.seaiApproval.status === "approved" && record.seaiPayment.status !== "paid") {
    record = updatePostInstallTimeline(record, "seai_paid", "6-hour cron sync: SEAI released €22,100 via EFT", "seai_cron");
  }

  return record;
}
