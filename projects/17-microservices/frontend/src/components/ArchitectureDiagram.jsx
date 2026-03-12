export default function ArchitectureDiagram() {
  const services = [
    { name: 'Frontend', port: '5173', color: 'bg-violet-500/20 border-violet-500/40 text-violet-300', icon: '🖥️' },
    { name: 'API Gateway', port: '3005', color: 'bg-blue-500/20 border-blue-500/40 text-blue-300', icon: '🚪' },
    { name: 'User Service', port: '3011', color: 'bg-green-500/20 border-green-500/40 text-green-300', icon: '👤' },
    { name: 'Product Service', port: '3012', color: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300', icon: '📦' },
    { name: 'Order Service', port: '3013', color: 'bg-orange-500/20 border-orange-500/40 text-orange-300', icon: '🛒' },
  ];

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <h3 className="text-lg font-semibold text-white mb-6">🏗️ Architecture Diagram</h3>
      <div className="flex flex-col items-center gap-3">
        {/* Frontend */}
        <div className={`${services[0].color} border rounded-xl px-6 py-3 text-center font-medium w-48`}>
          <span className="mr-2">{services[0].icon}</span>{services[0].name}
          <div className="text-xs opacity-60 mt-0.5">:{services[0].port}</div>
        </div>
        {/* Arrow down */}
        <div className="text-slate-500 text-xl">↓</div>
        {/* Gateway */}
        <div className={`${services[1].color} border rounded-xl px-6 py-3 text-center font-medium w-48`}>
          <span className="mr-2">{services[1].icon}</span>{services[1].name}
          <div className="text-xs opacity-60 mt-0.5">:{services[1].port}</div>
        </div>
        {/* Fork arrows */}
        <div className="flex items-center gap-1 text-slate-500 text-sm">
          <span>↙</span><span className="mx-6">↓</span><span>↘</span>
        </div>
        {/* Microservices */}
        <div className="flex gap-4 flex-wrap justify-center">
          {services.slice(2).map(svc => (
            <div key={svc.name} className={`${svc.color} border rounded-xl px-4 py-3 text-center font-medium min-w-[130px]`}>
              <div className="text-2xl mb-1">{svc.icon}</div>
              <div className="text-sm">{svc.name}</div>
              <div className="text-xs opacity-60 mt-0.5">:{svc.port}</div>
            </div>
          ))}
        </div>
        {/* Data stores */}
        <div className="flex items-center gap-1 text-slate-500 text-sm">
          <span>↓</span>
        </div>
        <div className="flex gap-4">
          {['👥 Users DB', '🛍️ Products DB', '📋 Orders DB'].map(db => (
            <div key={db} className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-xs text-slate-400 text-center">
              {db}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
