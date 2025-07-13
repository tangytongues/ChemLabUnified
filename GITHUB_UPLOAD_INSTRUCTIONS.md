# How to Upload ChemLab to GitHub

Since Builder.io doesn't have a direct download button, here's how to get your merged ChemLab project onto GitHub:

## Method 1: Direct GitHub Upload (Easiest)

1. **Go to GitHub.com and create a new repository:**
   - Click the "+" icon → "New repository"
   - Name: `chemlab-virtual-laboratory` (or your preferred name)
   - Description: "Virtual Chemistry Laboratory with Aspirin Synthesis and Acid-Base Titration"
   - Make it Public or Private (your choice)
   - ✅ Check "Add a README file"
   - Click "Create repository"

2. **Upload files via GitHub web interface:**
   - In your new repo, click "uploading an existing file"
   - **Download/Copy all files from the `chemlab 1` folder** in Builder.io
   - Drag and drop all the files and folders into GitHub
   - Commit message: "Initial commit: Merged ChemLab with Aspirin Synthesis and Titration experiments"
   - Click "Commit changes"

## Method 2: Using Git Commands (If you have Git installed)

1. **Download the project files** from Builder.io `chemlab 1` directory

2. **Initialize Git in your local folder:**

   ```bash
   cd your-downloaded-chemlab-folder
   git init
   git add .
   git commit -m "Initial commit: Merged ChemLab application"
   ```

3. **Connect to GitHub:**
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/chemlab-virtual-laboratory.git
   git push -u origin main
   ```

## Method 3: Download as ZIP from Builder.io

Since you mentioned no download button, try these alternatives:

1. **Right-click in the file explorer** → "Save As" or "Download"
2. **Use browser developer tools:**
   - Press F12
   - Go to Sources/Network tab
   - Look for file download options
3. **Copy files manually:**
   - Select all files in Builder.io
   - Copy and paste into local text files
   - Recreate the folder structure

## What Files to Include

Make sure you upload ALL files from the `chemlab 1` directory:

```
chemlab-virtual-laboratory/
├── client/                 # React frontend
├── server/                 # Express backend
├── data/                   # Experiment data
├── shared/                 # Shared types
├── package.json           # Dependencies
├── package-lock.json      # Lock file
├── tsconfig.json          # TypeScript config
├── tailwind.config.ts     # Tailwind config
├── vite.config.ts         # Vite config
├── README.md              # Documentation
├── .gitignore             # Git ignore rules
└── ... (all other files)
```

## After Upload

1. **Test the repository:**

   ```bash
   git clone https://github.com/YOUR_USERNAME/chemlab-virtual-laboratory.git
   cd chemlab-virtual-laboratory
   npm install
   npm run dev
   ```

2. **Update the README** with your GitHub username in the clone URL

3. **Add a LICENSE file** if you want (MIT is recommended)

4. **Create releases/tags** for versions

## Quick Verification Checklist

✅ All source files uploaded  
✅ package.json and package-lock.json included  
✅ Both experiments (Aspirin + Titration) working  
✅ README.md updated with correct GitHub URLs  
✅ .gitignore prevents uploading node_modules  
✅ Repository is public/private as desired

## Repository Features to Enable

- **Issues:** For bug reports and feature requests
- **Discussions:** For community questions
- **Pages:** For documentation (optional)
- **Actions:** For CI/CD (optional)

Your merged ChemLab project will then be available at:
`https://github.com/YOUR_USERNAME/chemlab-virtual-laboratory`

## Need Help?

If you're still having trouble getting the files from Builder.io, let me know and I can help you recreate the key files manually!
