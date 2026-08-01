import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Plus, Filter, Info, InfoIcon } from 'lucide-react';

const CATEGORY_STYLES = {
  tech: {
    color: '#6366F1', // Indigo
    glow: 'rgba(99, 102, 241, 0.6)',
    label: 'Technical Systems'
  },
  life: {
    color: '#10B981', // Emerald
    glow: 'rgba(16, 185, 129, 0.6)',
    label: 'Well-being & Recovery'
  },
  ethics: {
    color: '#F59E0B', // Amber
    glow: 'rgba(245, 158, 11, 0.6)',
    label: 'Ethics & Philosophy'
  },
  design: {
    color: '#EC4899', // Pink
    glow: 'rgba(236, 72, 153, 0.6)',
    label: 'Creative & Design'
  }
};

const INITIAL_NODES = [
  { id: '1', label: 'Machine Learning', category: 'tech', weight: 8, description: 'Neural Networks & Statistical Learning' },
  { id: '2', label: 'Deep Learning', category: 'tech', weight: 10, description: 'Transformers, CNNs & RL Models' },
  { id: '3', label: 'NLP Systems', category: 'tech', weight: 7, description: 'LLMs, Prompt Tuning & RAG Pipelines' },
  { id: '4', label: 'Robotics Control', category: 'tech', weight: 5, description: 'Inverse Kinematics & Control Theory' },
  { id: '5', label: 'Data Ethics', category: 'ethics', weight: 7, description: 'AI Safety, Alignment & Privacy Guidelines' },
  { id: '6', label: 'Mindfulness', category: 'life', weight: 8, description: 'Stress Reduction & Present Awareness' },
  { id: '7', label: 'Circadian Sleep', category: 'life', weight: 9, description: 'Optimize HRV & Melatonin Baselines' },
  { id: '8', label: 'Biohacking', category: 'life', weight: 5, description: 'Physical Metrics & Optimal Nutrition' },
  { id: '9', label: 'Stoicism', category: 'ethics', weight: 6, description: 'Resilience, Epictetus & Marcus Aurelius' },
  { id: '10', label: 'Focus Blocking', category: 'life', weight: 8, description: 'High-Density Deep Work Windows' },
  { id: '11', label: 'UI Typography', category: 'design', weight: 6, description: 'Visual Hierarchy & Grid Systems' },
  { id: '12', label: 'Creative Coding', category: 'design', weight: 8, description: '2D Canvas, WebGL & Interactive Graphics' }
];

const INITIAL_LINKS = [
  { source: '1', target: '2' },
  { source: '2', target: '3' },
  { source: '1', target: '4' },
  { source: '1', target: '5' },
  { source: '5', target: '9' },
  { source: '6', target: '7' },
  { source: '7', target: '8' },
  { source: '6', target: '10' },
  { source: '10', target: '12' },
  { source: '11', target: '12' },
  { source: '11', target: '3' },
  { source: '2', target: '12' },
  { source: '9', target: '6' }
];

