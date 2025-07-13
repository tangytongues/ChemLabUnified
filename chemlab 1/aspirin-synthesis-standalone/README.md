# Aspirin Synthesis Virtual Chemistry Lab

An interactive, standalone virtual chemistry laboratory focused specifically on aspirin synthesis. This component allows students to learn the process of synthesizing acetylsalicylic acid (aspirin) through guided, step-by-step virtual experiments.

## Features

- **Interactive Drag & Drop Interface**: Drag equipment and chemicals to the virtual workbench
- **Guided Step-by-Step Process**: Follow the complete aspirin synthesis procedure
- **Realistic Chemistry Animations**: Visual feedback for heating, mixing, and chemical reactions
- **Real-time Temperature Monitoring**: Temperature control for the heating phase
- **Progress Tracking**: Visual progress indicators for each synthesis step
- **Completion Tracking**: Celebration modal when synthesis is completed

## Aspirin Synthesis Steps

1. **Set up Erlenmeyer Flask** - Place the 125mL flask on the workbench
2. **Add Salicylic Acid** - Add 2.0g of the starting material
3. **Add Acetic Anhydride** - Add 5mL of the acetylating agent
4. **Add Catalyst** - Add phosphoric acid catalyst drops
5. **Set up Water Bath** - Prepare heating apparatus
6. **Heat Reaction** - Heat at 85°C for 15 minutes to complete synthesis

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start development server:**

   ```bash
   npm run dev
   ```

3. **Build for production:**

   ```bash
   npm run build
   ```

4. **Preview production build:**
   ```bash
   npm run preview
   ```

## Integration into Your Website

### Option 1: React Component

If you're using React, you can import the component directly:

```jsx
import AspirinSynthesis from "./src/AspirinSynthesis.jsx";

function MyApp() {
  return (
    <div>
      <h1>My Chemistry Course</h1>
      <AspirinSynthesis />
    </div>
  );
}
```

### Option 2: Standalone HTML

Build the project and include the generated files:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>My Chemistry Lab</title>
    <!-- Include built CSS -->
    <link rel="stylesheet" href="./dist/assets/index.css" />
  </head>
  <body>
    <div id="aspirin-lab"></div>
    <!-- Include built JS -->
    <script src="./dist/assets/index.js"></script>
  </body>
</html>
```

### Option 3: iframe Embed

Host the built files and embed via iframe:

```html
<iframe
  src="path/to/aspirin-synthesis/index.html"
  width="100%"
  height="800px"
  frameborder="0"
>
</iframe>
```

## Customization

### Styling

The component uses Tailwind CSS for styling. You can customize:

- Colors in `tailwind.config.js`
- Animations in `src/index.css`
- Component layout in `src/AspirinSynthesis.jsx`

### Content

Modify the guided steps, chemicals, or equipment by editing the data arrays in `AspirinSynthesis.jsx`:

```jsx
const aspirinGuidedSteps = [
  // Add or modify steps here
];

const experimentChemicals = [
  // Add or modify chemicals here
];

const experimentEquipment = [
  // Add or modify equipment here
];
```

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Supports drag & drop API
- Responsive design for desktop and tablet

## Dependencies

- **React 18** - UI framework
- **Lucide React** - Icon library
- **Framer Motion** - Animation library
- **Tailwind CSS** - Styling framework
- **Vite** - Build tool

## File Structure

```
aspirin-synthesis-standalone/
���── src/
│   ├── AspirinSynthesis.jsx    # Main component
│   ├── main.jsx                # React entry point
│   └── index.css               # Styles and animations
├── index.html                  # HTML template
├── package.json                # Dependencies and scripts
├── vite.config.js             # Build configuration
├── tailwind.config.js         # Tailwind customization
└── postcss.config.js          # PostCSS configuration
```

## Performance

- Optimized bundle splitting
- Lazy loading of animations
- Efficient state management
- Minimal re-renders

## License

This project is open source and available under the MIT License.

## Support

For questions or issues:

1. Check the browser console for error messages
2. Ensure all dependencies are installed
3. Verify browser compatibility
4. Check that drag & drop is enabled

## Educational Use

This virtual lab is designed for educational purposes to help students:

- Understand organic chemistry synthesis
- Learn laboratory procedures safely
- Practice equipment usage
- Visualize chemical reactions
- Track experimental progress

Perfect for chemistry courses, online learning platforms, and educational websites.
