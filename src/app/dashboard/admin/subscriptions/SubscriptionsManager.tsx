"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  adminActivateSubscription,
  adminCancelSubscription,
} from "./actions";

export type SubRow = {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  planName: string | null;
  billingCycle: string | null;
  status: string;
  expiresAt: string | null;
  startedAt: string | null;
};

export type PlanOption = { id: string; name: string };

export default function SubscriptionsManager({
  subscriptions,
  plans,
}: {
  subscriptions: SubRow[];
  plans: PlanOption[];
}) {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [planId, setPlanId] = useState(plans[0]?.id ?? "");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function activate(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    if (!userId.trim() || !planId) {
      setMsg("A user ID and plan are required.");
      return;
    }
    setBusy(true);
    const res = await adminActivateSubscription({
      userId: userId.trim(),
      planId,
      billingCycle,
    });
    setBusy(false);
    if (!res.ok) setMsg(res.error ?? "Activation failed.");
    else {
      setMsg("Subscription activated.");
      setUserId("");
      router.refresh();
    }
  }

  async function cancel(id: string) {
    setBusy(true);
    const res = await adminCancelSubscription(id);
    setBusy(false);
    if (!res.ok) setMsg(res.error ?? "Cancel failed.");
    else router.refresh();
  }

  return (
    <div>
      {msg && (
        <div role="status" style={{ margin: "0.5rem 0" }}>
          {msg}
        </div>
      )}

      <form
        onSubmit={activate}
        style={{
          display: "flex",
          gap: "0.5rem",
          flexWrap: "wrap",
          alignItems: "end",
          margin: "1rem 0",
          padding: "1rem",
          border: "1px solid var(--border-color)",
          borderRadius: 8,
        }}
      >
        <label style={{ display: "flex", flexDirection: "column" }}>
          <span>User ID</span>
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="mentee user UUID"
            style={{ minWidth: 300 }}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column" }}>
          <span>Plan</span>
          <select value={planId} onChange={(e) => setPlanId(e.target.value)}>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: "flex", flexDirection: "column" }}>
          <span>Billing</span>
          <select
            value={billingCycle}
            onChange={(e) =>
              setBillingCycle(e.target.value as "monthly" | "yearly")
            }
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </label>
        <button type="submit" disabled={busy}>
          Activate
        </button>
      </form>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>User</th>
            <th>Plan</th>
            <th>Status</th>
            <th>Renewal</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {subscriptions.length === 0 ? (
            <tr>
              <td colSpan={5}>No subscriptions yet.</td>
            </tr>
          ) : (
            subscriptions.map((s) => (
              <tr key={s.id} style={{ borderTop: "1px solid var(--border-color)" }}>
                <td>
                  <div>{s.userName ?? "—"}</div>
                  <div style={{ fontSize: "0.85em", opacity: 0.7 }}>
                    {s.userEmail ?? s.userId}
                  </div>
                </td>
                <td>{s.planName ?? "—"}</td>
                <td>{s.status}</td>
                <td>
                  {s.expiresAt
                    ? new Date(s.expiresAt).toLocaleDateString()
                    : "—"}
                </td>
                <td>
                  {s.status !== "cancelled" && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => cancel(s.id)}
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
