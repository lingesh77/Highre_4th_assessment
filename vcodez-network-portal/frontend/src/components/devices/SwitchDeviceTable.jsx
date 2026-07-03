import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axiosClient';
import './SwitchDeviceTable.css';

const STATUS_OPTIONS = ['Online', 'Offline', 'Maintenance'];
const STATUS_FILTER_OPTIONS = ['All', ...STATUS_OPTIONS];
const ALPHABETICAL_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'asc', label: 'A → Z' },
  { value: 'desc', label: 'Z → A' },
];
const PAGE_SIZE_OPTIONS = [
  { value: '5', label: '5' },
  { value: '10', label: '10' },
  { value: '15', label: '15' },
  { value: '25', label: '25' },
  { value: 'all', label: 'All' },
];

const DEFAULT_PAGE_SIZE = '10';

// Backend already returns Online/Offline/Maintenance, but this keeps the
// component resilient if any Up/Down style values ever come through.
const normalizeStatus = (status) => {
  if (status === 'Up') return 'Online';
  if (status === 'Down') return 'Offline';
  return status;
};

const STATUS_STYLES = {
  Online:      { dot: '#4ADE80', glow: 'rgba(74,222,128,0.45)' },
  Offline:     { dot: '#FB7185', glow: 'rgba(251,113,133,0.5)' },
  Maintenance: { dot: '#FBBF24', glow: 'rgba(251,191,36,0.45)' },
};

const COLUMNS = [
  { key: 'model',    label: 'Model' },
  { key: 'physical', label: 'Physical Device' },
  { key: 'id',       label: 'ID' },
  { key: 'config',   label: 'Config' },
  { key: 'status',   label: 'Status' },
];

function RefreshIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path
        d="M11.5 6.5A5 5 0 1 1 9.9 2.85M11.5 1.5v3.2h-3.2"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SortIcon({ direction }) {
  return (
    <span className="sort-icon" data-dir={direction || 'none'}>
      <svg width="10" height="12" viewBox="0 0 10 12" fill="none">
        <path d="M5 0L9 5H1L5 0Z" fill={direction === 'asc' ? '#22D3EE' : '#3A4552'} />
        <path d="M5 12L1 7H9L5 12Z" fill={direction === 'desc' ? '#22D3EE' : '#3A4552'} />
      </svg>
    </span>
  );
}

