const db = require('better-sqlite3')('taxccount.db');
const { v4: uuidv4 } = require('uuid');

console.log("============= STARTING ADMIN BUSINESS FLOW TESTS =============");

// Get a valid admin user ID
const adminUser = db.prepare("SELECT id FROM users WHERE email='admin@taxccount.ca'").get();
if (!adminUser) {
    console.error("FAIL: Admin user not found.");
    process.exit(1);
}
const adminId = adminUser.id;

// --- FLOW 1: End-to-End Prospecting ---
console.log("\\n[TEST FLOW 1]: End-to-End Prospecting (Lead -> Client)");

// 1. Create Lead
const leadId = uuidv4();
try {
    db.prepare(`
        INSERT INTO leads (id, lead_code, first_name, last_name, email, pipeline_stage, status, created_by, created_at, updated_at)
        VALUES (?, 'TEST-001', 'QA', 'Lead', 'qa@test.com', 'new_inquiry', 'active', ?, datetime('now'), datetime('now'))
    `).run(leadId, adminId);
    console.log(" ✓ Lead created successfully (Pipeline: new_inquiry).");
} catch (e) {
    console.error(" ✕ Failed to create Lead:", e.message);
}

// 2. Stage to Qualified
try {
    db.prepare("UPDATE leads SET pipeline_stage = 'qualified' WHERE id = ?").run(leadId);
    console.log(" ✓ Lead staged to 'Qualified'.");
} catch (e) {
    console.error(" ✕ Failed to update Lead pipeline stage:", e.message);
}

// 3. Convert to Client
let clientId = uuidv4();
try {
    db.prepare(`
        INSERT INTO clients (id, client_code, display_name, primary_email, status, created_by, created_at, updated_at)
        VALUES (?, 'CLI-QA-001', 'QA Lead', 'qa@test.com', 'active', ?, datetime('now'), datetime('now'))
    `).run(clientId, adminId);
    
    // Mark Lead as converted
    db.prepare("UPDATE leads SET pipeline_stage = 'converted', status = 'archived' WHERE id = ?").run(leadId);
    console.log(" ✓ Lead successfully converted to Client.");
} catch(e) {
    console.error(" ✕ Failed to convert Lead to Client:", e.message);
}


// --- FLOW 2: Assign Templates & Compliances ---
console.log("\\n[TEST FLOW 2]: Compliance Generation Matrix");

// Find a valid template
const template = db.prepare("SELECT id FROM compliance_templates LIMIT 1").get();
if (!template) {
    console.error(" ✕ No compliance templates found for test.");
} else {
    // Add compliance to Client
    const compId = uuidv4();
    try {
        db.prepare(`
            INSERT INTO client_compliances (id, client_id, template_id, financial_year, base_price, status, created_at, updated_at)
            VALUES (?, ?, ?, '2025', 1500, 'new', datetime('now'), datetime('now'))
        `).run(compId, clientId, template.id);
        console.log(" ✓ Compliance task cleanly attached to new Client.");
    } catch(e) {
        console.error(" ✕ Failed to attach compliance:", e.message);
    }
}

// --- FLOW 3: Financial Integrity ---
console.log("\\n[TEST FLOW 3]: Billing Resolution Flow");

// Create invoice
const invId = uuidv4();
try {
    db.prepare(`
        INSERT INTO invoices (id, invoice_number, client_id, subtotal, tax_total, total_amount, paid_amount, status, issued_date, created_at, updated_at)
        VALUES (?, 'INV-9999', ?, 1000, 130, 1130, 0, 'sent', date('now'), datetime('now'), datetime('now'))
    `).run(invId, clientId);
    console.log(" ✓ Generic $1130 Invoice generated against Client.");
} catch(e) {
    console.error(" ✕ Failed to create invoice:", e.message);
}

// Pay Invoice
try {
    db.prepare("UPDATE invoices SET paid_amount = 1130, status = 'paid' WHERE id = ?").run(invId);
    
    // Verify aggregation
    const billed = db.prepare("SELECT SUM(total_amount - paid_amount) as outstanding FROM invoices WHERE client_id = ?").get(clientId);
    if (billed.outstanding === 0) {
        console.log(" ✓ Invoice fully paid. Client overall outstanding balance resolves to $0.00 properly.");
    } else {
        console.log(" ✕ Client balance calculation mismatch. Outstanding:", billed.outstanding);
    }
} catch(e) {
    console.error(" ✕ Failed to accept payment:", e.message);
}

console.log("\\n============= END ADMIN BUSINESS FLOW TESTS =============");
