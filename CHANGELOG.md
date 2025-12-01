# 1.0.0 (2025-11-28)


### Bug Fixes

* correct property name from ownerId to userId in email settings query ([54406a7](https://github.com/Klickbee/klickbee-crm/commit/54406a7d7426ed51aac7c257e90dac446416005e))
* enhance formatRangeDisplay to handle additional prefix variations ([e42b319](https://github.com/Klickbee/klickbee-crm/commit/e42b319ffc29b5583adb4ba7fe849b4e55b8ec9e))
* enhance TodoForm validation and improve default values for status and priority ([d49d473](https://github.com/Klickbee/klickbee-crm/commit/d49d47350e1d099b22521830f113112a84e08b73))
* refine MeetingForm validation and update optional fields for better clarity ([0a35c59](https://github.com/Klickbee/klickbee-crm/commit/0a35c5923be3beeaaf4bdcbced8f84f36986b5c4))
* remove extra space in production deployment section of README ([4dcef85](https://github.com/Klickbee/klickbee-crm/commit/4dcef85141617212589f5d965746bcf31f29f19f))
* remove unnecessary line breaks in README ([9143230](https://github.com/Klickbee/klickbee-crm/commit/91432303dc312a461d84c887e6d5c457fd4327ca))
* remove unused usersLoading prop from TodoModel component ([23d50f6](https://github.com/Klickbee/klickbee-crm/commit/23d50f60f78c8bdfcdbb8f678e034ad29db99a96))
* uncomment routes for Reports and Automation in sideBarLinks ([f04b825](https://github.com/Klickbee/klickbee-crm/commit/f04b825226efc7f211f48b667dc906cab22a6ac0))
* update build workflow to trigger on pull requests and enhance Node.js setup ([395147d](https://github.com/Klickbee/klickbee-crm/commit/395147dfa7ae44761cbd5bf1af195bb3d6f97778))
* update description for AI settings in NavBar component ([91c8172](https://github.com/Klickbee/klickbee-crm/commit/91c81726e558dacf8137e0671aee6bc1506beb32))
* update email validation to use z.email and make name and confirmPassword required in login schema ([af530be](https://github.com/Klickbee/klickbee-crm/commit/af530beac8b3a09f1bee1b6f766d9b7179a4d0dd))
* update formatRangeDisplay to use underscores in range replacement ([fa26ec1](https://github.com/Klickbee/klickbee-crm/commit/fa26ec15d34e81cfb53e3ea101a5209d60b9b6b9))
* update label from "Edit Deal" to "Edit Task" in index.tsx; correct import path in Card.tsx ([d4d5e0a](https://github.com/Klickbee/klickbee-crm/commit/d4d5e0ae07d0865f3d75a5b2fec26251139d004b))
* update metadata title and description for CRM ([97bfa3f](https://github.com/Klickbee/klickbee-crm/commit/97bfa3fe9bbd9128409e792918c67f2cf2d58c57))
* update release workflow to enhance permissions and improve dependency management ([1fd709c](https://github.com/Klickbee/klickbee-crm/commit/1fd709cba693b0f5e452995806e05874257dc614))
* update section title from "AI Settings" to "Mail Settings" in EmailForm component ([f98d954](https://github.com/Klickbee/klickbee-crm/commit/f98d954e8937f56e93c9c1cf4e47c19965c126e9))
* update semantic release commands to use extends option for configuration files ([d03d5af](https://github.com/Klickbee/klickbee-crm/commit/d03d5af661fcc9c621d39f8cf20b9ba4f1054b36))
* update semantic release commands to use relative paths for configuration files ([59fb128](https://github.com/Klickbee/klickbee-crm/commit/59fb1283263e87aca227b4e8999bdf101ff8ab05))
* update specificChanges initialization and correct boolean type in CustomersForm ([e2cd258](https://github.com/Klickbee/klickbee-crm/commit/e2cd25866acc3641e659b92ebdc9851546e995bf))


### Features

* add ComingSoonPage component and integrate it into ToolautomationPage ([1252716](https://github.com/Klickbee/klickbee-crm/commit/1252716fe7e13daec5392ccb9c9a131c690af26c))
* add email sending ([a95ed86](https://github.com/Klickbee/klickbee-crm/commit/a95ed86cc81c0664cb52760dd9450b4b56589868))
* add GNU Affero General Public License to the repository ([ec4c20e](https://github.com/Klickbee/klickbee-crm/commit/ec4c20e2c712a6dbe53243a29f9c9b50e4ad7f9b))
* add ProspectSlideOver component to ProtectedLayout ([6d94fcb](https://github.com/Klickbee/klickbee-crm/commit/6d94fcb92f5d1fc9a560bb5f689254c7c0df0554))
* add semantic release configuration and GitHub Actions workflow ([e67db2b](https://github.com/Klickbee/klickbee-crm/commit/e67db2b473103916bead795baab39cd826fc28e0))
* add support for new prospect action in DashboardHeader component ([05336a4](https://github.com/Klickbee/klickbee-crm/commit/05336a43d3f5221aff2260afd4c7530e58f69f67))
* add user API endpoints and form validation with zod ([9044e6b](https://github.com/Klickbee/klickbee-crm/commit/9044e6b0a4ca7dbc06c85dce43c21062c1ebb071))
* add user API endpoints and form validation with zod ([ff26eda](https://github.com/Klickbee/klickbee-crm/commit/ff26eda5e7430c2343fe247e570c145ea4b547a2))
* add Zustand store for managing prospect modal state ([9ab0057](https://github.com/Klickbee/klickbee-crm/commit/9ab005700250e57324a1d0e52c94018927cc237e))
* configure semantic release for Gitea and GitHub with separate config files ([2fdeb6d](https://github.com/Klickbee/klickbee-crm/commit/2fdeb6d64463b912f40f192e505d020ce1b626e0))
* enable signup functionality with environment variable toggle ([94fd12d](https://github.com/Klickbee/klickbee-crm/commit/94fd12d27d378064a25ad45f7fb7c33bad5761fe))
* enhance file attachment handling in detail modals and export functions ([cc43c01](https://github.com/Klickbee/klickbee-crm/commit/cc43c01e99a59bea70f3b51b9ad542f423cde75a))
* refactor CompaniesForm to use react-hook-form and zod for validation ([5a3b419](https://github.com/Klickbee/klickbee-crm/commit/5a3b4197a637c6064acf7759026d974db86c8ee0))
* update README with project overview, tech stack, and contribution guidelines ([42caf1b](https://github.com/Klickbee/klickbee-crm/commit/42caf1b9e1b7e6d1cb19efd87bf5220b55d0b144))
