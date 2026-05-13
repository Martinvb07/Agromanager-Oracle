import {
  Sprout, Droplets, Bug, MapPin, Leaf, Users, DollarSign,
  Truck, FileText, TrendingUp, CalendarRange, LogOut, X, User,
} from 'lucide-react';

const sections = [
  { id: 'dashboard',     name: 'Dashboard',     icon: TrendingUp   },
  { id: 'parcelas',      name: 'Parcelas',       icon: MapPin       },
  { id: 'trabajadores',  name: 'Personal',       icon: Users        },
  { id: 'finanzas',      name: 'Finanzas',       icon: DollarSign   },
  { id: 'maquinaria',    name: 'Maquinaria',     icon: Truck        },
  { id: 'campanas',      name: 'Campañas',       icon: CalendarRange },
  { id: 'semillas',      name: 'Semillas',       icon: Sprout       },
  { id: 'plagas',        name: 'Plagas',         icon: Bug          },
  { id: 'riego',         name: 'Riego',          icon: Droplets     },
  { id: 'fertilizantes', name: 'Fertilizantes',  icon: Leaf         },
  { id: 'reportes',      name: 'Reportes',       icon: FileText     },
];

const Sidebar = ({ activeSection, setActiveSection, currentUser, onLogout, onShowProfile, isOpen, onClose }) => (
  <>
    {isOpen && <div className="am-sidebar-overlay" onClick={onClose} />}

    <aside className={`am-sidebar ${isOpen ? 'is-open' : ''}`}>

      {/* Brand */}
      <div className="am-sidebar-brand">
        <div className="am-sidebar-logo-wrap">
          <Sprout size={20} />
        </div>
        <div className="am-sidebar-brand-text">
          <span className="am-sidebar-brand-name">AgroManager</span>
          <span className="am-sidebar-brand-sub">Sistema Agrícola</span>
        </div>
        <button className="am-sidebar-close-btn" onClick={onClose} aria-label="Cerrar menú">
          <X size={18} />
        </button>
      </div>

      {/* Nav items */}
      <nav className="am-sidebar-nav">
        {sections.map(({ id, name, icon: Icon }) => (
          <button
            key={id}
            className={`am-sidebar-item${activeSection === id ? ' is-active' : ''}`}
            onClick={() => { setActiveSection(id); onClose(); }}
          >
            <Icon size={18} className="am-sitem-icon" />
            <span className="am-sitem-label">{name}</span>
          </button>
        ))}
      </nav>

      {/* User footer */}
      <div className="am-sidebar-footer">
        <button className="am-sidebar-profile-btn" onClick={onShowProfile}>
          <div className="am-sidebar-avatar">
            <User size={14} />
          </div>
          <div className="am-sidebar-user-text">
            <span className="am-sidebar-user-name">{currentUser?.nombre || 'Usuario'}</span>
            <span className="am-sidebar-user-role">{currentUser?.rol || 'admin'}</span>
          </div>
        </button>
        <button className="am-sidebar-logout-btn" onClick={onLogout}>
          <LogOut size={16} />
          <span>Cerrar sesión</span>
        </button>
      </div>

    </aside>
  </>
);

export default Sidebar;
