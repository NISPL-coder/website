import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Plus, Power, Trash2, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminDataTable from './AdminDataTable';
import PlanFormModal from './PlanFormModal';
import { compareNumber, compareText } from './adminTableUtils';
import { usePermissions } from './PermissionsContext';
import { productApi } from '../../../services/productApi';
import { GST_RATE_DEFAULT, formatINR } from '../../Dashboard/utils/pricingUtils';

const round2 = (value) => Math.round((Number(value) || 0) * 100) / 100;

const parseNumber = (value) =>
  typeof value === 'number' ? value : Number(String(value ?? '').replace(/[^0-9.]/g, '')) || 0;

const isLive = (plan) => plan.available !== false && plan.status !== 'inactive';

/**
 * Every CtrlS tier is quoted per concurrent user: the stored monthly amount is
 * the tax-exclusive base, GST is added on top, and term totals follow from it.
 */
const quote = (plan) => {
  const users = Math.max(1, Math.floor(Number(plan.users) || 1));
  const monthlyBase = plan.monthlyPrice || parseNumber(plan.price);
  const perUser = plan.pricePerUser > 0 ? plan.pricePerUser : round2(monthlyBase / users);
  const gstAmount = round2(monthlyBase * GST_RATE_DEFAULT);
  const grandTotal = round2(monthlyBase + gstAmount);

  return {
    users,
    perUser,
    monthlyBase,
    gstAmount,
    grandTotal,
    sixMonths: round2(grandTotal * 6),
    oneYear: round2(grandTotal * 12),
    twoYears: round2(grandTotal * 24)
  };
};

const money = (value) => formatINR(value, true);

/** A demo plan is a flat amount for a fixed window, not a per-user monthly rate. */
const demoPrice = (plan) =>
  Number.isFinite(plan.monthlyPrice)
    ? plan.monthlyPrice
    : plan.price === 'FREE'
      ? 0
      : parseNumber(plan.price);

const sectionLabelStyle = {
  fontSize: '0.95rem',
  fontWeight: 600,
  color: '#64748b',
  padding: '18px 24px 0'
};

const numericCell = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontWeight: 600,
  fontSize: '0.86rem',
  color: '#0f172a'
};

