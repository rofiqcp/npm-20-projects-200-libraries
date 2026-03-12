const STATUS_COLS = {
  scheduled:   { label: 'Scheduled',   color: 'text-blue-400',   bg: 'bg-blue-400/10 border-blue-400/30' },
  in_progress: { label: 'In Progress', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30' },
  completed:   { label: 'Completed',   color: 'text-green-400',  bg: 'bg-green-400/10 border-green-400/30' }
};

function OrderCard({ order, machines }) {
  const machine = machines?.find(m => m.id === order.machineId);
  const progress = order.quantity > 0 ? Math.round((order.completed / order.quantity) * 100) : 0;
  const cfg = STATUS_COLS[order.status] || STATUS_COLS.scheduled;

  return (
    <div className="border rounded-xl p-3 mb-2" style={{backgroundColor:'#0f172a', borderColor:'#1e3a5f'}}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-sm font-semibold text-white">{order.partName}</p>
          <p className="text-xs text-slate-400">{machine?.name || order.machineId}</p>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded border ${cfg.bg} ${cfg.color}`}>
          {order.priority === 'high' ? '🔴' : order.priority === 'medium' ? '🟡' : '🟢'} {order.priority}
        </span>
      </div>
      <div className="flex justify-between text-xs text-slate-400 mb-1">
        <span>{order.completed}/{order.quantity} parts</span>
        <span>{progress}%</span>
      </div>
      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${order.status === 'completed' ? 'bg-green-500' : order.status === 'in_progress' ? 'bg-yellow-500' : 'bg-blue-500'}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-slate-500 mt-1">Due: {order.dueDate}</p>
    </div>
  );
}

export default function ProductionOrders({ orders, machines }) {
  const cols = ['scheduled', 'in_progress', 'completed'];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cols.map(status => {
        const cfg = STATUS_COLS[status];
        const colOrders = orders.filter(o => o.status === status);
        return (
          <div key={status} className="rounded-xl p-4 border" style={{backgroundColor:'#0a0f1a', borderColor:'#1e3a5f'}}>
            <div className={`flex items-center justify-between mb-3 pb-2 border-b border-slate-700`}>
              <span className={`font-semibold text-sm ${cfg.color}`}>{cfg.label}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>{colOrders.length}</span>
            </div>
            {colOrders.length === 0
              ? <p className="text-xs text-slate-600 text-center py-4">No orders</p>
              : colOrders.map(order => <OrderCard key={order.id} order={order} machines={machines} />)
            }
          </div>
        );
      })}
    </div>
  );
}
