# Clinic Management System (ระบบบริหารจัดการคลินิกแพทย์แผนไทย)

ระบบบริหารจัดการคลินิกการแพทย์แผนไทย (พิมพ์วิมานคลินิก) พัฒนาด้วย Spring Boot (Backend) และ Next.js (Frontend) โดยมีเอกสารข้อกำหนดความต้องการระบบฉบับเต็มอยู่ที่ `SRS_ระบบบริหารจัดการคลินิก.md`

## Project Structure

- `backend/`: Spring Boot 3, Java 21, Spring Security (JWT), MySQL, Hibernate JPA, JasperReports, poi-tl
- `frontend/`: Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons, Radix UI
- `SRS_ระบบบริหารจัดการคลินิก.md`: เอกสาร SRS ข้อกำหนด 32 Use Cases และ Data Dictionary ฉบับสมบูรณ์

## Agent skills

### Issue tracker

Issues and specs are tracked as local markdown files under `.scratch/<feature-slug>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical triage roles mapped to standard labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context repository layout (`CONTEXT.md` and `docs/adr/`). See `docs/agents/domain.md`.
