
 MTAA HUSTLE MANAGER
A financial tracking platform built for Kenya’s informal sector.

 Date: 27/06/2025
 By: Gloria Andonya

Description
Mtaa Hustle Manager is a web-based application tailored for informal sector workers in Kenya such as mama mbogas, mitumba sellers, boda boda riders, and other small-scale entrepreneurs. It helps users manage their daily hustles by tracking income, expenses, debts, and setting goals—offering a digital alternative to manual bookkeeping.

 Features / User Stories
 A User Can:
Register an account using their name, email, and password.

Log in using their credentials.

View and manage their profile and hustles.

Delete their account if they wish.

Add, view, and delete hustles (e.g. Mitumba, Salon).

Record income or expenses with details like amount, description, and date.

Filter and view transactions by hustle or date.

Edit or delete any transaction.

Add customer debts with relevant details.

View, update (mark as paid), or delete debts.

View an overview dashboard with:

Total income

Total debt

Recent activity

Simple graphs

 An Admin Can:
Log in via a secure admin panel.

View a list of all users and their activity.

Suspend or activate user accounts.

View and manage all hustles, transactions, and debts.

Database Relationships
User → Hustles: One-to-Many

Hustle → Transactions: One-to-Many

Hustle → Debts: One-to-Many

Each hustle belongs to one user, and each transaction or debt is tied to a specific hustle.

Known Bugs
The application is currently stable and fully functional.

If you encounter issues, please contact the developer.



 Technologies Used
Frontend:

React

Tailwind CSS

React Icons



Backend:

Flask (Python)

Flask-JWT-Extended

Flask-Mail

Flask-SQLAlchemy



 Support & Contact
 Email: gloriaandonya01@gmail.com

 License
Licensed under the MIT License.
