export interface SidebarLink {
  label: string;
  icon?: string;      
  route?: string;
  children?: SidebarLink[];
  lucideIcon?: "home" | "settings";
}

export const sidebarItems: SidebarLink[] = [
  {  
   label: "Dashboard",
   lucideIcon: "home", 
   route: "/"
    },
  { 
    label: "Deals",
    icon: "/sideBarIcons/handshake.svg",
    route: "/deals" 
    },
  { 
    label: "To-Do",
    icon: "/sideBarIcons/layout-list.svg",
   route: "/todo" 
    },
  { 
    label: "Meetings", 
    icon: "/sideBarIcons/presentation.svg", 
    // route: "/meetings"
   },
  { 
    label: "Prospects", 
    icon: "/sideBarIcons/trending-up.svg",
    // route: "/prospects"
   },
  {
    label: "Contact",
    icon: "/sideBarIcons/mail.svg",
    children: [
      { 
        label: "Customers",
        // route: "/contact/customers"
       },
      { 
        label: "Companies", 
        // route: "/contact/companies"
       },
    ],
  },
  {
    label: "Tools & Analytics",
    icon: "/sideBarIcons/bar-chart.svg",
    children: [
      { 
        label: "Reports", 
        // route: "/tools/reports"
       },
      { 
        label: "Automation", 
        // route: "/tools/automation" 
      },
    ],
  },
  { 
    label: "Settings", 
    lucideIcon: "settings", 
    // route: "/settings" 
  },
];