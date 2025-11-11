<p align="center">
<img src="https://i.ibb.co/rgvcjN4/Frame-17.png" alt="Logo" border="0" width="400">
</p>
<h1 align="center">Klickbee CRM</h1>

<p align="center"><strong>The open-source CRM built for agencies, freelancers, and digital businesses.</strong></p>

<p align="center">
  <img alt="License" src="https://img.shields.io/badge/license-AGPLv3-green?style=flat-square">
  <img alt="Build" src="https://img.shields.io/badge/build-passing-brightgreen?style=flat-square">
  <img alt="Version" src="https://img.shields.io/badge/version-1.0-blue?style=flat-square">
  <img alt="Made by Stralya" src="https://img.shields.io/badge/made%20by-Stralya-4B5563?style=flat-square">
</p>

---

### 🧠 What is Klickbee CRM?

**Klickbee CRM** is an open-source CRM built entirely with **Next.js**. It centralizes customer management, sales
tracking, and internal collaboration in a modular, scalable structure.

Built for agencies, freelancers, and businesses who need clarity, sovereignty, and speed.

---

### 🧩 Architecture

Klickbee CRM follows a **Feature-Driven Architecture (FDA)** — each feature is self-contained with its own logic, UI,
and data layer.

```
src/
├── app/                   # Next.js App Router
├── feature/
│   ├── company/            # Company management (list, details, forms)
│   ├── contact/            # Contact management
│   ├── opportunity/        # Sales pipeline & opportunities
│   ├── activity/           # Notes, tasks, follow-ups
│   ├── lib/                # Notes, tasks, follow-ups
└── components/             # Global components

```

Each feature manages its own state, components, and API integrations. This approach ensures a **clear separation of
concerns**, making the app maintainable and scalable.

---

### 🚀 MVP Features

| Feature       | Description                                      |
|---------------|--------------------------------------------------|
| Companies     | Manage organizations and business clients        |
| Contacts      | Individual client profiles linked to companies   |
| Deals         | Sales pipeline and deal tracking                 |
| Activities    | Follow-ups, notes, and call logs                 |
| Notifications | Toasts and inline feedback for user actions      |
| Forms         | React Hook Form + Zod validation for reliability |

---

### 🧠 Tech Stack

| Tech                          | Description                                      |
|-------------------------------|--------------------------------------------------|
| **Next.js 15**                | App Router architecture                          |
| **React 19**                  | UI layer                                         |
| **TailwindCSS 4 + shadcn/ui** | Styling & components                             |
| **Zustand**                   | Local state management                           |
| **TanStack Query**            | Server state & async data handling               |
| **Prisma ORM**                | PostgreSQL / SQLite support                      |
| **Zod + Yup**                 | Form validation (All yup will be migrate to zod) |
| **NextAuth.js**               | Authentication                                   |
| **Nodemailer**                | Email sending                                    |

---

### ⚙️ Getting Started

**Option 1: Local Development**

1. Clone the repository:

```bash
git clone https://github.com/Klickbee/klickbee-crm.git
cd klickbee-crm
```

2. Install dependencies:

```bash
npm install
```

3. Copy and configure the environment file:

```bash
cp .env.example .env
```

4. Run the development server:

```bash
npm run dev
```

The application runs at [localhost:3000](http://localhost:3000)

---


**Option 2 : Production Deployment**

Clone the repo and install dependencies as above.

Copy .env.example to .env and configure it for production.

1. Build the application:

```bash
npm run build
```

Migrate the database :

```bash
npx prisma migrate deploy
```

2. Start the production server:

```bash
npm start
```

or use PM2 for process management:

```bash
pm2 start npm --name "klickbee-crm" -- start
```

We recommend using a reverse proxy like [Caddy](https://caddyserver.com/) for better performance and security.


---

### 🧹 Code Quality & Linting

Klickbee CRM uses **ESLint** and **TypeScript**

| Tool       | Purpose                   |
|------------|---------------------------|
| ESLint     | Enforces coding standards |
| TypeScript | Ensures type safety       |

---

### 🧠 Roadmap

| Milestone                    | Status | Description               |
|------------------------------|--------|---------------------------|
| Company & Contact Management | ✅      | Core features implemented |
| Opportunity Pipeline         | ✅      | Implemented               |
| Notes & Activities           | ✅      | Available                 |
| Dashboard & Stats            | ✅     | Implemented                   |
| Automations & Workflows      | 🔜     | Coming on next release           |

---

### 🚧 Contributing

Klickbee CRM is built in the open. Feedback, ideas, and PRs are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit using Conventional Commits
4. Submit a Pull Request 🎯

---

### 📄 License

This project is licensed under the [GNU Affero General Public License v3.0](./LICENSE).

---

### 🌐 Maintained by [Stralya](https://github.com/stralya-company)

We build tools for digital creators.

* ✉️ [contact@stralya.com](mailto:contact@stralya.com)
* 💬 [Discord](https://discord.gg/SmBxh4wPrv)
* 🌎 [stralya.com](https://stralya.com) (coming soon)
* 🌎 [klickbee.com](https://klickbee.com)

---

<p align="center">
  <em>Klickbee CRM. Organize, track, and grow smarter.</em>
</p>
