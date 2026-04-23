# PrivateSpace 🔐

A secure, private notes and files management application with beautiful UI.

## Features

- 📝 **Secure Notes** - Create, edit, and manage private notes with rich text editor
- 📁 **Private Files** - Upload and store photos and documents securely
- 🎨 **Beautiful UI** - Modern dark/light theme with purple accents
- 📱 **Responsive** - Works on all devices
- 🔐 **Encrypted** - Client-side encryption for local storage
- 📤 **Export** - Export notes to PDF
- 🔍 **Search** - Search through your notes
- 🏷️ **Tags** - Organize with markdown support

## Tech Stack

- **Frontend:** React, CSS3
- **Backend:** Spring Boot (Java)
- **Storage:** Local Storage + REST API

## Getting Started

### Frontend

```bash
cd safenote-frontend
npm install
npm start
```

### Backend

```bash
cd _safenote-project/safenote-project
mvn spring-boot:run
```

## Deployment

### Frontend (Vercel)

1. Create account at [vercel.com](https://vercel.com)
2. Import project from GitHub
3. Set root directory to `safenote-frontend`
4. Deploy!

### Frontend (Netlify)

1. Create account at [netlify.com](https://netlify.com)
2. Drag and drop the `build` folder
3. Done!

### Backend (Render)

1. Create account at [render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub repo
4. Set build command: `mvn clean package`
5. Set start command: `java -jar target/safenote-project-0.0.1-SNAPSHOT.jar`

## Environment Variables

| Variable | Description |
|----------|-------------|
| `REACT_APP_API_URL` | Backend API URL |

## License

MIT License