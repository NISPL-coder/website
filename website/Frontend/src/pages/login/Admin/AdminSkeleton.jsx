import React from 'react';
import singleLogo from '../../../assets/new_logo/single-logo.png';
import './AdminSkeleton.css';

const times = (count) => Array.from({ length: Math.max(0, count) }, (_, index) => index);

const cellWidths = ['88%', '62%', '74%', '54%', '80%', '66%', '92%', '58%', '70%', '84%'];

/**
 * A single shimmering placeholder. Kept intentionally tiny so every admin
 * screen can compose the same visual language without duplicating CSS.
 */
export function SkeletonBar({
  width = '100%',
  height = 12,
  radius = 6,
  className = '',
  style,
  delay = 0
}) {
  return (
    <span
      className={`adm-sk-bar ${className}`.trim()}
      style={{
        width,
        height,
        borderRadius: radius,
        animationDelay: `${delay}ms`,
        ...style
      }}
      aria-hidden="true"
    />
  );
}

export function SkeletonCircle({ size = 40, className = '', style }) {
  return (
    <span
      className={`adm-sk-circle ${className}`.trim()}
      style={{ width: size, height: size, ...style }}
      aria-hidden="true"
    />
  );
}

/** Table-shaped placeholder used by the shared AdminDataTable loading state. */
export function AdminTableSkeleton({
  columns = 6,
  rows = 8,
  showHeader = true,
  compact = false,
  label = 'Loading records'
}) {
  const visibleColumns = Math.min(Math.max(Number(columns) || 6, 3), 10);

  return (
    <div
      className={`adm-sk-table${compact ? ' is-compact' : ''}`}
      role="status"
      aria-label={`${label}…`}
    >
      {showHeader && (
        <div className="adm-sk-table-head" style={{ '--adm-sk-cols': visibleColumns }}>
          {times(visibleColumns).map((column) => (
            <div className="adm-sk-table-head-cell" key={`head-${column}`}>
              <SkeletonBar width={column === 0 ? '52%' : '68%'} height={10} delay={column * 45} />
              <SkeletonBar width="100%" height={26} radius={5} delay={column * 45 + 60} />
            </div>
          ))}
        </div>
      )}

      <div className="adm-sk-table-body">
        {times(rows).map((row) => (
          <div
            className="adm-sk-table-row"
            key={`row-${row}`}
            style={{ '--adm-sk-cols': visibleColumns }}
          >
            {times(visibleColumns).map((column) => (
              <div className="adm-sk-table-cell" key={`cell-${row}-${column}`}>
                <SkeletonBar
                  width={cellWidths[(row + column) % cellWidths.length]}
                  height={compact ? 9 : 11}
                  delay={(row * visibleColumns + column) * 18}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      <span className="adm-sk-sr-only">{label}…</span>
    </div>
  );
}

/** Generic card grid for product / add-on / permission style sections. */
export function AdminCardsSkeleton({ count = 6, lines = 3, className = '' }) {
  return (
    <div className={`adm-sk-cards ${className}`.trim()} role="status" aria-label="Loading cards…">
      {times(count).map((card) => (
        <div className="adm-sk-card" key={`card-${card}`}>
          <div className="adm-sk-card-top">
            <SkeletonCircle size={34} delay={card * 50} />
            <SkeletonBar width="54%" height={13} delay={card * 50 + 40} />
          </div>
          {times(lines).map((line) => (
            <SkeletonBar
              key={`line-${card}-${line}`}
              width={line === lines - 1 ? '62%' : '100%'}
              height={9}
              delay={card * 50 + line * 35}
            />
          ))}
        </div>
      ))}
      <span className="adm-sk-sr-only">Loading cards…</span>
    </div>
  );
}

/** Full profile placeholder: hero, account/security cards and password panel. */
export function AdminProfileSkeleton() {
  return (
    <div className="adm-sk-profile" role="status" aria-label="Loading admin profile…">
      <div className="adm-sk-profile-hero">
        <SkeletonCircle size={74} />
        <div className="adm-sk-profile-hero-copy">
          <SkeletonBar width="38%" height={20} radius={8} />
          <SkeletonBar width="26%" height={11} />
          <SkeletonBar width="44%" height={11} />
        </div>
        <div className="adm-sk-profile-ring" aria-hidden="true">
          <SkeletonCircle size={76} />
        </div>
      </div>

      <div className="adm-sk-profile-section">
        <SkeletonBar width="22%" height={14} />
        <AdminCardsSkeleton count={6} lines={2} />
      </div>

      <div className="adm-sk-profile-section">
        <SkeletonBar width="26%" height={14} />
        <AdminCardsSkeleton count={5} lines={2} />
      </div>

      <div className="adm-sk-panel">
        <SkeletonBar width="30%" height={16} />
        <SkeletonBar width="52%" height={10} />
        <div className="adm-sk-form-grid">
          {times(3).map((field) => (
            <div className="adm-sk-field" key={`pw-${field}`}>
              <SkeletonBar width="34%" height={10} />
              <SkeletonBar width="100%" height={38} radius={9} delay={field * 60} />
            </div>
          ))}
        </div>
        <SkeletonBar width="160px" height={38} radius={9} />
      </div>
      <span className="adm-sk-sr-only">Loading admin profile…</span>
    </div>
  );
}

/** Notification list placeholder for the full stream and the header popover. */
export function AdminNotificationsSkeleton({ rows = 7, compact = false, label = 'Loading notifications' }) {
  return (
    <div
      className={`adm-sk-notifications${compact ? ' is-compact' : ''}`}
      role="status"
      aria-label={`${label}…`}
    >
      {times(rows).map((row) => (
        <div className="adm-sk-notification" key={`notif-${row}`}>
          <SkeletonCircle size={compact ? 32 : 40} delay={row * 45} />
          <div className="adm-sk-notification-copy">
            <SkeletonBar width={row % 3 === 0 ? '72%' : '56%'} height={compact ? 10 : 12} delay={row * 45 + 40} />
            <SkeletonBar width={row % 2 === 0 ? '84%' : '64%'} height={compact ? 8 : 10} delay={row * 45 + 80} />
            {!compact && (
              <SkeletonBar width="38%" height={8} delay={row * 45 + 120} />
            )}
          </div>
          <SkeletonBar width="42px" height={compact ? 8 : 10} delay={row * 45 + 100} />
        </div>
      ))}
      <span className="adm-sk-sr-only">{label}…</span>
    </div>
  );
}

/** Overview placeholder: KPIs, charts and the two dashboard tables. */
export function AdminOverviewSkeleton() {
  return (
    <div className="adm-sk-overview" role="status" aria-label="Loading dashboard overview…">
      <div className="adm-sk-overview-head">
        <SkeletonBar width="34%" height={26} radius={8} />
        <SkeletonBar width="48%" height={11} />
      </div>
      <div className="adm-sk-kpis">
        {times(4).map((kpi) => (
          <div className="adm-sk-kpi" key={`kpi-${kpi}`}>
            <SkeletonBar width="46%" height={10} delay={kpi * 45} />
            <SkeletonBar width="68%" height={26} radius={8} delay={kpi * 45 + 50} />
            <SkeletonBar width="54%" height={9} delay={kpi * 45 + 100} />
          </div>
        ))}
      </div>
      <div className="adm-sk-charts">
        {times(2).map((chart) => (
          <div className="adm-sk-panel adm-sk-chart" key={`chart-${chart}`}>
            <SkeletonBar width="32%" height={14} />
            <div className="adm-sk-chart-bars" aria-hidden="true">
              {times(7).map((bar) => (
                <SkeletonBar
                  key={`bar-${chart}-${bar}`}
                  height={`${34 + ((bar * 17) % 52)}%`}
                  width="100%"
                  radius={7}
                  delay={bar * 70}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="adm-sk-overview-tables">
        <AdminTableSkeleton columns={5} rows={5} label="Loading customers" />
        <AdminTableSkeleton columns={4} rows={5} label="Loading contracts" />
      </div>
      <span className="adm-sk-sr-only">Loading dashboard overview…</span>
    </div>
  );
}

/** Generic form placeholder for create pages and modal bodies. */
export function AdminFormSkeleton({ fields = 6, title = 'Loading form', showActions = true }) {
  return (
    <div className="adm-sk-form" role="status" aria-label={`${title}…`}>
      <SkeletonBar width="30%" height={18} radius={8} />
      <SkeletonBar width="48%" height={10} />
      <div className="adm-sk-form-grid">
        {times(fields).map((field) => (
          <div className="adm-sk-field" key={`field-${field}`}>
            <SkeletonBar width="36%" height={10} delay={field * 40} />
            <SkeletonBar width="100%" height={38} radius={9} delay={field * 40 + 40} />
          </div>
        ))}
      </div>
      {showActions && (
        <div className="adm-sk-form-actions">
          <SkeletonBar width="96px" height={36} radius={9} />
          <SkeletonBar width="132px" height={36} radius={9} delay={60} />
        </div>
      )}
      <span className="adm-sk-sr-only">{title}…</span>
    </div>
  );
}

/** Compact ledger / record rows used inside view dialogs. */
export function AdminLedgerSkeleton({ rows = 3, label = 'Loading linked records' }) {
  return (
    <div className="adm-sk-ledger" role="status" aria-label={`${label}…`}>
      {times(rows).map((row) => (
        <div className="adm-sk-ledger-row" key={`ledger-${row}`}>
          <SkeletonCircle size={34} delay={row * 50} />
          <div className="adm-sk-ledger-copy">
            <SkeletonBar width="54%" height={11} delay={row * 50 + 40} />
            <SkeletonBar width="72%" height={9} delay={row * 50 + 70} />
          </div>
          <SkeletonBar width="70px" height={10} delay={row * 50 + 100} />
        </div>
      ))}
      <span className="adm-sk-sr-only">{label}…</span>
    </div>
  );
}

/**
 * The full-page branded loading screen shown while the admin console boots.
 * The logo sits on a light plate so the supplied mark stays legible in both
 * light and dark themes.
 */
export function AdminFullPageLoader({
  title = 'Preparing your admin console',
  subtitle = 'Loading live records, permissions and preferences…'
}) {
  return (
    <div className="adm-page-loader" role="status" aria-live="polite" aria-label="Loading admin console">
      <div className="adm-page-loader-aura" aria-hidden="true" />
      <div className="adm-page-loader-card">
        <div className="adm-page-loader-logo-wrap">
          <span className="adm-page-loader-ring" aria-hidden="true" />
          <img
            src={singleLogo}
            alt="Net Infotech System"
            className="adm-page-loader-logo"
          />
        </div>

        <div className="adm-page-loader-brand">NET INFOTECH SYSTEM</div>
        <h1 className="adm-page-loader-title">{title}</h1>
        <p className="adm-page-loader-subtitle">{subtitle}</p>

        <div className="adm-page-loader-track" aria-hidden="true">
          <span className="adm-page-loader-fill" />
        </div>

        <div className="adm-page-loader-preview" aria-hidden="true">
          <div className="adm-page-loader-preview-head">
            <SkeletonBar width="38%" height={9} />
            <SkeletonBar width="18%" height={9} delay={80} />
          </div>
          {times(5).map((row) => (
            <div className="adm-page-loader-preview-row" key={`preview-${row}`}>
              <SkeletonBar width="12%" height={8} delay={row * 60} />
              <SkeletonBar width={cellWidths[row % cellWidths.length]} height={8} delay={row * 60 + 30} />
              <SkeletonBar width="16%" height={8} delay={row * 60 + 60} />
            </div>
          ))}
        </div>

        <span className="adm-sk-sr-only">Loading admin console…</span>
      </div>
    </div>
  );
}

export default AdminTableSkeleton;
