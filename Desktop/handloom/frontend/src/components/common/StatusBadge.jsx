const STATUS_STYLES = {
  pending: 'badge-yellow',
  draft: 'badge-gray',
  submitted: 'badge-yellow',
  quoted: 'badge-blue',
  sample_in_progress: 'badge-blue',
  sample_ready: 'badge-indigo',
  confirmed: 'badge-blue',
  in_production: 'badge-blue',
  ready_to_ship: 'badge-green',
  shipped: 'badge-green',
  delivered: 'badge-green',
  cancelled: 'badge-red',
  disputed: 'badge-red',
  accepted: 'badge-green',
  rejected: 'badge-red',
  pending_acceptance: 'badge-yellow',
  in_progress: 'badge-blue',
  completed: 'badge-green',
  approved: 'badge-green',
  submitted: 'badge-yellow',
};

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || 'badge-gray';
  return <span className={style}>{status?.replace(/_/g, ' ')}</span>;
}
