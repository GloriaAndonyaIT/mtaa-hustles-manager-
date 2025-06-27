# Mtaa Hustle Manager

*A financial tracking platform built for Kenya’s informal sector.*

 **Date:** 27/06/2025  
 **By:** Gloria Andonya  
 **Demo Presentation:** [Watch on YouTube](https://youtu.be/LumO-IM7-Uk)

---

##  Description

**Mtaa Hustle Manager** is a web-based application designed to empower informal workers in Kenya—such as:

- Mama mbogas  
- Mitumba sellers  
- Boda boda riders  
- Small-scale entrepreneurs  

The platform offers a simple and secure way to track:

- Income  
- Expenses  
- Customer debts  
- Business goals  

This helps users transition from manual bookkeeping to digital financial management.

---

##  Features & User Stories

###  User Capabilities

- **Authentication:**
  - Register with name, email, and password
  - Log in securely
  - Delete account if desired

- **Hustle Management:**
  - Add, view, and delete hustles (e.g. Mitumba, Salon)
  - View and manage profile details

- **Transaction Tracking:**
  - Record income and expenses with amount, description, hustle, and date
  - Edit or delete transactions
  - Filter transactions by hustle or date

- **Debt Management:**
  - Add customer debts with name, amount, date, and hustle
  - View, update (e.g., mark as paid), or delete debts

- **Dashboard Overview:**
  - View total income
  - Track total debt
  - Access recent activity logs
  - View simple graphs and insights

###  Admin Capabilities

- Log in via secure admin panel
- View a list of all users and their activities
- Activate or suspend user accounts
- Manage all hustles, transactions, and debts

---

##  Database Relationships

- **User → Hustles:** One-to-Many  
  A user can have multiple hustles

- **Hustle → Transactions:** One-to-Many  
  Each hustle can have many income/expense entries

- **Hustle → Debts:** One-to-Many  
  Each hustle can have several customer debts

---

##  Known Bugs

- The application is currently stable and fully functional  
- For bug reports or suggestions, kindly reach out via the contact details below

---

##  Technologies Used

###  Frontend
- **React**
- **Tailwind CSS**
- **React Icons**

###  Backend
- **Flask (Python)**
- **Flask-JWT-Extended**
- **Flask-Mail**
- **Flask-SQLAlchemy**

---

##  Support & Contact

If you have any questions, feedback, or bug reports:  
 **Email:** gloriaandonyaa@gmail.com

---

##  License

This project is licensed under the **MIT License**.
