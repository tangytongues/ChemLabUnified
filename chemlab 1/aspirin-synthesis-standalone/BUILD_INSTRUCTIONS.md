# Build and Deployment Instructions

## Quick Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Development Mode

```bash
npm run dev
```

This will start the development server at `http://localhost:5173`

### 3. Build for Production

```bash
npm run build
```

This creates a `dist/` folder with optimized files ready for deployment.

### 4. Preview Production Build

```bash
npm run preview
```

Preview the production build locally before deployment.

## Deployment Options

### Option 1: Static File Hosting

After running `npm run build`, upload the entire `dist/` folder to any web hosting service:

- Netlify (drag & drop the `dist` folder)
- Vercel (connect to GitHub or upload folder)
- GitHub Pages
- Any web server (Apache, Nginx, etc.)

### Option 2: Integrate into Existing Website

#### A. As a React Component

Copy the `src/AspirinSynthesis.jsx` file into your React project and import it:

```jsx
import AspirinSynthesis from "./components/AspirinSynthesis";

function MyPage() {
  return (
    <div>
      <h1>Chemistry Lab</h1>
      <AspirinSynthesis />
    </div>
  );
}
```

#### B. As an iframe

Host the built files and embed as an iframe:

```html
<iframe
  src="https://your-domain.com/aspirin-lab/"
  width="100%"
  height="800px"
  frameborder="0"
  title="Aspirin Synthesis Virtual Lab"
>
</iframe>
```

#### C. Direct HTML Integration

Include the built CSS and JS files in your existing HTML:

```html
<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="./dist/assets/index-[hash].css" />
  </head>
  <body>
    <div id="aspirin-lab-root"></div>
    <script src="./dist/assets/index-[hash].js"></script>
    <script>
      // Initialize the component in the div
      // (React will automatically mount to #root)
    </script>
  </body>
</html>
```

## File Structure After Build

```
dist/
├── index.html              # Main HTML file
├── assets/
│   ├── index-[hash].js     # Main JavaScript bundle
│   ├── index-[hash].css    # Compiled CSS styles
│   └── react-vendor-[hash].js  # React libraries
└── vite.svg                # Favicon
```

## Customization

### Modify Colors and Styling

Edit `tailwind.config.js` to change the color scheme:

```js
theme: {
  extend: {
    colors: {
      'chemistry-blue': {
        // Your custom colors here
      }
    }
  }
}
```

### Add Your Branding

- Replace the title in `index.html`
- Modify the header text in `AspirinSynthesis.jsx`
- Add your logo by editing the component

### Change Experimental Data

Modify the arrays in `AspirinSynthesis.jsx`:

- `aspirinGuidedSteps` - Modify the procedure steps
- `experimentChemicals` - Change chemicals or add new ones
- `experimentEquipment` - Modify equipment list

## Performance Optimization

The build is already optimized with:

- Code splitting (React vendor bundle separate)
- Tree shaking (unused code removed)
- Minification and compression
- Efficient CSS bundling

For further optimization:

- Use a CDN for hosting static files
- Enable gzip compression on your server
- Consider lazy loading for large animations

## Browser Support

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

Requires:

- ES6+ support
- CSS Grid and Flexbox
- Drag & Drop API

## Troubleshooting

### Build Issues

- Ensure Node.js version 16+ is installed
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

### Runtime Issues

- Check browser console for JavaScript errors
- Verify all files are being served correctly
- Ensure drag & drop is not disabled by browser security settings

### Styling Issues

- Verify Tailwind CSS is loading properly
- Check that custom CSS animations are supported
- Test responsive design on different screen sizes

## Support

For technical issues:

1. Check the browser developer console
2. Verify all dependencies are installed correctly
3. Test in a clean browser environment
4. Ensure the latest Node.js LTS version is being used

## License

This project is open source under the MIT License. You're free to modify and distribute it according to your needs.