export default function CustomPricingPage({ products, setProducts }) {
  const { can } = usePermissions();
  const navigate = useNavigate();
  const [modal, setModal] = useState({ isOpen: false, plan: null, type: 'custom' });

  const backToProducts = () => navigate('/admin/product/cloud');

  const customPlans = useMemo(
    () =>
      products
        .filter((p) => p.isCustomPlan === true)
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()),
    [products]
  );

  const demoPlans = useMemo(
    () =>
      products
        .filter((p) => p.isDemoPlan === true)
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()),
    [products]
  );

  const handleSaved = (saved) => {
    if (!saved) return;
    const savedKey = saved.productId || saved.id;

    setProducts((prev) =>
      prev.some((p) => (p.productId || p.id) === savedKey)
        ? prev.map((p) => ((p.productId || p.id) === savedKey ? { ...p, ...saved } : p))
        : [saved, ...prev]
    );
  };

  const handleToggle = async (plan) => {
    const key = plan.id || plan._id;
    const nextAvailable = !isLive(plan);

    setProducts((prev) =>
      prev.map((p) =>
        (p.id || p._id) === key ? { ...p, available: nextAvailable, status: nextAvailable ? 'active' : 'inactive' } : p
      )
    );

    try {
      await productApi.toggleAvailability(key, nextAvailable);
      toast.success(`${plan.name} is now ${nextAvailable ? 'Active' : 'Deactivated'}.`);
    } catch (err) {
      console.error('Failed to update custom plan status:', err);
      toast.error(err.message || 'Failed to update status on server.');
      setProducts((prev) =>
        prev.map((p) =>
          (p.id || p._id) === key
            ? { ...p, available: isLive(plan), status: isLive(plan) ? 'active' : 'inactive' }
            : p
        )
      );
    }
  };

  const handleDelete = async (plan) => {
    if (!window.confirm(`Delete the plan "${plan.name}" from the catalog?`)) return;

    const key = plan.id || plan._id;
    setProducts((prev) => prev.filter((p) => (p.id || p._id) !== key));

    try {
      await productApi.deleteProduct(key);
      toast.success(`Removed "${plan.name}".`);
    } catch (err) {
      console.error('Failed to delete custom plan:', err);
      toast.error(err.message || 'Failed to remove the plan from the server.');
      setProducts((prev) => [...prev, plan]);
    }
  };

  const statusColumn = {
    id: 'status',
    name: 'Status',
    selector: (row) => (isLive(row) ? 1 : 0),
    sortable: true,
    sortFunction: compareNumber((row) => (isLive(row) ? 1 : 0)),
    width: '110px',
    center: true,
    cell: (plan) => (
      <span
        className={`adm-status-pill ${isLive(plan) ? 'active' : 'inactive'}`}
        style={{ fontSize: '0.72rem', padding: '3px 10px', fontWeight: 600 }}
      >
        {isLive(plan) ? 'Active' : 'Inactive'}
      </span>
    )
  };

  const planNameColumn = {
    id: 'name',
    name: 'Plan Name',
    selector: (row) => row.name,
    sortable: true,
    sortFunction: compareText((row) => row.name),
    minWidth: '240px',
    grow: 1.3,
    cell: (plan) => (
      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{plan.name}</span>
    )
  };

  const usersColumn = {
    id: 'users',
    name: 'Users',
    selector: (row) => quote(row).users,
    sortable: true,
    sortFunction: compareNumber((row) => quote(row).users),
    width: '100px',
    center: true,
    cell: (plan) => <span style={numericCell}>{quote(plan).users}</span>
  };

  const perUserColumn = {
    id: 'perUser',
    name: 'Price/User/Month',
    selector: (row) => quote(row).perUser,
    sortable: true,
    sortFunction: compareNumber((row) => quote(row).perUser),
    minWidth: '170px',
    cell: (plan) => <span style={numericCell}>{money(quote(plan).perUser)}</span>
  };

  const actionsColumn = (onEdit) => ({
    id: 'actions',
    name: 'Actions',
    center: true,
    width: '300px',
    ignoreRowClick: true,
    cell: (plan) => (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
        {can('product', 'edit') && (
          <button
            type="button"
            className="adm-action-pill"
            style={{ color: '#4338ca', borderColor: '#c7d2fe' }}
            onClick={() => onEdit(plan)}
            title="Edit this plan"
          >
            <Pencil size={13} />
            <span>Edit</span>
          </button>
        )}
        {can('product', 'edit') && (
          <button
            type="button"
            className="adm-action-pill"
            style={{ color: '#475569', borderColor: '#cbd5e1' }}
            onClick={() => handleToggle(plan)}
            title={isLive(plan) ? 'Hide this plan from the catalog' : 'Publish this plan'}
          >
            <Power size={13} />
            <span>{isLive(plan) ? 'Deactivate' : 'Activate'}</span>
          </button>
        )}
        {can('product', 'delete') && (
          <button
            type="button"
            className="adm-action-pill"
            style={{ color: '#dc2626', borderColor: '#fecaca' }}
            onClick={() => handleDelete(plan)}
            title="Delete this plan"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    )
  });

  const customColumns = [
    planNameColumn,
    usersColumn,
    {
      id: 'serverType',
      name: 'Server Type',
      selector: (row) => (row.serverType === 'dedicated' ? 'Dedicated' : 'Shared'),
      sortable: true,
      sortFunction: compareText((row) => (row.serverType === 'dedicated' ? 'Dedicated' : 'Shared')),
      minWidth: '150px',
      cell: (plan) => (
        <span
          className="adm-product-badge"
          style={{
            background: '#eff6ff',
            color: '#1d4ed8',
            borderColor: '#bfdbfe',
            fontWeight: 600,
            fontSize: '0.74rem'
          }}
        >
          {plan.serverType === 'dedicated' ? 'Dedicated' : 'Shared'}
        </span>
      )
    },
    perUserColumn,
    {
      id: 'sixMonths',
      name: '6 Months Total',
      selector: (row) => quote(row).sixMonths,
      sortable: true,
      sortFunction: compareNumber((row) => quote(row).sixMonths),
      minWidth: '165px',
      cell: (plan) => <span style={numericCell}>{money(quote(plan).sixMonths)}</span>
    },
    {
      id: 'oneYear',
      name: '1 Year Total',
      selector: (row) => quote(row).oneYear,
      sortable: true,
      sortFunction: compareNumber((row) => quote(row).oneYear),
      minWidth: '160px',
      cell: (plan) => <span style={numericCell}>{money(quote(plan).oneYear)}</span>
    },
    {
      id: 'twoYears',
      name: '2 Years Total',
      selector: (row) => quote(row).twoYears,
      sortable: true,
      sortFunction: compareNumber((row) => quote(row).twoYears),
      minWidth: '160px',
      cell: (plan) => <span style={numericCell}>{money(quote(plan).twoYears)}</span>
    },
    statusColumn,
    actionsColumn((plan) => setModal({ isOpen: true, plan, type: 'custom' }))
  ];

  const demoColumns = [
    planNameColumn,
    {
      id: 'duration',
      name: 'Duration',
      selector: (row) => row.duration || '',
      sortable: true,
      sortFunction: compareText((row) => row.duration || ''),
      minWidth: '150px',
      cell: (plan) =>
        plan.duration ? (
          <span
            className="adm-product-badge"
            style={{
              background: '#ecfdf5',
              color: '#047857',
              borderColor: '#a7f3d0',
              fontWeight: 600,
              fontSize: '0.74rem'
            }}
          >
            {plan.duration}
          </span>
        ) : (
          <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.8rem' }}>Not set</span>
        )
    },
    {
      id: 'price',
      name: 'Price',
      selector: (row) => demoPrice(row),
      sortable: true,
      sortFunction: compareNumber((row) => demoPrice(row)),
      minWidth: '160px',
      cell: (plan) => {
        const amount = demoPrice(plan);
        return amount === 0 ? (
          <span
            style={{
              ...numericCell,
              color: '#047857',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: '999px',
              padding: '3px 12px',
              fontSize: '0.74rem',
              fontWeight: 700
            }}
          >
            FREE
          </span>
        ) : (
          <span style={numericCell}>{money(amount)}</span>
        );
      }
    },
    statusColumn,
    actionsColumn((plan) => setModal({ isOpen: true, plan, type: 'demo' }))
  ];

  return (
    <>
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {/* Page header */}
        <div className="adm-table-card">
          <div className="adm-card-header">
            <div className="adm-card-header-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Wallet size={20} color="#4f46e5" />
                <h1 className="adm-section-title">Custom &amp; Demo Pricing</h1>
              </div>
              <p className="adm-section-sub">
                Publish and manage custom per-user plans and demo trial offers
              </p>
            </div>

            <div className="adm-card-header-action">
              <button
                type="button"
                className="adm-btn-secondary"
                onClick={backToProducts}
                style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                title="Return to the Cloud catalog"
              >
                <ArrowLeft size={14} />
                <span>Back to Products</span>
              </button>

              {can('product', 'create') && (
                <button
                  type="button"
                  className="adm-btn-primary"
                  onClick={() => setModal({ isOpen: true, plan: null, type: 'custom' })}
                  title="Publish a custom per-user plan or a demo trial"
                >
                  <Plus size={16} />
                  <span>Add Plan</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Custom plans */}
        <div className="adm-table-card">
          <div style={sectionLabelStyle}>Custom Plans</div>
          <AdminDataTable
            columns={customColumns}
            data={customPlans}
            keyField="id"
            defaultSortFieldId="name"
            defaultSortAsc={true}
            resetPageToken={`custom|${customPlans.length}`}
            minWidth={1350}
            noDataMessage="No custom plans yet"
            noDataHint="Use Add Plan and pick Custom to quote a per-user rate for any user count."
            ariaLabel="Custom plans"
            scrollHeight="420px"
          />
        </div>

        {/* Demo plans */}
        <div className="adm-table-card">
          <div style={sectionLabelStyle}>Demo Plans</div>
          <AdminDataTable
            columns={demoColumns}
            data={demoPlans}
            keyField="id"
            defaultSortFieldId="name"
            defaultSortAsc={true}
            resetPageToken={`demo|${demoPlans.length}`}
            minWidth={900}
            noDataMessage="No demo plans yet"
            noDataHint="Use Add Plan and pick Demo to publish a time-boxed trial offer."
            ariaLabel="Demo plans"
            scrollHeight="420px"
          />
        </div>
      </div>

      {modal.isOpen && (
        <PlanFormModal
          plan={modal.plan}
          defaultType={modal.type}
          onClose={() => setModal({ isOpen: false, plan: null, type: 'custom' })}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
