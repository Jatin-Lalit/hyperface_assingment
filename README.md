# hyperface_assignment

## Project Readme

This project, tagged as **#hyperface_assignment**, provides backend API endpoints for a podcast-related application, serving both administrators and regular users. Below is a summarized overview of the functionalities along with their respective endpoints for each router.

### Deployed link :-(`https://hyperface-assingment.onrender.com`)

### Admin Router (`adminRouter`)

1. **Signup**

   - **Endpoint:** `POST admin/signup`
   - **Functionality:** Allows admin registration with email, phone, and password. Handles profile image upload.

2. **Login**

   - **Endpoint:** `POST admin/login`
   - **Functionality:** Allows admin login with email and password, generates a JWT token for authentication.

3. **Get Courses**

   - **Endpoint:** `GET admin/courses`
   - **Functionality:** Retrieves the courses associated with the logged-in admin.

4. **Add Course**

   - **Endpoint:** `POST admin/add/courses`
   - **Functionality:** Allows the addition of a new course, including an optional course thumbnail.

5. **Add Course Chapter**

   - **Endpoint:** `POST admin/add/courses/:id/chapters`
   - **Functionality:** Adds a new chapter to an existing course with audio file uploads.

6. **Delete Course**

   - **Endpoint:** `DELETE admin/courses/:id`
   - **Functionality:** Deletes a course and its associated chapters.

7. **Delete Course Chapter**
   - **Endpoint:** `DELETE admin/courses/:courseId/chapters/:chapterId`
   - **Functionality:** Deletes a specific chapter of a course.

### User Router (`userrouter`)

8. **Signup**

   - **Endpoint:** `POST user/signup`
   - **Functionality:** Allows user registration with email, phone, and password. Handles profile image upload.

9. **Login**

   - **Endpoint:** `POST user/login`
   - **Functionality:** Allows user login with email and password, generates a JWT token for authentication.

10. **Get Courses**

    - **Endpoint:** `GET user/courses`
    - **Functionality:** Retrieves the list of all courses available.

11. **Get Specific Course**

    - **Endpoint:** `GET user/courses/:id`
    - **Functionality:** Retrieves details of a specific course.

12. **Get Chapters of a Course**

    - **Endpoint:** `GET user/courses/chapters/:id`
    - **Functionality:** Retrieves details of chapters for a specific course.

13. **Logout**
    - **Endpoint:** `GET user/logout`
    - **Functionality:** Logs the user out by adding the JWT token to the blacklist.

### File Uploads

- **Admin Router:** Handles profile image, course thumbnail, and audio file uploads.
- **User Router:** Handles profile image uploads.

### Blacklist

- **Endpoint:** `/logout`
- **Functionality:** Adds the user's JWT token to the blacklist for secure logout.

## Explainer Video

- [Watch the Explainer Video](https://drive.google.com/file/d/17dn1LvSpLLYTT-vMCpLbdKSt6ZX2B28x/view?usp=sharing)
