import { Bell, ShieldCheck, Ticket, Gift, Trash2 } from 'lucide-react';

const NotificationDropdown = ({ isOpen, notifications = [], onClear }) => {
  if (!isOpen) return null;

  return (
    <div className="notification-dropdown animate-fade">
      <div className="notif-header">
        <h4>Notifications</h4>
        {notifications.length > 0 && (
          <button className="clear-notif" onClick={onClear}>Clear All</button>
        )}
      </div>
      <div className="notif-list">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <div key={notif.id} className={`notif-item ${notif.unread ? 'unread' : ''} ${notif.type}`}>
              <div className="icon">
                {notif.type === 'booking' && <Ticket size={18} />}
                {notif.type === 'security' && <ShieldCheck size={18} />}
                {notif.type === 'offer' && <Gift size={18} />}
              </div>
              <div className="content">
                <h5>{notif.title}</h5>
                <p>{notif.message}</p>
                <span className="time">{notif.time}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-notif">
            <Bell size={40} />
            <p>No new notifications</p>
          </div>
        )}
      </div>
      <style>{`
        .empty-notif { padding: 3rem 1rem; text-align: center; color: #ccc; display: flex; flex-direction: column; align-items: center; gap: 15px; }
        .empty-notif p { font-size: 0.9rem; margin: 0; }
      `}</style>
    </div>
  );
};

export default NotificationDropdown;