/** Dropdown used for bulk-action selector, top filter controls, and rows-per-page. */
function StatusDropdown({ value, onChange, compact = false, id, options, labelKey = 'label', dropUp = false, className = '' }) {
  const [open, setOpen] = useState(false);
  const [menuDirection, setMenuDirection] = useState(dropUp ? 'up' : 'down');
  const ref = useRef(null);
  const normalizedValue = normalizeStatus(value);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (dropUp) {
      setMenuDirection('up');
      return;
    }
    if (!open || !ref.current) return;
    const trigger = ref.current.querySelector('.sdd-trigger');
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    setMenuDirection(spaceBelow < 180 && spaceAbove > 180 ? 'up' : 'down');
  }, [open, value, dropUp]);

  const activeOption = (options || []).find(
    (opt) => (typeof opt === 'string' ? opt : opt.value) === value
  );
  const displayLabel = activeOption
    ? (typeof activeOption === 'string' ? activeOption : activeOption[labelKey])
    : normalizedValue;

  const styles = STATUS_STYLES[normalizedValue] || {
    dot: '#8B96B3',
    glow: 'rgba(139,150,179,0.25)',
  };
  const showDot = Boolean(STATUS_STYLES[normalizedValue]);

  return (
    <div className={`sdd ${compact ? 'sdd-compact' : ''} ${className}`} ref={ref}>
      <button
        type="button"
        className={`sdd-trigger ${open ? 'open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={id ? `Change status for ${id}` : 'Select option'}
      >
        {showDot && (
          <span className="sdd-dot" style={{ background: styles.dot, boxShadow: `0 0 8px ${styles.glow}` }} />
        )}
        <span className="sdd-label">{displayLabel}</span>
        <svg className="sdd-chevron" width="10" height="6" viewBox="0 0 10 6" fill="none">
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <ul className={`sdd-menu ${menuDirection === 'up' ? 'up' : ''}`} role="listbox">
          {(options || STATUS_OPTIONS).map((opt, i) => {
            const optionValue = typeof opt === 'string' ? opt : opt.value;
            const optionLabel = typeof opt === 'string' ? opt : opt[labelKey];
            const s = optionValue && STATUS_STYLES[optionValue] ? STATUS_STYLES[optionValue] : null;
            return (
              <li
                key={optionValue}
                role="option"
                aria-selected={optionValue === value}
                className={`sdd-option ${optionValue === value ? 'selected' : ''}`}
                style={{ animationDelay: `${i * 0.03}s` }}
                onClick={() => {
                  onChange(optionValue);
                  setOpen(false);
                }}
              >
                {s && <span className="sdd-dot" style={{ background: s.dot, boxShadow: `0 0 8px ${s.glow}` }} />}
                {optionLabel}
                {optionValue === value && (
                  <svg className="sdd-check" width="11" height="9" viewBox="0 0 11 9" fill="none">
                    <path d="M1 4.5L4 7.5L10 1" stroke="#22D3EE" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** Dropdown-style status control used per-row in the table; talks to the real API. */
function StatusBarDropdown({ value, onChange, id, saving }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = normalizeStatus(value);
  const currentStyle = STATUS_STYLES[current];

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="sbdd" ref={ref}>
      <button
        type="button"
        className={`sbdd-trigger ${open ? 'open' : ''} ${saving ? 'saving' : ''}`}
        onClick={() => !saving && setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={id ? `Change status for ${id}` : 'Change status'}
        style={{ '--sbdd-color': currentStyle?.dot }}
      >
        <span className="sbdd-dot" style={{ background: currentStyle?.dot, boxShadow: `0 0 8px ${currentStyle?.glow}` }} />
        <span className="sbdd-label">{saving ? 'Saving…' : current}</span>
        <svg className="sbdd-chevron" width="10" height="6" viewBox="0 0 10 6" fill="none">
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul className="sbdd-menu" role="listbox">
          {STATUS_OPTIONS.map((option, i) => {
            const s = STATUS_STYLES[option];
            const isActive = option === current;
            return (
              <li
                key={option}
                role="option"
                aria-selected={isActive}
                className={`sbdd-option ${isActive ? 'selected' : ''}`}
                style={{ animationDelay: `${i * 0.03}s` }}
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
              >
                <span className="sbdd-dot" style={{ background: s.dot, boxShadow: `0 0 8px ${s.glow}` }} />
                {option}
                {isActive && (
                  <svg className="sbdd-check" width="11" height="9" viewBox="0 0 11 9" fill="none">
                    <path d="M1 4.5L4 7.5L10 1" stroke="#22D3EE" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function SwitchDeviceTable() {
  const location = useLocation();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [selected, setSelected] = useState(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE); // string: '5' | '10' | '15' | '25' | 'all'
  const [bulkStatus, setBulkStatus] = useState(STATUS_OPTIONS[0]);
  const [flashIds, setFlashIds] = useState(new Set());
  const [statusFilter, setStatusFilter] = useState(location.state?.initialStatus || 'All');
  const [alphaOrder, setAlphaOrder] = useState('default');
  const [savingIds, setSavingIds] = useState(new Set());
  const [applyingBulk, setApplyingBulk] = useState(false);

  const fetchDevices = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    return api
      .get('/devices')
      .then((res) => {
        setDevices(res.data.devices || []);
      })
      .catch(() => {
        toast.error('Failed to load devices.');
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, []);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return devices.filter((d) => {
      const matchesStatus = statusFilter === 'All' || normalizeStatus(d.status) === statusFilter;
      if (!q) return matchesStatus;
      const matchesSearch = d.model?.toLowerCase().includes(q) || d.id?.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [devices, search, statusFilter]);

  const sorted = useMemo(() => {
    const copy = [...filtered];

    if (alphaOrder !== 'default') {
      copy.sort((a, b) => {
        const av = (a.model || '').toLowerCase();
        const bv = (b.model || '').toLowerCase();
        if (av < bv) return alphaOrder === 'asc' ? -1 : 1;
        if (av > bv) return alphaOrder === 'asc' ? 1 : -1;
        return 0;
      });
      return copy;
    }

    if (!sortKey) return copy;

    copy.sort((a, b) => {
      const av = (a[sortKey] || '').toString().toLowerCase();
      const bv = (b[sortKey] || '').toString().toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  }, [filtered, sortKey, sortDir, alphaOrder]);

  const isShowAll = pageSize === 'all';
  const numericPageSize = isShowAll ? sorted.length : parseInt(pageSize, 10);

  const totalPages = isShowAll ? 1 : Math.max(1, Math.ceil(sorted.length / numericPageSize));
  const clampedPage = Math.min(page, totalPages);
  const pageItems = isShowAll
    ? sorted
    : sorted.slice((clampedPage - 1) * numericPageSize, clampedPage * numericPageSize);

  const handleSort = (key) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir('asc');
    } else if (sortDir === 'asc') {
      setSortDir('desc');
    } else {
      setSortKey(null);
      setSortDir('asc');
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleAlphaOrderChange = (value) => {
    setAlphaOrder(value);
    setPage(1);
  };

  const handlePageSizeChange = (value) => {
    setPageSize(value);
    setPage(1);
  };

  const triggerFlash = (ids) => {
    setFlashIds((prev) => new Set([...prev, ...ids]));
    setTimeout(() => {
      setFlashIds((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
    }, 700);
  };

  // Single-row status change — persisted to the backend, with optimistic UI
  // and rollback on failure.
  const updateStatus = async (id, newStatus) => {
    const previous = devices.find((d) => d.id === id)?.status;
    if (previous === newStatus) return;

    setDevices((prev) => prev.map((d) => (d.id === id ? { ...d, status: newStatus } : d)));
    setSavingIds((prev) => new Set(prev).add(id));

    try {
      const res = await api.patch(`/devices/${id}/status`, { status: newStatus });
      setDevices((prev) => prev.map((d) => (d.id === id ? res.data.device : d)));
      triggerFlash([id]);
      toast.success(`${id} status updated to ${newStatus}.`);
    } catch (err) {
      setDevices((prev) => prev.map((d) => (d.id === id ? { ...d, status: previous } : d)));
      toast.error(err.response?.data?.message || `Failed to update ${id}.`);
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const toggleRow = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const pageIds = pageItems.map((d) => d.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));

  const toggleAllOnPage = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageSelected) pageIds.forEach((id) => next.delete(id));
      else pageIds.forEach((id) => next.add(id));
      return next;
    });
  };

  // Bulk status change — the API only exposes a per-device PATCH endpoint,
  // so this fires them in parallel and reports back on any that failed.
  const applyBulkStatus = async () => {
    if (selected.size === 0) return;
    const ids = [...selected];
    setApplyingBulk(true);
    setSavingIds((prev) => new Set([...prev, ...ids]));

    const results = await Promise.allSettled(
      ids.map((id) => api.patch(`/devices/${id}/status`, { status: bulkStatus }))
    );

    const succeededIds = [];
    results.forEach((result, i) => {
      const id = ids[i];
      if (result.status === 'fulfilled') {
        succeededIds.push(id);
        setDevices((prev) => prev.map((d) => (d.id === id ? result.value.data.device : d)));
      }
    });

    const failedCount = ids.length - succeededIds.length;
    if (succeededIds.length > 0) {
      triggerFlash(succeededIds);
      toast.success(`Updated ${succeededIds.length} device${succeededIds.length !== 1 ? 's' : ''} to ${bulkStatus}.`);
    }
    if (failedCount > 0) {
      toast.error(`Failed to update ${failedCount} device${failedCount !== 1 ? 's' : ''}.`);
    }

    setSavingIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
    setApplyingBulk(false);
    setSelected(new Set());
  };

  const clearSelection = () => setSelected(new Set());
  const goToPage = (p) => setPage(Math.min(Math.max(1, p), totalPages));

  const statusCounts = useMemo(() => {
    return devices.reduce(
      (acc, device) => {
        const status = normalizeStatus(device.status);
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      { Online: 0, Offline: 0, Maintenance: 0 }
    );
  }, [devices]);

  return (
    <div className="switch-table-root">
      <div className="st-header">
        <div className="st-title-row">
          <div className="st-title">
            Switch Inventory
            <span className="count">{sorted.length} device{sorted.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <div className="toolbar-stack">
          <div className="st-search">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <circle cx="5.5" cy="5.5" r="4.5" stroke="#8B96B3" strokeWidth="1.3" />
              <line x1="8.8" y1="8.8" x2="12" y2="12" stroke="#8B96B3" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            <input type="text" placeholder="Search model or ID..." value={search} onChange={handleSearchChange} />
          </div>

          <label className="filter-group">
            <span>Status</span>
            <StatusDropdown
              value={statusFilter}
              onChange={handleStatusFilterChange}
              compact
              options={STATUS_FILTER_OPTIONS.map((option) => ({ value: option, label: option }))}
            />
          </label>

          <label className="filter-group">
            <span>Alphabetic</span>
            <StatusDropdown
              value={alphaOrder}
              onChange={handleAlphaOrderChange}
              compact
              options={ALPHABETICAL_OPTIONS}
              labelKey="label"
            />
          </label>

          <label className="filter-group">
            <span>Rows per page</span>
            <StatusDropdown
              value={pageSize}
              onChange={handlePageSizeChange}
              compact
              options={PAGE_SIZE_OPTIONS}
              labelKey="label"
            />
          </label>

          <button
            type="button"
            className={`st-refresh ${refreshing ? 'spinning' : ''}`}
            onClick={() => fetchDevices(true)}
            disabled={refreshing || loading}
          >
            <RefreshIcon />
            Refresh
          </button>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="kpi-card online">
          <div className="kpi-label">Online</div>
          <div className="kpi-value">{statusCounts.Online}</div>
        </div>
        <div className="kpi-card offline">
          <div className="kpi-label">Offline</div>
          <div className="kpi-value">{statusCounts.Offline}</div>
        </div>
        <div className="kpi-card maintenance">
          <div className="kpi-label">Maintenance</div>
          <div className="kpi-value">{statusCounts.Maintenance}</div>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="bulk-bar">
          <div className="bulk-left">{selected.size} selected</div>
          <div className="bulk-right">
            <StatusDropdown value={bulkStatus} onChange={setBulkStatus} />
            <button className="btn btn-primary" onClick={applyBulkStatus} disabled={applyingBulk}>
              {applyingBulk ? 'Applying…' : 'Apply status'}
            </button>
            <button className="btn btn-ghost" onClick={clearSelection} disabled={applyingBulk}>Clear</button>
          </div>
        </div>
      )}

      <div className="table-shell">
        <table>
          <thead>
            <tr>
              <th className="checkbox-col">
                <input type="checkbox" checked={allPageSelected} onChange={toggleAllOnPage} aria-label="Select all on page" />
              </th>
              {COLUMNS.map((col) => (
                <th key={col.key} className="sortable" onClick={() => handleSort(col.key)}>
                  <span className="th-inner">
                    {col.label}
                    <SortIcon direction={sortKey === col.key ? sortDir : null} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6}>
                  <div className="st-loading-state">
                    <span className="st-spinner" />
                    Loading devices…
                  </div>
                </td>
              </tr>
            )}
            {!loading && pageItems.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <div className="empty-state">
                    {devices.length === 0 ? 'No devices found.' : `No devices match "${search}"`}
                  </div>
                </td>
              </tr>
            )}
            {!loading && pageItems.map((d, i) => {
              const isSelected = selected.has(d.id);
              const isFlashing = flashIds.has(d.id);
              return (
                <tr
                  key={d.id}
                  className={`${isSelected ? 'selected' : ''} ${isFlashing ? 'flash' : ''}`}
                  style={{ animationDelay: `${i * 0.035}s` }}
                >
                  <td className="checkbox-col">
                    <input type="checkbox" checked={isSelected} onChange={() => toggleRow(d.id)} aria-label={`Select ${d.id}`} />
                  </td>
                  <td>{d.model}</td>
                  <td className="mono">{d.physical}</td>
                  <td className="mono">{d.id}</td>
                  <td className="mono">{d.config}</td>
                  <td>
                    <StatusBarDropdown
                      value={d.status}
                      onChange={(v) => updateStatus(d.id, v)}
                      id={d.id}
                      saving={savingIds.has(d.id)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="st-footer">
        <div className="footer-note">
          {loading
            ? 'Loading…'
            : isShowAll
            ? `Showing all ${sorted.length} devices`
            : `Page ${clampedPage} of ${totalPages} · ${sorted.length} device${sorted.length !== 1 ? 's' : ''} total`}
        </div>
        {!isShowAll && !loading && (
          <div className="pagination">
            <button className="page-btn" onClick={() => goToPage(clampedPage - 1)} disabled={clampedPage === 1}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} className={`page-btn ${p === clampedPage ? 'active' : ''}`} onClick={() => goToPage(p)}>{p}</button>
            ))}
            <button className="page-btn" onClick={() => goToPage(clampedPage + 1)} disabled={clampedPage === totalPages}>›</button>
          </div>
        )}
      </div>
    </div>
  );
}
