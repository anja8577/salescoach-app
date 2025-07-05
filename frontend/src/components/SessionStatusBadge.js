export default function SessionStatusBadge({ status, className = "" }) {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'draft':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-500',
          icon: '📝',
          label: 'Draft'
        };
      case 'submitted':
        return {
          color: 'bg-green-100 text-green-800 border-green-500',
          icon: '✅',
          label: 'Submitted'
        };
      case 'reviewed':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-500',
          icon: '👀',
          label: 'Reviewed'
        };
      case 'archived':
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-500',
          icon: '📦',
          label: 'Archived'
        };
      case 'agreed':
        return {
          color: 'bg-purple-100 text-purple-800 border-purple-500',
          icon: '🤝',
          label: 'Agreed'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-300',
          icon: '❓',
          label: 'Unknown'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${config.color} ${className}`}>
      <span className="text-xs">{config.icon}</span>
      {config.label}
    </span>
  );
}