export default function IdentityGraph({ filterCategory = 'all', setFilterCategory }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  
  // Simulation State
  const [nodes, setNodes] = useState(INITIAL_NODES);
  const [links, setLinks] = useState(INITIAL_LINKS);
  const [isPlaying, setIsPlaying] = useState(true);
  
  // Custom Controls
  const [showAddNode, setShowAddNode] = useState(false);
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [newNodeCat, setNewNodeCat] = useState('tech');
  const [newNodeWeight, setNewNodeWeight] = useState(5);
  const [newNodeDesc, setNewNodeDesc] = useState('');
  
  // Interactive Hover/Selection Info card
  const [selectedNode, setSelectedNode] = useState(null);
  
  // Interactive references for physics loops
  const simulationRef = useRef({
    nodes: [],
    links: [],
    draggingNode: null,
    hoveredNode: null,
    mouse: { x: 0, y: 0, px: 0, py: 0, isDown: false },
    particles: [] // energy pulses flowing along links
  });

  // Load and update internal physics state from React state
  useEffect(() => {
    const sim = simulationRef.current;
    
    // Merge positions if nodes exist to prevent total resetting
    const existingMap = new Map(sim.nodes.map(n => [n.id, n]));
    
    sim.nodes = nodes.map(node => {
      const existing = existingMap.get(node.id);
      const canvas = canvasRef.current;
      const width = canvas ? canvas.width : 600;
      const height = canvas ? canvas.height : 450;
      
      return {
        ...node,
        x: existing ? existing.x : width / 2 + (Math.random() - 0.5) * 150,
        y: existing ? existing.y : height / 2 + (Math.random() - 0.5) * 150,
        vx: existing ? existing.vx : 0,
        vy: existing ? existing.vy : 0,
        radius: 12 + node.weight * 2.5 // scale radius dynamically based on mastery weight
      };
    });

    // Resolve string targets to actual node object references
    sim.links = links.map(link => {
      return {
        sourceId: typeof link.source === 'object' ? link.source.id : link.source,
        targetId: typeof link.target === 'object' ? link.target.id : link.target
      };
    }).filter(link => {
      // make sure both endpoints exist in our list
      const sExists = sim.nodes.some(n => n.id === link.sourceId);
      const tExists = sim.nodes.some(n => n.id === link.targetId);
      return sExists && tExists;
    });

    // Initialize particles occasionally running along links
    sim.particles = [];
    for (let i = 0; i < sim.links.length; i++) {
      if (Math.random() > 0.4) {
        sim.particles.push(createParticle(sim.links[i]));
      }
    }

  }, [nodes, links]);

  const createParticle = (link) => {
    return {
      link,
      progress: Math.random(), // 0 to 1
      speed: 0.005 + Math.random() * 0.008,
      size: 1.5 + Math.random() * 2
    };
  };

  // Main Canvas Rendering & Physics solver loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    // Resize handler
    const resizeCanvas = () => {
      if (containerRef.current && canvasRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        canvasRef.current.width = rect.width;
        canvasRef.current.height = rect.height;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Physics constants
    const repulsionStrength = 180;
    const springStrength = 0.018;
    const desiredLength = 110;
    const centerGravity = 0.015;
    const friction = 0.88;

    const tick = () => {
      const sim = simulationRef.current;
      const width = canvas.width;
      const height = canvas.height;
      const center = { x: width / 2, y: height / 2 };

      // Apply physics if simulation is running
      if (isPlaying) {
        // 1. REPULSION FORCE (Charge): push all nodes away from each other
        for (let i = 0; i < sim.nodes.length; i++) {
          const n1 = sim.nodes[i];
          for (let j = i + 1; j < sim.nodes.length; j++) {
            const n2 = sim.nodes[j];
            
            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            
            // Limit minimum distance to avoid explosive acceleration
            if (dist < 400) {
              const force = (repulsionStrength * (n1.radius + n2.radius)) / (dist * dist);
              const fx = (dx / dist) * force;
              const fy = (dy / dist) * force;
              
              if (n1 !== sim.draggingNode) {
                n1.vx -= fx;
                n1.vy -= fy;
              }
              if (n2 !== sim.draggingNode) {
                n2.vx += fx;
                n2.vy += fy;
              }
            }
          }
        }

        // 2. ATTRACTION FORCE (Springs): pull connected nodes together
        sim.links.forEach(link => {
          const sNode = sim.nodes.find(n => n.id === link.sourceId);
          const tNode = sim.nodes.find(n => n.id === link.targetId);
          if (!sNode || !tNode) return;

          const dx = tNode.x - sNode.x;
          const dy = tNode.y - sNode.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          
          // Spring force calculation
          const displacement = dist - desiredLength;
          const force = displacement * springStrength;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          if (sNode !== sim.draggingNode) {
            sNode.vx += fx;
            sNode.vy += fy;
          }
          if (tNode !== sim.draggingNode) {
            tNode.vx -= fx;
            tNode.vy -= fy;
          }
        });

        // 3. GRAVITY FORCE: pull all nodes gently to the center
        sim.nodes.forEach(node => {
          if (node === sim.draggingNode) return;
          const dx = center.x - node.x;
          const dy = center.y - node.y;
          
          node.vx += dx * centerGravity;
          node.vy += dy * centerGravity;
        });

        // 4. INTEGRATION: Apply velocities, drag, update positions
        sim.nodes.forEach(node => {
          if (node === sim.draggingNode) return;
          
          node.vx *= friction;
          node.vy *= friction;
          node.x += node.vx;
          node.y += node.vy;

          // Boundary constraint
          node.x = Math.max(node.radius, Math.min(width - node.radius, node.x));
          node.y = Math.max(node.radius, Math.min(height - node.radius, node.y));
        });
      }

      // Update dragging node position directly from mouse coordinates
      if (sim.draggingNode) {
        sim.draggingNode.x = sim.mouse.x;
        sim.draggingNode.y = sim.mouse.y;
        sim.draggingNode.vx = 0;
        sim.draggingNode.vy = 0;
      }

      // Update link particles progress
      sim.particles.forEach(p => {
        p.progress += p.speed;
        if (p.progress >= 1) {
          p.progress = 0;
          // select a random active link occasionally
          if (sim.links.length > 0) {
            p.link = sim.links[Math.floor(Math.random() * sim.links.length)];
          }
        }
      });

      // RENDER CANVAS
      ctx.clearRect(0, 0, width, height);

      // Draw active grids in background for premium high-tech blueprint feel
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Links (lines)
      sim.links.forEach(link => {
        const sNode = sim.nodes.find(n => n.id === link.sourceId);
        const tNode = sim.nodes.find(n => n.id === link.targetId);
        if (!sNode || !tNode) return;

        // Dim inactive links if category filter is active
        const isSourceFiltered = filterCategory !== 'all' && sNode.category !== filterCategory;
        const isTargetFiltered = filterCategory !== 'all' && tNode.category !== filterCategory;
        const isHighlighted = sim.hoveredNode && (sNode.id === sim.hoveredNode.id || tNode.id === sim.hoveredNode.id);

        ctx.beginPath();
        ctx.moveTo(sNode.x, sNode.y);
        ctx.lineTo(tNode.x, tNode.y);

        if (isHighlighted) {
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
          ctx.lineWidth = 2.5;
        } else if (isSourceFiltered || isTargetFiltered) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
          ctx.lineWidth = 1;
        } else {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.lineWidth = 1.2;
        }
        ctx.stroke();
      });

      // Draw Link Pulse Particles
      sim.particles.forEach(p => {
        const sNode = sim.nodes.find(n => n.id === p.link.sourceId);
        const tNode = sim.nodes.find(n => n.id === p.link.targetId);
        if (!sNode || !tNode) return;

        // Draw small glowing particle dot traveling along link
        const px = sNode.x + (tNode.x - sNode.x) * p.progress;
        const py = sNode.y + (tNode.y - sNode.y) * p.progress;

        const catStyle = CATEGORY_STYLES[sNode.category] || CATEGORY_STYLES.tech;

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = catStyle.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = catStyle.color;
        ctx.fill();
        // Reset shadow
        ctx.shadowBlur = 0;
      });

      // Draw Nodes (circles + labels)
      sim.nodes.forEach(node => {
        const catStyle = CATEGORY_STYLES[node.category] || CATEGORY_STYLES.tech;
        const isFiltered = filterCategory !== 'all' && node.category !== filterCategory;
        const isHovered = sim.hoveredNode && sim.hoveredNode.id === node.id;
        
        ctx.save();

        // 1. Draw outer glowing rings
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + (isHovered ? 4 : 2), 0, Math.PI * 2);
        
        if (isFiltered) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
          ctx.lineWidth = 1;
          ctx.stroke();
          
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(15, 23, 42, 0.2)';
          ctx.fill();
          
          ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        } else {
          // Glow effect for active nodes
          ctx.shadowBlur = isHovered ? 20 : 10;
          ctx.shadowColor = catStyle.glow;
          ctx.strokeStyle = catStyle.color;
          ctx.lineWidth = isHovered ? 3 : 2;
          ctx.stroke();
          
          // Inside Capsule Gradient
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
          
          const grad = ctx.createRadialGradient(node.x, node.y - node.radius/3, 2, node.x, node.y, node.radius);
          grad.addColorStop(0, '#1E293B'); // High-end dark metallic center
          grad.addColorStop(1, '#0F172A');
          ctx.fillStyle = grad;
          ctx.fill();
          
          // Draw mini category indicator dot in core
          ctx.beginPath();
          ctx.arc(node.x, node.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = catStyle.color;
          ctx.fill();

          ctx.fillStyle = '#E2E8F0'; // light text for readable label
        }

        // 2. Draw Text Labels
        ctx.font = `bold ${node.radius * 0.35 + 6}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Truncate text if it is too long for the node
        let label = node.label;
        const maxLen = Math.floor(node.radius / 3.5) + 3;
        if (label.length > maxLen) {
          label = label.substring(0, maxLen - 2) + '..';
        }

        ctx.fillText(label, node.x, node.y + (node.radius + 15));
        ctx.restore();
      });

      animId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isPlaying, filterCategory]);

  // Handle Canvas Interaction
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const sim = simulationRef.current;
    sim.mouse.isDown = true;

    // Check hit test on nodes
    let clickedNode = null;
    for (let i = 0; i < sim.nodes.length; i++) {
      const node = sim.nodes[i];
      const dx = x - node.x;
      const dy = y - node.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist <= node.radius + 10) {
        clickedNode = node;
        break;
      }
    }

    if (clickedNode) {
      sim.draggingNode = clickedNode;
      setSelectedNode(clickedNode); // Display selection info card
    } else {
      setSelectedNode(null);
    }
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const sim = simulationRef.current;
    sim.mouse.px = sim.mouse.x;
    sim.mouse.py = sim.mouse.y;
    sim.mouse.x = x;
    sim.mouse.y = y;

    // Handle Hover detection
    let currentHover = null;
    for (let i = 0; i < sim.nodes.length; i++) {
      const node = sim.nodes[i];
      const dx = x - node.x;
      const dy = y - node.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist <= node.radius + 10) {
        currentHover = node;
        break;
      }
    }
    
    if (currentHover !== sim.hoveredNode) {
      sim.hoveredNode = currentHover;
      canvas.style.cursor = currentHover ? 'grab' : 'default';
    }
    
    if (sim.draggingNode) {
      canvas.style.cursor = 'grabbing';
    }
  };

  const handleMouseUp = () => {
    const sim = simulationRef.current;
    if (sim.draggingNode) {
      // Throw physics: impart mouse velocity
      const throwSpeedLimit = 15;
      sim.draggingNode.vx = Math.max(-throwSpeedLimit, Math.min(throwSpeedLimit, (sim.mouse.x - sim.mouse.px) * 0.7));
      sim.draggingNode.vy = Math.max(-throwSpeedLimit, Math.min(throwSpeedLimit, (sim.mouse.y - sim.mouse.py) * 0.7));
      sim.draggingNode = null;
    }
    sim.mouse.isDown = false;
  };

  // Add Dynamic Node Handler
  const handleAddNodeSubmit = (e) => {
    e.preventDefault();
    if (!newNodeLabel.trim()) return;

    const id = Math.random().toString(36).substr(2, 9);
    const node = {
      id,
      label: newNodeLabel.trim(),
      category: newNodeCat,
      weight: parseInt(newNodeWeight),
      description: newNodeDesc.trim() || 'A newly integrated growth Node.'
    };

    // Auto-create connection to a random node in the same category (or any node if empty)
    const matchingNodes = nodes.filter(n => n.category === newNodeCat);
    const linkTarget = matchingNodes.length > 0 
      ? matchingNodes[Math.floor(Math.random() * matchingNodes.length)] 
      : nodes[Math.floor(Math.random() * nodes.length)];

    setNodes(prev => [...prev, node]);
    
    if (linkTarget) {
      setLinks(prev => [...prev, { source: id, target: linkTarget.id }]);
    }

    // Reset input states
    setNewNodeLabel('');
    setNewNodeDesc('');
    setShowAddNode(false);
  };

  const handleReset = () => {
    // Re-shuffle positions randomly and re-center
    const sim = simulationRef.current;
    const canvas = canvasRef.current;
    const width = canvas ? canvas.width : 600;
    const height = canvas ? canvas.height : 450;

    sim.nodes.forEach(node => {
      node.x = width / 2 + (Math.random() - 0.5) * 200;
      node.y = height / 2 + (Math.random() - 0.5) * 200;
      node.vx = 0;
      node.vy = 0;
    });
  };

  return (
    <div className="h-full flex flex-col bg-brand-card/30 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative">
      
      {/* Control Overlay Bar */}
      <div className="p-4 border-b border-white/5 flex flex-wrap items-center justify-between gap-3 bg-brand-dark/40 z-10">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse-glow" />
          <h3 className="font-bold text-sm text-slate-100 tracking-wider">IDENTITY GRAPH</h3>
        </div>

        {/* Action button controls */}
        <div className="flex items-center gap-1.5">
          {/* Pause / Play */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-2 rounded-lg transition duration-150 ${
              isPlaying ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-slate-400 hover:bg-white/5'
            }`}
            title={isPlaying ? 'Pause Simulation' : 'Resume Simulation'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          {/* Reset */}
          <button
            onClick={handleReset}
            className="p-2 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition duration-150"
            title="Recenter/Reset Physics"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-white/10 mx-1" />

          {/* Category Filters */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilterCategory('all')}
              className={`text-xs px-2.5 py-1.5 rounded-md font-medium border transition ${
                filterCategory === 'all'
                  ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            {Object.keys(CATEGORY_STYLES).map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`text-xs px-2.5 py-1.5 rounded-md font-medium border transition ${
                  filterCategory === cat
                    ? `border-[${CATEGORY_STYLES[cat].color}] text-[${CATEGORY_STYLES[cat].color}]`
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
                style={{
                  borderColor: filterCategory === cat ? CATEGORY_STYLES[cat].color : 'transparent',
                  backgroundColor: filterCategory === cat ? `${CATEGORY_STYLES[cat].color}15` : 'transparent',
                  color: filterCategory === cat ? CATEGORY_STYLES[cat].color : undefined
                }}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-white/10 mx-1" />

          {/* Add Node Trigger */}
          <button
            onClick={() => setShowAddNode(!showAddNode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border transition ${
              showAddNode 
                ? 'bg-rose-500/15 border-rose-500/20 text-rose-400 hover:bg-rose-500/25' 
                : 'bg-emerald-500/15 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/25'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddNode ? 'Cancel' : 'Add Node'}</span>
          </button>
        </div>
      </div>

      {/* Canvas Node Container */}
      <div 
        ref={containerRef}
        className="flex-1 w-full bg-brand-darker relative overflow-hidden"
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="absolute inset-0 block select-none"
        />

        {/* Instruction overlay when graph is empty */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-brand-darker/80 z-10">
            <Info className="w-12 h-12 text-slate-500 mb-3" />
            <h4 className="font-bold text-slate-300">Identity Graph Empty</h4>
            <p className="text-sm text-slate-500 max-w-xs mt-1">Start by adding your first wellbeing or learning nodes in the top corner!</p>
          </div>
        )}

        {/* Info Instruction Banner */}
        <div className="absolute bottom-4 left-4 p-2 bg-black/40 border border-white/5 rounded-lg text-[10px] text-slate-400 pointer-events-none z-10 flex items-center gap-1.5 backdrop-blur-sm">
          <InfoIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Click & Drag nodes to stretch physics links. Click to reveal Details.</span>
        </div>

        {/* Hover / Selection info box */}
        {selectedNode && (
          <div className="absolute top-4 left-4 max-w-xs w-72 rounded-2xl border p-4 bg-brand-card/90 border-white/5 shadow-2xl backdrop-blur-xl animate-slide-up z-20">
            <div className="flex items-center justify-between mb-2">
              <span 
                className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border"
                style={{
                  color: CATEGORY_STYLES[selectedNode.category]?.color,
                  borderColor: `${CATEGORY_STYLES[selectedNode.category]?.color}30`,
                  backgroundColor: `${CATEGORY_STYLES[selectedNode.category]?.color}10`
                }}
              >
                {CATEGORY_STYLES[selectedNode.category]?.label || selectedNode.category}
              </span>
              <span className="text-[10px] font-mono text-slate-500">Node Weight: {selectedNode.weight}/10</span>
            </div>
            
            <h4 className="font-bold text-slate-100 text-sm mb-1">{selectedNode.label}</h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">{selectedNode.description}</p>
            
            {/* Display Mastery Bar */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span>Engagement Mastery</span>
                <span className="font-semibold">{selectedNode.weight * 10}%</span>
              </div>
              <div className="w-full h-1.5 bg-black/30 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full rounded-full transition-all duration-300"
                  style={{ 
                    width: `${selectedNode.weight * 10}%`,
                    backgroundColor: CATEGORY_STYLES[selectedNode.category]?.color
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Add Node Popup Form */}
        {showAddNode && (
          <div className="absolute top-4 right-4 w-80 rounded-2xl border p-4 bg-brand-card/95 border-white/5 shadow-2xl backdrop-blur-xl animate-slide-up z-20">
            <h4 className="font-bold text-slate-100 text-sm mb-3 pb-2 border-b border-white/5">Add Growth Target</h4>
            <form onSubmit={handleAddNodeSubmit} className="flex flex-col gap-3">
              {/* Title */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">Node Name</label>
                <input
                  type="text"
                  required
                  value={newNodeLabel}
                  onChange={(e) => setNewNodeLabel(e.target.value)}
                  placeholder="e.g. LLMs, Fasting, Sleep Cycle"
                  className="bg-black/45 border border-white/5 focus:border-indigo-500/40 rounded-lg p-2 text-xs text-white focus:outline-none"
                />
              </div>

              {/* Category */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">Dimension Category</label>
                <select
                  value={newNodeCat}
                  onChange={(e) => setNewNodeCat(e.target.value)}
                  className="bg-black/45 border border-white/5 focus:border-indigo-500/40 rounded-lg p-2 text-xs text-white focus:outline-none"
                >
                  <option value="tech">Technical Systems</option>
                  <option value="life">Well-being & Recovery</option>
                  <option value="ethics">Ethics & Philosophy</option>
                  <option value="design">Creative & Design</option>
                </select>
              </div>

              {/* Weight Slider */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">Aspiration Weight</label>
                  <span className="text-xs font-mono text-emerald-400 font-bold">{newNodeWeight}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={newNodeWeight}
                  onChange={(e) => setNewNodeWeight(e.target.value)}
                  className="w-full accent-emerald-500 bg-black/40 h-1 rounded-lg outline-none cursor-pointer"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">Brief Description</label>
                <textarea
                  value={newNodeDesc}
                  onChange={(e) => setNewNodeDesc(e.target.value)}
                  placeholder="What is your focus with this target?"
                  rows={2}
                  className="bg-black/45 border border-white/5 focus:border-indigo-500/40 rounded-lg p-2 text-xs text-white focus:outline-none resize-none"
                />
              </div>

              {/* Actions */}
              <button
                type="submit"
                className="w-full py-2 mt-2 bg-emerald-500 text-brand-darker font-bold rounded-lg text-xs hover:bg-emerald-400 transition"
              >
                Integrate Node
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
