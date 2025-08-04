# Neural Network Game Portfolio

A sleek and modern 3D neural network game portfolio showcasing your team's games through interactive floating brain models with smooth animations and a minimalistic black/white/yellow theme.

## Features

- **Interactive 3D Brain Models**: Each floating brain represents a different game from your portfolio
- **Realistic FBX Brain Models**: High-quality 3D brain models with transparent materials
- **Purple Hover Effects**: Brain outlines glow purple when hovered over
- **Smooth Animations**: Fluid GSAP-powered transitions and hover effects
- **Minimalistic Design**: Clean black/white/yellow color scheme
- **Responsive Interface**: Works seamlessly on desktop and mobile devices
- **Game Information Panel**: Detailed game descriptions, tags, and play buttons
- **Immersive 3D Environment**: Beautiful particle systems and atmospheric effects
- **Neural Network Theme**: Central brain with electrical connections to game brains
- **Click to Play**: Direct links to your games

## Game Showcase

The portfolio currently features 6 sample games:
- **Puzzle Quest**: Mind-bending puzzle adventure
- **Space Runner**: High-speed space racing
- **Tower Defense Pro**: Strategic defense gameplay
- **Epic RPG Adventure**: Open-world fantasy RPG
- **Neon Platformer**: Fast-paced 2D platformer
- **Neural Simulator**: Consciousness simulation experience

## Controls

- **Mouse Movement**: Navigate the 3D space and look around
- **Hover**: Hover over brain models to see purple highlights and game information
- **Click**: Select a brain model to focus and view details
- **Mouse Wheel**: Zoom in and out
- **Auto-Rotation**: Brains float and rotate automatically

## Technologies

- **Three.js**: 3D graphics and WebGL rendering
- **FBX Loader**: Loading high-quality 3D brain models
- **GSAP**: Smooth animations and transitions
- **Vite**: Fast development server and build tool
- **Post-processing**: Bloom effects for enhanced visuals
- **Modern CSS**: Responsive design with custom animations

## 📦 Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open `http://localhost:3000` in your browser

## � Customization

### Adding New Games

To add your own games, modify the `games` array in `src/main.js`:

```javascript
{
    id: 'your-game-id',
    title: 'Your Game Title',
    description: 'Detailed description of your game...',
    tags: ['Genre', 'Platform', 'Style'],
    url: 'https://your-game-url.com',
    position: { x: 0, y: 0, z: 0 },
    color: 0xffff00 // or 0xffffff
}
```

### Changing Colors

The theme uses three main colors:
- **Black**: `#000000` (background)
- **White**: `#ffffff` (text and some cubes)
- **Yellow**: `#ffff00` (accents and highlights)

### Adjusting Animations

Modify timing and easing in the GSAP animations:
- Hover animations: `.duration(0.3)`
- Selection animations: `.duration(0.5)`
- Camera focus: `.duration(1.5)`

## 🌟 Visual Effects

- **Particle Systems**: Background particles and cube-specific effects
- **Bloom Lighting**: Soft glow effects on interactive elements
- **Smooth Transitions**: All interactions use eased animations
- **Dynamic Scaling**: Hover and selection states with smooth scaling
- **Floating Animation**: Cubes gently float up and down

## 📱 Mobile Optimization

- Touch-friendly interactions
- Responsive UI layout
- Optimized particle count for performance
- Mobile-specific control hints

## 🚀 Deployment

Build for production:
```bash
npm run build
```

The optimized files will be in the `dist` folder, ready for deployment to any web server.

## 🔧 Performance Tips

- Particle count is optimized for smooth 60fps
- Post-processing effects are lightweight
- Textures and models are efficiently managed
- Automatic cleanup of unused resources

---

Transform your game portfolio into an engaging 3D experience! �✨
