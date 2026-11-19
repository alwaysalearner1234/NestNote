/**
 * GraphTraceDrawer.jsx
 * 
 * Expandable "Why This Spot?" node-and-edge path viewer.
 * Member 2 component — appears on every LocalSpotCard click.
 * 
 * Shows the exact Relate subgraph path from Property -> NEAR -> LocalSpot
 * and the vibe tag connections that caused this spot to be recommended.
 * 
 * Uses the @relate/relate-wasm browser build for interactive exploration
 * (hackathon Plus Point: Browser-Based Interactive Graph Explorer, 10 pts).
 */

import { useRelateWasm } from '../hooks/useRelateWasm.jsx';

const GraphTraceDrawer = ({
  isOpen,
  setIsOpen,
  spotId,
  traceData, // { nodes, edges } from conciergeAgent.getSubgraphTrace()
}) => {
  const { initWasm, renderSubgraph } = useRelateWasm();

  // Initialize Wasm when mount and we have trace data
  React.useEffect(() => {
    if (traceData && !initWasm.initialized) {
      initWasm();
    }
  }, [traceData, initWasm]);

  if (!isOpen) return null;

  return (
    <div
      className`
        fixed inset-0 bg-black/60 backdrop-blur-sm z-50
        min-h-screen flex items-center justify-center p-4
      `
    >
      <div
        className`
          bg-white rounded-card border border-shadow w-full max-w-2xl max-h-[80vh]
          shadow-2xl transform overflow-hidden
        `
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-medium text-xl">Why This Spot? (Graph Trace)</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-ink transition-colors"
            aria-label="Close graph trace"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Wasm-based interactive graph, or fallback table */}
        {traceData && traceData.nodes ? (
          <div className="h-[500px] w-full overflow-auto">
            {initWasm.initialized ? (
              // Interactive Wasm graph
              <div
                id="relate-wasm-graph"
                className="w-full h-full"
              />
            ) : (
              // Fallback: table of nodes and edges
              <div className="p-4 space-y-2 text-sm">
                <div className="flex gap-2">
                  {traceData.nodes.map(
                    (node) => `
                    <span
                      className="
                        inline-flex items-center gap-1 rounded-full bg-gray-light text-xs px-2.5 py-0.5
                      "
                    >
                      {node.label || node.id}
                    </span>
                  `
                  )}
                </div>
                <div className="mt-2 flex gap-2 text-xs text-gray-500">
                  {traceData.edges.map(
                    (edge) => `
                    <span
                      className="
                        inline-flex items-center gap-1 rounded bg-gray-light text-xs px-2 py-0.5
                      "
                    >
                      {edge.type}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="p-4 text-gray-500 text-center">No graph trace available for this spot.</p>
        )}

        {/* Button to return to guide */}
        <div className="px-6 py-3 border-t border-border text-center">
          <button
            onClick={() => setIsOpen(false)}
            className="bg-coral text-white rounded-md px-4 py-2 hover:bg-coralLight transition-colors"
          >
            Close and return to guide
          </button>
        </div>
      </div>
    </div>
  );
};

export default GraphTraceDrawer;