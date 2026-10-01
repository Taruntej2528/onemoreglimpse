import React, { useState, useEffect } from 'react';
import { FileText, RefreshCw, Search, Shield, Clock, Globe, ArrowUpDown } from 'lucide-react';
import { logsAPI } from '../../services/api';

export const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await logsAPI.getAll({ limit: 50 });
      if (res?.data) {
        setLogs(res.data);
      }
    } catch (err) {
      console.error('[AdminLogs] Load failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(
    (l) =>
      l.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.method.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.userEmail || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.module || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#141824] via-[#11141D] to-[#0E1118] border border-white/10 shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] tracking-[0.25em] font-semibold uppercase px-2.5 py-1 rounded-full bg-[#C9A96E]/20 text-[#E5D2A8] border border-[#C9A96E]/40">
              Security & Observability
            </span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-white tracking-wide">
            System Request & Audit Logs
          </h2>
          <p className="text-xs text-slate-400">
            Real-time audit trail capturing all HTTP operations, response codes, execution timings, and IP addresses.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-semibold text-xs flex items-center gap-2 transition-all self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 text-[#C9A96E] ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Search and Table */}
      <div className="rounded-3xl bg-[#11141D] border border-white/10 p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by URL, method, email..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#C9A96E] transition-all"
            />
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {filteredLogs.length} Records Logged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Method & Path</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Operator</th>
                <th className="py-3 px-4">Client IP</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-[11px]">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">
                    Loading audit records from MongoDB...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500 font-sans">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const statusColor =
                    log.statusCode >= 500
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : log.statusCode >= 400
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : log.statusCode >= 300
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';

                  const methodColor =
                    log.method === 'POST'
                      ? 'text-blue-400'
                      : log.method === 'PUT' || log.method === 'PATCH'
                      ? 'text-amber-400'
                      : log.method === 'DELETE'
                      ? 'text-rose-400'
                      : 'text-emerald-400';

                  return (
                    <tr key={log._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${methodColor}`}>{log.method}</span>
                          <span className="text-white truncate max-w-xs">{log.url}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${statusColor}`}>
                          {log.statusCode}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-400">
                        {log.durationMs}ms
                      </td>

                      <td className="py-3 px-4 font-sans text-xs">
                        <span className="text-slate-300">{log.userEmail || 'Anonymous'}</span>
                        {log.userRole && log.userRole !== 'ANONYMOUS' && (
                          <span className="ml-1.5 text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-slate-400 uppercase font-mono">
                            {log.userRole}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-500">
                        {log.ip || '127.0.0.1'}
                      </td>

                      <td className="py-3 px-4 text-right text-slate-400">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
