import { CheckCircle, PlayCircle, Lock } from 'lucide-react';

export default function JourneyMap({ milestones }) {
  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto py-10 space-y-8">
      {milestones.map((node, index) => (
        <div key={node.id} className="relative flex flex-col items-center w-full">

          {/* Connector Line */}
          {index !== 0 && (
            <div className={`w-1 h-16 ${node.status === 'completed' ? 'bg-green-500' : 'bg-gray-700'}`} />
          )}

          {/* Node Card */}
          <div className={`w-full p-4 border rounded-xl transition-all duration-300 ${node.status === 'completed' ? 'border-green-500 bg-green-900/20 shadow-[0_0_15px_rgba(34,197,94,0.3)]' :
            node.status === 'active' ? 'border-blue-500 bg-blue-900/20 animate-pulse' :
              'border-gray-700 opacity-40 blur-[2px] pointer-events-none' /* Fog of War */
            }`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">{node.title}</h3>
                <p className="text-sm text-gray-400">{node.type} • {node.duration_mins} mins</p>
              </div>

              {/* Dynamic Icons */}
              {node.status === 'completed' && <CheckCircle className="text-green-500 w-8 h-8" />}
              {node.status === 'active' && <PlayCircle className="text-blue-500 w-8 h-8" />}
              {node.status === 'locked' && <Lock className="text-gray-500 w-8 h-8" />}
            </div>

            {/* Active Accordion Expansion */}
            {node.status === 'active' && (
              <div className="mt-4 p-4 bg-black/50 rounded-lg">
                <button className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-md transition-colors">
                  Check-in & Consume Media
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}