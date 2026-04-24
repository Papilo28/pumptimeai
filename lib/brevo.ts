/**
 * Brevo (formerly Sendinblue) contact creation utility.
 * Creates or updates a contact with full lead details for
 * email, SMS, and ad retargeting workflows.
 */

interface BrevoContactPayload {
  email: string;
  name?: string;
  phone?: string;
  company?: string;
  plan?: string;
  source?: string;
}

export async function createBrevoContact(payload: BrevoContactPayload): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.warn("BREVO_API_KEY not set — skipping contact creation");
    return;
  }

  const [firstName, ...rest] = (payload.name || "").trim().split(" ");
  const lastName = rest.join(" ") || "";

  // Brevo requires SMS in E.164 format — already enforced on the frontend
  const smsNumber = payload.phone?.replace(/\s/g, "") || "";

  const body: Record<string, unknown> = {
    email: payload.email,
    updateEnabled: true,           // update if contact already exists
    attributes: {
      FIRSTNAME: firstName || "",
      LASTNAME: lastName,
      COMPANY: payload.company || "",
      SMS: smsNumber,
      PLAN: payload.plan || "demo",
      SOURCE: payload.source || "pumptimeai.com",
      SIGNUP_DATE: new Date().toISOString().split("T")[0],
    },
  };

  // Add to list if BREVO_LIST_ID is configured
  const listId = process.env.BREVO_LIST_ID ? parseInt(process.env.BREVO_LIST_ID, 10) : null;
  if (listId) body.listIds = [listId];

  try {
    const res = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    if (res.ok || res.status === 204) {
      console.log(`Brevo contact created/updated: ${payload.email}`);
    } else {
      const err = await res.json().catch(() => ({}));
      console.error("Brevo contact error:", res.status, err);
    }
  } catch (err) {
    console.error("Brevo network error:", err);
  }
}
