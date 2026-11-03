# 📚 PageDate
### Find your mood. Meet your book.

PageDate is a book discovery and reading platform designed for readers who want more than a place to list the books they have read. Discover books by mood and trope, organise your reading shelf, try a Blind Date with a Book, keep a reading journal, and create shareable quote cards.

> **Project status:** Actively developing. The core discovery, shelf, Blind Date, Quote Studio, stats, themes, and account features are implemented. Some features are still browser-based and are listed under Current limitations.


## ✨ Features

### 🔐 Accounts
- Sign up and log in using separate tabs.
- Username field and show/hide password control.
- Email verification and password reset.
- Clear, user-friendly error messages.

### 🔎 Discover books
- Search by title, author, ISBN, or subject using the Open Library API.
- Filter books using **12 moods** and **13 tropes**.
- Load more results.
- Loading, empty, and error states.

### 📖 My Shelf
Organise books into:
- Want to Read
- Currently Reading
- Read
- On Hold
- Did Not Finish

You can also:
- Track reading progress as a percentage.
- Add star ratings.
- Save your shelf online to a PostgreSQL database when logged in.
- Use the shelf without an account; browser-saved books move into your account when you log in.

### 🎁 Blind Date with a Book
Choose a mood and a trope to get matched with a real book. Its details stay hidden until you reveal it.

### 📔 Reading Journal
- Add, edit, delete, and search journal entries.
- **Current limitation:** Journal entries are stored in the browser for now, not synced to the cloud.

### 🖼️ Quote Studio
- Create quote cards using 7 templates and 5 fonts.
- Adjust text size and alignment.
- Download a high-resolution PNG or share through the browser's share menu.

### 📊 Reading Stats
View statistics calculated from your reading data:
- Books read
- Currently reading
- Want-to-read count
- Yearly reading goal
- Monthly chart
- Top subjects

### 🎨 Themes
Choose from 6 themes:
- Midnight Scholar
- Lavender Library
- Forest Reader
- Ocean Blue
- Mocha Cream
- Charcoal Plum


## 🛠️ Tech stack

| Area | Technology |

| Frontend | HTML, CSS, JavaScript(No Frameworks) |
| Graphics | HTML Canvas |
| Backend and database | Supabase, PostgreSQL |
| Authentication | Supabase Auth |
| Database security | Supabase Row Level Security (RLS) |
| Book data | Open Library API |
| Hosting | GitHub Pages |



## 🔒 Security notes

- The frontend uses the Supabase public anon key; secret keys should never be placed in the repository.
- Row Level Security uses the authenticated user's ID (`auth.uid() = user_id`) to restrict access to their own shelf rows.
- Book data returned by the API is inserted as text rather than treated as HTML.

**Important:** Never publish your Supabase `service_role` key. Keep private credentials out of GitHub.



## 🚀 Run PageDate locally

1. Clone or download this repository.
2. Create a project in Supabase.
3. Open the Supabase SQL Editor and run the SQL in `schema.sql`.
4. In `auth.js`, configure `SUPABASE_URL` and `SUPABASE_ANON_KEY` using the values from your Supabase project settings.
5. In Supabase Authentication → URL Configuration, set the Site URL to your deployed site URL (and configure the local URL if needed for local testing).
6. Open `index.html` in a browser, or host the project using GitHub Pages.

Use only the public anon key in frontend code. Do not use the `service_role` key.



## 📚 What I learned

While building PageDate, I practised:
- Fetching data from a public REST API using `async/await` and handling errors.
- Building interfaces with the DOM.
- Implementing sign-up, email verification, login, and password reset flows.
- Designing SQL tables, constraints, and Row Level Security policies.
- Creating and exporting images with the Canvas API.
- Deploying a static website with GitHub Pages.


## ⚠️ Current limitations

- Journal entries and the yearly goal are currently stored in the browser rather than in the cloud.
- Usernames are not yet checked for uniqueness.
- Mood and trope matching relies on Open Library text search, so matches are approximate.
- Personalised recommendations and a profile page are not implemented yet.


## 🗺️ Roadmap

- [x] Book search and discovery
- [x] Reading shelves and progress
- [x] Blind Date with a Book
- [x] Quote Studio
- [x] Reading statistics and themes
- [x] Authentication and cloud-saved reading shelf
- [ ] Save journal entries and yearly goals online
- [ ] Profile page and profile photo upload
- [ ] Curated trope database with user voting
- [ ] Personalised recommendations




## 🙏 Credits

Book metadata and cover images are provided by [Open Library](https://openlibrary.org).


## 🔗 Project Links

- **Live Demo:** [PageDate](https://manali-bait.github.io/PageDate-/)
- **GitHub Repository:** [PageDate on GitHub](https://github.com/Manali-bait/PageDate-)

## 👩‍💻 Developer

**Manali Bait**  
Third-Year Information Technology Engineering Student

- **LinkedIn:** [Manali Bait](https://www.linkedin.com/in/manali-bait-818687315/)
- **GitHub:** [Manali-bait](https://github.com/Manali-bait)