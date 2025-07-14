# ChemLab Virtual Laboratory

A comprehensive virtual chemistry laboratory application featuring interactive experiments for educational purposes.

![ChemLab Screenshot](https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&h=600)

## 🧪 Available Experiments

### 1. Aspirin Synthesis

- **Category:** Organic Chemistry
- **Difficulty:** Intermediate
- **Duration:** ~45 minutes
- **Concepts:** Esterification reactions, purification techniques
- **Equipment:** Erlenmeyer flasks, thermometer, water bath, vacuum filtration

### 2. Acid-Base Titration

- **Category:** Analytical Chemistry
- **Difficulty:** Beginner
- **Duration:** ~30 minutes
- **Concepts:** Neutralization, endpoint detection, molarity calculations
- **Equipment:** Burette, conical flask, pH meter, indicators

## ✨ Features

- 🔬 **Interactive Virtual Lab** - Realistic laboratory environment
- 📊 **Real-time Data Analysis** - pH monitoring, statistical calculations
- 🧮 **Automatic Calculations** - Molarity, yield, concentration analysis
- 📈 **Results Tracking** - Trial logging, precision analysis
- 🔍 **Chemical Formulas** - Complete reaction equations and mechanisms
- ⚠️ **Safety Information** - Proper laboratory safety protocols
- 📱 **Responsive Design** - Works on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/YOUR_USERNAME/chemlab-virtual-laboratory.git
   cd chemlab-virtual-laboratory
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   http://localhost:5000
   ```

## 📦 Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload

# Production
npm run build        # Build for production
npm start           # Start production server

# Development Tools
npm run check       # TypeScript type checking
npm run db:push     # Database operations (if using)
```

## 🏗️ Technology Stack

### Frontend

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Smooth animations
- **Recharts** - Data visualization

### Backend

- **Express.js** - Web framework
- **TypeScript** - Server-side type safety
- **Drizzle ORM** - Type-safe database operations
- **Session Management** - User state persistence

### Development Tools

- **ESBuild** - Fast JavaScript bundler
- **TSX** - TypeScript execution
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

## 📁 Project Structure

```
chemlab-virtual-laboratory/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── VirtualLab/     # Virtual lab components
│   │   │   │   ├── VirtualLabApp.tsx
│   │   │   │   ├── PHMeterSimulation.tsx
│   │   │   │   ├── MeasurementsPanel.tsx
│   │   │   │   ├── ChemicalFormulas.tsx
│   │   │   │   ├── ResultsPanel.tsx
│   │   │   │   └── ...
│   │   │   └── ui/             # Reusable UI components
│   │   ├── pages/              # Application pages
│   │   ├── hooks/              # Custom React hooks
│   │   └── lib/                # Utility functions
│   └── index.html
├── server/                 # Backend Express application
│   ├── index.ts           # Main server file
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Data persistence
│   └── vite.ts            # Vite integration
├── data/
│   └── experiments.json   # Experiment configurations
├── shared/                # Shared TypeScript types
└── package.json
```

## 🧪 Experiment Details

### Aspirin Synthesis

Experience the classic organic chemistry synthesis:

- Measure reagents (salicylic acid, acetic anhydride)
- Add phosphoric acid catalyst
- Heat reaction mixture to 85°C
- Crystallization and purification
- Yield calculations and purity testing

### Acid-Base Titration

Master analytical chemistry techniques:

- Set up burette and conical flask
- Add phenolphthalein indicator
- Titrate HCl with standardized NaOH
- Detect color change endpoint
- Calculate unknown concentration
- Statistical analysis of multiple trials

## 🔧 Configuration

### Environment Variables

```bash
NODE_ENV=development|production
PORT=5000
DATABASE_URL=your_database_url (optional)
```

### Database Setup (Optional)

```bash
npm run db:push    # Initialize database schema
```

## 🚀 Deployment

### Local Production

```bash
npm run build
npm start
```

### Docker

```bash
docker build -t chemlab .
docker run -p 5000:5000 chemlab
```

### Cloud Platforms

- **Vercel:** Deploy with zero configuration
- **Railway:** Full-stack deployment
- **Replit:** Development and hosting
- **Heroku:** Traditional PaaS deployment

## 📊 Features in Detail

### pH Meter Simulation

- Real-time pH monitoring with drift and noise
- Calibration procedures with buffer solutions
- Temperature compensation
- Measurement history logging
- Battery level simulation

### Statistical Analysis

- Multiple trial tracking
- Mean, standard deviation, RSD calculations
- Precision assessment (Excellent/Good/Acceptable/Poor)
- Molarity calculations from titration data
- Experimental observation logging

### Chemical Reaction Engine

- Dynamic color mixing based on chemical combinations
- Realistic reaction detection
- Balanced chemical equations
- Reaction mechanisms and thermodynamics
- Safety information and protocols

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Chemistry educators for experimental procedures
- React and TypeScript communities
- Open source contributors
- Educational institutions using virtual labs

## 📞 Support

- Create an issue for bug reports
- Submit feature requests via GitHub Issues
- Check the documentation for common solutions

---

**Built with ❤️ for chemistry education**
