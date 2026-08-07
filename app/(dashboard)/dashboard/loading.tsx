export default function DashboardLoading() {
  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto animate-pulse">
      <div className="h-8 w-48 bg-[#171C22] rounded-md"></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 bg-[#13171C] border border-[#272D35] rounded-xl"></div>
        ))}
      </div>
      <div className="h-64 bg-[#13171C] border border-[#272D35] rounded-xl"></div>
    </div>
  );
}
