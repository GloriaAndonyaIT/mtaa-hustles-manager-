Mtaa Hustle Manager
A financial tracking platform built for Kenya’s informal sector.

Date: 27/06/2025
 By: Gloria Andonya

 Description
Mtaa Hustle Manager is a web-based application tailored for informal sector workers in Kenya such as:

Mama mbogas

Mitumba sellers

Boda boda riders

Other small-scale entrepreneurs

It helps users manage their daily hustles by tracking income, expenses, debts, and setting business goals, offering a simple digital alternative to manual bookkeeping.

 Features / User Stories
 A User Can:
Register an account using name, email, and password

Log in using their credentials

View and manage their profile and hustles

Delete their account if desired

Add, view, and delete hustles (e.g. Mitumba, Salon)

Record income or expenses with amount, description, hustle, and date

Filter and view transactions by hustle or date

Edit or delete any transaction

Add customer debts with name, amount, date, and hustle

View, update (e.g. mark as paid), or delete debts

View an overview dashboard with:

Total income

Total debt

Recent activity

Simple graphs

 An Admin Can:
Log in via a secure admin panel

View a list of all users and their activities

Suspend or activate user accounts

View and manage all hustles, transactions, and debts

Database Relationships
User → Hustles: One-to-Many
One user can create multiple hustles.

Hustle → Transactions: One-to-Many
Each hustle can have multiple income or expense records.

Hustle → Debts: One-to-Many
Each hustle can have several associated customer debts.

 Known Bugs
The application is currently stable and fully functional.

If you encounter any issues, please contact the developer.

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
Email: gloriaandonyaa@gmail.com

 License
Licensed under the MIT License.
