import { supabaseAdmin } from "./supabase.js";

const demoUsers = [
  { email: "citizen.demo@civicmysuru.local", password: "CivicDemo123!", name: "Demo Citizen", role: "CITIZEN" },
  { email: "authority.demo@civicmysuru.local", password: "CivicDemo123!", name: "Demo Authority", role: "AUTHORITY" }
];

async function getOrCreateUser(item) {
  const { data: existing } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const found = existing.users.find(u => u.email === item.email);
  let user = found;

  if (!user) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: item.email,
      password: item.password,
      email_confirm: true
    });
    if (error) throw error;
    user = data.user;
  }

  const { error: profileError } = await supabaseAdmin.from("users").upsert({
    id: user.id,
    name: item.name,
    email: item.email,
    role: item.role
  });
  if (profileError) throw profileError;

  return user;
}

const issues = [
  ["GARBAGE", "Garbage not collected near Vijayanagar", "Household garbage has not been collected for four days.", 12.2958, 76.6394, "Vijayanagar, Mysuru", "HIGH", "SUBMITTED"],
  ["STREETLIGHT", "Broken streetlight near Kuvempunagar", "The streetlight has been off for several nights.", 12.2802, 76.6238, "Kuvempunagar, Mysuru", "MEDIUM", "ASSIGNED"],
  ["POTHOLE", "Large pothole on Hunsur Road", "A large pothole is affecting traffic and two-wheelers.", 12.3235, 76.6104, "Hunsur Road, Mysuru", "HIGH", "ACKNOWLEDGED"],
  ["DRAINAGE", "Blocked drain after rainfall", "Drainage is overflowing onto the road.", 12.3052, 76.6552, "Saraswathipuram, Mysuru", "HIGH", "IN_PROGRESS"],
  ["WATER", "Water leakage near Hebbal", "A public water pipe has been leaking for several days.", 12.3510, 76.6260, "Hebbal, Mysuru", "CRITICAL", "IN_PROGRESS"],
  ["ILLEGAL_DUMPING", "Repeated dumping beside empty site", "Waste is being dumped repeatedly at the same location.", 12.3071, 76.6512, "Nazarbad, Mysuru", "HIGH", "RESOLVED"],
  ["GARBAGE", "Garbage complaint outside service zone", "Submitted location is outside the supported civic service zone.", 12.3400, 76.7000, "Outer Mysuru", "LOW", "REJECTED"]
];

async function run() {
  const citizen = await getOrCreateUser(demoUsers[0]);
  const authority = await getOrCreateUser(demoUsers[1]);

  const { data: existing } = await supabaseAdmin
    .from("complaints")
    .select("id, title")
    .in("title", issues.map(x => x[1]));

  const existingTitles = new Set((existing || []).map(x => x.title));

  for (const [issueType, title, description, lat, lng, locationText, priority, status] of issues) {
    if (existingTitles.has(title)) continue;

    const { data: complaint, error } = await supabaseAdmin
      .from("complaints")
      .insert({
        citizen_id: citizen.id,
        issue_type: issueType,
        title,
        description,
        location_lat: lat,
        location_lng: lng,
        location_text: locationText,
        priority,
        status,
        assigned_authority: ["ASSIGNED", "ACKNOWLEDGED", "IN_PROGRESS"].includes(status)
          ? "Mysuru City Corporation"
          : null,
        resolved_at: status === "RESOLVED" ? new Date().toISOString() : null,
        risk_score: ["HIGH", "CRITICAL"].includes(priority) ? 82 : 34,
        risk_level: ["HIGH", "CRITICAL"].includes(priority) ? "HIGH" : "MEDIUM"
      })
      .select()
      .single();

    if (error) throw error;

    const flow = ["SUBMITTED"];
    if (["ASSIGNED", "ACKNOWLEDGED", "IN_PROGRESS", "RESOLVED"].includes(status)) flow.push("ASSIGNED");
    if (["ACKNOWLEDGED", "IN_PROGRESS", "RESOLVED"].includes(status)) flow.push("ACKNOWLEDGED");
    if (["IN_PROGRESS", "RESOLVED"].includes(status)) flow.push("IN_PROGRESS");
    if (status === "RESOLVED") flow.push("RESOLVED");
    if (status === "REJECTED") flow.push("REJECTED");

    const history = flow.map((newStatus, i) => ({
      complaint_id: complaint.id,
      old_status: i === 0 ? null : flow[i - 1],
      new_status: newStatus,
      remarks: i === 0 ? "Complaint submitted" : `Demo transition to ${newStatus}`,
      changed_by: i === 0 ? citizen.id : authority.id
    }));

    const { error: historyError } = await supabaseAdmin
      .from("status_history")
      .insert(history);

    if (historyError) throw historyError;

    if (["HIGH", "CRITICAL"].includes(priority)) {
      const { error: riskError } = await supabaseAdmin
        .from("risk_assessments")
        .insert({
          complaint_id: complaint.id,
          score: 82,
          level: "HIGH",
          reasons: ["High priority issue", "Demo risk assessment"]
        });
      if (riskError) throw riskError;
    }
  }

  console.log("Demo seed complete.");
  console.log("Citizen:", demoUsers[0].email, demoUsers[0].password);
  console.log("Authority:", demoUsers[1].email, demoUsers[1].password);
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
