# Nepenthes

![banner](/screenshots/david-clode-KrL1KJSdZMI-unsplash.jpg)

# About

I was inspired to create this project after watching [this video](https://www.youtube.com/watch?v=vG824vBdYY8). I also wanted to learn about and implement GraphQL so this project serves as an excuse to try out that piece of technology too.

Nepenthes, named after a genus of carnivorous plants, is a work-management app designed to help organize the development of software.

[Click here for a walkthrough.](#walkthrough)

Click the button below to view the app
<br/>
<br/>
[<img src="https://raw.githubusercontent.com/pfoo360/Nepenthes/main/screenshots/logo.png" width="163px" />](https://nepenthes.vercel.app/)

# Features

- Signups, signins, persistent signins and sessions from scratch
- Api built with GraphQL (Apollo)
- Type safety
- CRUD operations on DB
- DB and UI are in sync at all times thanks to cache modifications
- Modals!
- Conditionally renders CSS (ex buttons are 'greyed out' when submitting) for better UX
- Workspace-project-ticket organization structure
- Mobile-first design
- and much more!

# Technologies

- NextJS
- Prisma
- PostgreSQL
- GraphQL
- Apollo Client
- Apollo Server
- Typescript
- TailwindCSS
- Vercel
- Railway

# Goals

- Learn about GraphQL
- Implement GraphQL into a project
- Familiarize myself with TypeScript
- Familarize myself with NextJS (file-based routing, SSR, etc.)
- Connect Prisma with a PostgreSQL DB in the cloud and create Prisma schemas to build tables in the DB
- DB table separation and relations
- Familiarize myself with Prisma's ORM
- Deploy an app

# Improvements

- Resolvers could be broken up further such that each method is written in their own separate file. This would improve scalability.
- Notification system for when users are assigned to projects or assigned to tickets, etc.
- Instead of a hamburger icon + menu, have a side-panel that displays the same links
- Possibly better security to ensure safe signin/signout
- Implement an incoming request logger and an error logger
- More error handling (can never go wrong with more error handling for edge cases)
- More media queries and responsive design (currently designed with small and large screens in mind)

# Walkthrough

When you first sign in after creating an account, you will be greeted with a similar screen. A "workspace" allows you to group projects together. <br/>
![empty_workspace](/screenshots/1.png)
<br/>
<br/>

It looks a bit empty here. Clicking the giant "Add workspace" button on the top will open up a modal and allow you to create+name a new workspace. <br/>
![new_workspace](/screenshots/2.png)
<br/>
<br/>

We created several workspaces here. If you create a workspace, you are automatically an ADMIN of said workspace, granting you unconditional privilege in the workspace! As an ADMIN of a workspace, you will also have access to 2 buttons: one to re-name the workspace and one to delete the workspace. Also note that if another user adds you to their workspace, a link to their workspace will also show up on this screen. <br/>
![add_workspace](/screenshots/3.png)
<br/>
<br/>

Here, we have renamed 'personal_wrkspc' to 'personal_wrkspc_edit' by clicking the 'edit' button on the right. <br/>
![before_edit](/screenshots/4.png)
![after_edit](/screenshots/5.png)
<br/>
<br/>

Clicking one of these links will take us inside the workspace (in this case, we clicked on the 'not_meta' workspace). The first thing we will see is a breakdown of tickets in the current workspace, showcasing the overall health of a workspace. Since we currently have no tickets in the system, this is empty. <br/>
![home](/screenshots/6.png)
<br/>
<br/>

The hamburger icon on the top-right gives us a list of links we can use to navigate around the current workspace.<br/>
As as ADMIN of the workspace, we also have an exclusive 'admin' link. Clicking on 'admin' will take us to the ADMIN panel, which lists all the users that are apart of the current workspace.<br/>
It's a bit lonely in here, so lets remedy the situation by adding other users to the 'not_meta' workspace via the 'Add user to workspace' button. When adding a user to the current workspace, we also need to assign them a role (ADMIN, MANAGER, DEVELOPER) in the current workspace. Here, we are adding a user named 'test_mngr1' to the 'not_meta' workspace and assigning them the MANAGER role.<br/>
![admin_link](/screenshots/7.png)
![admin_panel](/screenshots/8.png)
![admin_panel](/screenshots/10.png)
![admin_panel](/screenshots/9.png)
<br/>
<br/>

If username does not exist, you will see an error message.<br/>
![admin_panel](/screenshots/11.png)
<br/>
<br/>

Now, we can navigate to the 'project' panel via the hamburger menu. <br/>
![add_user_error](/screenshots/12.png)
<br/>
<br/>

As you can see, we have yet to create any projects.<br/>
Click the 'Create project' button on the top to create one! A modal will pop up and ask you to at least give the to-be-created project a name. Descriptions are optional. You will also be given a list of users that are apart of the workspace (the same users you added in the previous step as an ADMIN). You can select any number of other users and assign them to the to-be-created project.<br/>
Here we are creating 2 projects: "not_fb" has all users apart of the workspace assigned to it, "not_ig" has only 2 users apart of the workspace assigned to it.<br/>
![no_project](/screenshots/13.png)
![not_fb_creation](/screenshots/14.png)
![not_ig_creation](/screenshots/15.png)
![result](/screenshots/16.png)
<br/>
<br/>

Clicking on the "not_fb" project link will bring us to the 'project details' page. Here, we can see all tickets that fall under the project as well as who is assigned to the project. ADMINs and MANAGERs have the privilege of assigning users (that we have added to the workspace) to projects and creating tickets in a project. A caveat, however, is that ADMINS have unconditional 'add' privileges but MANAGERs only have 'add' privileges on projects that they are assigned to (ie MANAGERs cannot add tickets/users to a project if they are NOT assigned to the project already). <br/>
![project_detail_screen](/screenshots/17.png)
<br/>
<br/>

If you remember, when we created the "not_ig" project, we only added 2 users from the workspace to the project. If we wanted to add more users to a project after we have already created a project we can! Heading over to "not_ig" for a quick second, when the click on the 'Add' button next to 'Team' you will see the remaining unadded users that are apart of the workspace. Select the desired user(s) you want to assign to the project. <br/>
Here, we add the previously unadded 'test_dev2' to the "not_ig" project.<br/>
![add_another_user_to_team](/screenshots/31.png)
![add_another_user_to_team](/screenshots/32.png)
![add_another_user_to_team](/screenshots/33.png)
![add_another_user_to_team](/screenshots/34.png)
<br/>
<br/>

We can add tickets via the "Add" button next to the "Ticket" header. A modal will appear, asking you to give the ticket a name, a description (optional), a priority and a type. You will also need to assign project team member(s) to the ticket. <br/>
![create_ticket](/screenshots/18.png)
<br/>
<br/>

Here, we create several tickets for the 'not_fb' project. If we click on the 'More details' link next to each ticket... <br/>
![tickets](/screenshots/19.png)
<br/>
<br/>

... we can see all the details about a specific ticket. ADMINs can see details of any ticket in a workspace. MANAGERs can see details of any ticket under a project they are assigned to. DEVELOPERs can only see details of tickets if they are listed as a 'Developer' on the ticket.
![ticket_detail](/screenshots/20.png)
<br/>
<br/>

Scrolling down, we have a section for comments. The same restrictions on who can see ticket details apply to who can comment: ADMINs can comment unconditionally, MANAGERs can only comment on tickets that fall under projects that they are assigned to, DEVELOPERs can only comment on tickets that lists them as a 'Developer'.
![comment_section_1](/screenshots/21.png)
![comment_section_2](/screenshots/22.png)
<br/>
<br/>

Scrolling back up, you will notice a 'edit ticket' link. Again, same restrictions on who can see details/comment on tickets apply to who can edit a ticket. Of also note, DEVELOPERs are only allowed to change the STATUS of a ticket. On successful edit we will be taken back to the 'ticket details' page.<br/>
In this instance, we changed the name of the ticket from 'feature #2" to 'feature #2 edit,' added a description and assigned and additional user, 'test_mngr1,' to the ticket.
![edit_ticket](/screenshots/23.png)
![edit_ticket](/screenshots/24.png)
![edit_ticket](/screenshots/25.png)
![edit_ticket](/screenshots/27.png)
<br/>
<br/>

Now, we can navigate to the 'tickets' link. If you are an ADMIN in a workspace, you will see ALL tickets in the workspace here. If you are a MANAGER in a workspace, you will only see tickets from assigned projects. If you are a DEVELOPER in a workspace, you will only see tickets where you are listed as a 'Developer.'
![edit_ticket](/screenshots/28.png)
![edit_ticket](/screenshots/29.png)
<br/>
<br/>

Now, when we go back to the homepage, you can see a breakdown of the tickets in the current workspace.
![edit_ticket](/screenshots/30.png)
<br/>
<br/>

Now, lets log out and log in to an account who has a MANAGER role in the "not_meta" workspace. As you can see, test_mngr2 can only view the "not_fb" project since he is only assigned to that one project. A link to the "not_ig" project is unavailable for them since they are NOT assigned to the "not_ig" project. Likewise, on the 'tickets' link, they can only see all the tickets from the "not_fb" project but NOT from the "not_ig" project.
![as_a_manager](/screenshots/35.png)
![as_a_manager](/screenshots/36.png)
<br/>
<br/>

Now, lets log out and log in to an account who has a DEVELOPER role in the "not_meta" workspace. As you can see, test_dev1 can view the "not_fb" project and "not_ig" project since they are assigned to both projects. Of note, however, is that DEVELOPERs in a workspace can only see the 'More details' link for tickets where they are listed as a 'Developers'
![as_a_developer](/screenshots/37.png)
![as_a_developer](/screenshots/38.png)
![as_a_developer](/screenshots/39.png)
<br/>
<br/>

Additionally, as a DEVELOPER in a workspace, their 'tickets' panel is only populated with tickets where they are listed as a 'Developer(s)'
![as_a_developer](/screenshots/40.png)
<br/>
<br/>

Additionally, as a DEVELOPER in a workspace, they can only change the OPEN/CLOSED STATUS of a ticket. All other editable fields are disabled for DEVELOPERs.
![as_a_developer](/screenshots/41.png)
<br/>
<br/>

# References

- [Set cookie server-side in NextJS](https://reacthustle.com/blog/next-js-set-cookie-server-side)<br/>
- [Set cookie server-side in NextJS: SO Question](https://stackoverflow.com/questions/71546988/is-it-possible-to-set-a-server-side-cookie-in-next-js)<br/>
- [Add seconds to Date in JS](https://futurestud.io/tutorials/add-seconds-to-a-date-in-node-js-and-javascript)<br/>
- [GraphQL server scaffolding](https://github.com/betaflag/graphql-server-scaffolding)<br/>
- [Get selected value from dropdown](https://stackoverflow.com/questions/29108779/how-to-get-selected-value-of-a-dropdown-menu-in-reactjs)<br/>
- [Retrieving value from multi option <select> in React](https://stackoverflow.com/questions/28624763/retrieving-value-from-select-with-multiple-option-in-react)<br/>
- [Make element take 2 columns](https://stackoverflow.com/questions/53199146/make-element-take-two-columns)<br/>
- [Add property to interface in TS](https://stackoverflow.com/questions/48241211/add-property-to-interface-typescript)<br/>
- [Read/write data to cache in Apollo Client](https://www.apollographql.com/docs/react/caching/cache-interaction/)<br/>
- [Reset Apollo Client cache](https://www.apollographql.com/docs/react/caching/advanced-topics/#resetting-the-cache)<br/>
- [Rules of Hooks](https://stackoverflow.com/questions/72455157/react-has-detected-a-change-in-the-order-of-hooks)<br/>
- [Date type in GraphQL](https://stackoverflow.com/questions/49693928/date-and-json-in-type-definition-for-graphqls)<br/>
- [Custom scalars in GraphQL/Apollo aka Date types](https://www.apollographql.com/docs/apollo-server/schema/custom-scalars/)<br/>
- [Recreating related records in DB on Prisma update](https://github.com/prisma/prisma/discussions/8519)<br/>
- [Get current URL/domain from Vercel](https://github.com/vercel/next.js/discussions/16429)<br/>
