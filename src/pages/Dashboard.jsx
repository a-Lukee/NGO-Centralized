import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function Dashboard({ profile }) {
  const [stats, setStats] = useState({
    programs: 0,
    beneficiaries: 0,
    donations: 0,
    sponsorships: 0,
    expenses: 0,
  })

  const [recentActivity, setRecentActivity] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
  if (profile?.role) {
    loadDashboardData()
  }
}, [profile?.role])

  function processFinancialData(
  donationsResult,
  sponsorshipsResult,
  expensesResult,
  programCount = 0,
  beneficiaryCount = 0
) {
  if (donationsResult.error) {
    throw donationsResult.error
  }

  if (sponsorshipsResult.error) {
    throw sponsorshipsResult.error
  }

  if (expensesResult.error) {
    throw expensesResult.error
  }

  const donations = donationsResult.data || []
  const sponsorships = sponsorshipsResult.data || []
  const expenses = expensesResult.data || []

  const donationTotal = donations.reduce(
    (total, donation) =>
      total + Number(donation.amount || 0),
    0
  )

  const sponsorshipTotal = sponsorships.reduce(
    (total, sponsorship) =>
      total + Number(sponsorship.amount || 0),
    0
  )

  const expenseTotal = expenses.reduce(
    (total, expense) =>
      total + Number(expense.amount || 0),
    0
  )

  setStats({
    programs: programCount,
    beneficiaries: beneficiaryCount,
    donations: donationTotal,
    sponsorships: sponsorshipTotal,
    expenses: expenseTotal,
  })

  const activities = [
    ...donations.map((donation) => ({
      id: `donation-${donation.id}`,
      type: 'Donation',
      name: donation.donor_name,
      amount: Number(donation.amount || 0),
      date: donation.donation_date,
    })),

    ...sponsorships.map((sponsorship) => ({
      id: `sponsorship-${sponsorship.id}`,
      type: 'Sponsorship',
      name: sponsorship.sponsor_name,
      amount: Number(sponsorship.amount || 0),
      date: sponsorship.sponsorship_date,
    })),

    ...expenses.map((expense) => ({
      id: `expense-${expense.id}`,
      type: 'Expense',
      name: expense.description,
      category: expense.category,
      amount: Number(expense.amount || 0),
      date: expense.expense_date,
    })),
  ]

  activities.sort(
    (a, b) =>
      new Date(b.date) - new Date(a.date)
  )

  setRecentActivity(activities.slice(0, 8))
}

  async function loadDashboardData() {
  if (!profile?.role) return

  setLoading(true)
  setError('')

  try {
    if (profile.role === 'program_coordinator') {
      const [
        programsResult,
        beneficiariesResult,
      ] = await Promise.all([
        supabase
          .from('programs')
          .select('*', {
            count: 'exact',
            head: true,
          }),

        supabase
          .from('beneficiaries')
          .select('*', {
            count: 'exact',
            head: true,
          }),
      ])

      if (programsResult.error) {
        throw programsResult.error
      }

      if (beneficiariesResult.error) {
        throw beneficiariesResult.error
      }

      setStats({
        programs: programsResult.count || 0,
        beneficiaries:
          beneficiariesResult.count || 0,
        donations: 0,
        sponsorships: 0,
        expenses: 0,
      })

      setRecentActivity([])
      return
    }

    if (profile.role === 'finance') {
      const [
        donationsResult,
        sponsorshipsResult,
        expensesResult,
      ] = await Promise.all([
        supabase
          .from('donations')
          .select(
            'id, donor_name, amount, donation_date'
          ),

        supabase
          .from('sponsorships')
          .select(
            'id, sponsor_name, amount, sponsorship_date'
          ),

        supabase
          .from('expenses')
          .select(
            'id, category, description, amount, expense_date'
          ),
      ])

      processFinancialData(
        donationsResult,
        sponsorshipsResult,
        expensesResult,
        0,
        0
      )

      return
    }

    if (profile.role === 'admin') {
      const [
        programsResult,
        beneficiariesResult,
        donationsResult,
        sponsorshipsResult,
        expensesResult,
      ] = await Promise.all([
        supabase
          .from('programs')
          .select('*', {
            count: 'exact',
            head: true,
          }),

        supabase
          .from('beneficiaries')
          .select('*', {
            count: 'exact',
            head: true,
          }),

        supabase
          .from('donations')
          .select(
            'id, donor_name, amount, donation_date'
          ),

        supabase
          .from('sponsorships')
          .select(
            'id, sponsor_name, amount, sponsorship_date'
          ),

        supabase
          .from('expenses')
          .select(
            'id, category, description, amount, expense_date'
          ),
      ])

      if (programsResult.error) {
        throw programsResult.error
      }

      if (beneficiariesResult.error) {
        throw beneficiariesResult.error
      }

      processFinancialData(
        donationsResult,
        sponsorshipsResult,
        expensesResult,
        programsResult.count || 0,
        beneficiariesResult.count || 0
      )
    }
  } catch (err) {
    console.error('Dashboard error:', err)
    setError('Unable to load dashboard data.')
  } finally {
    setLoading(false)
  }
}

  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount)
  }

  function formatDate(date) {
    if (!date) return '—'

    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString('en-PH')
  }

  const totalFunds =
    stats.donations + stats.sponsorships

  const remainingBalance =
    totalFunds - stats.expenses

  const isAdmin = profile?.role === 'admin'
const isFinance = profile?.role === 'finance'
const isCoordinator =
  profile?.role === 'program_coordinator'

const canViewFinancials =
  isAdmin || isFinance

  if (loading) {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Loading your workspace...</p>
        </div>
      </div>

      <div
        className="content-state"
        role="status"
      >
        <div className="loading-spinner"></div>

        <div>
          <strong>Loading dashboard</strong>
          <span>
            Please wait while we prepare your overview.
          </span>
        </div>
      </div>
    </div>
  )
}

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>
            Welcome back,{' '}
            <strong>
              {profile?.full_name || 'User'}
            </strong>
            !
          </p>
        </div>
      </div>

      {error && (
  <div
    className="feedback-message feedback-error"
    role="alert"
  >
    <div>
      <strong>Unable to load dashboard</strong>
      <span>{error}</span>
    </div>
  </div>
)}

      {/* Summary Cards */}

      <div className="dashboard-grid">
  {(isAdmin || isCoordinator) && (
    <>
      <div className="stat-card">
        <span className="stat-label">
          Programs
        </span>

        <strong className="stat-value">
          {stats.programs}
        </strong>

        <span className="stat-caption">
          Programs in the system
        </span>
      </div>

      <div className="stat-card">
        <span className="stat-label">
          Beneficiaries
        </span>

        <strong className="stat-value">
          {stats.beneficiaries}
        </strong>

        <span className="stat-caption">
          Registered beneficiaries
        </span>
      </div>
    </>
  )}

  {canViewFinancials && (
    <>
      <div className="stat-card">
        <span className="stat-label">
          Total Funds
        </span>

        <strong className="stat-value">
          {formatCurrency(totalFunds)}
        </strong>

        <span className="stat-caption">
          Donations and sponsorships
        </span>
      </div>

      <div className="stat-card">
        <span className="stat-label">
          Total Expenses
        </span>

        <strong className="stat-value">
          {formatCurrency(stats.expenses)}
        </strong>

        <span className="stat-caption">
          Recorded organizational expenses
        </span>
      </div>
    </>
  )}
</div>

{isCoordinator && (
  <div className="dashboard-section">
    <div className="section-heading">
      <div>
        <h2>Program Management</h2>
        <p>
          Your workspace focuses on programs,
          beneficiaries, and public announcements.
        </p>
      </div>
    </div>

    <div className="dashboard-info-grid">
      <div className="dashboard-info-card">
        <strong>Programs</strong>
        <span>
          Create and maintain the organization's
          program records.
        </span>
      </div>

      <div className="dashboard-info-card">
        <strong>Beneficiaries</strong>
        <span>
          Manage beneficiary records and program
          assignments.
        </span>
      </div>

      <div className="dashboard-info-card">
        <strong>Announcements</strong>
        <span>
          Prepare and publish updates for the
          public portal.
        </span>
      </div>
    </div>
  </div>
)}

      {/* Financial Overview */}

      {canViewFinancials && (
  <div className="dashboard-section">
    <div className="section-heading">
      <div>
        <h2>Financial Overview</h2>
        <p>
          Summary of organizational funds and recorded expenses.
        </p>
      </div>
    </div>

    <div className="financial-summary">
      <div className="financial-row">
        <span>Donations</span>
        <strong>
          {formatCurrency(stats.donations)}
        </strong>
      </div>

      <div className="financial-row">
        <span>Sponsorships</span>
        <strong>
          {formatCurrency(stats.sponsorships)}
        </strong>
      </div>

      <div className="financial-row total-row">
        <span>Total Funds</span>
        <strong>
          {formatCurrency(totalFunds)}
        </strong>
      </div>

      <div className="financial-row">
        <span>Total Expenses</span>
        <strong>
          {formatCurrency(stats.expenses)}
        </strong>
      </div>

      <div className="financial-row balance-row">
        <span>Remaining Balance</span>
        <strong>
          {formatCurrency(remainingBalance)}
        </strong>
      </div>
    </div>
  </div>
)}

      {/* Recent Activity */}

      {canViewFinancials && (
  <div className="dashboard-section">
    <div className="section-heading">
      <div>
        <h2>Recent Financial Activity</h2>
        <p>
          Latest donations, sponsorships, and expenses.
        </p>
      </div>
    </div>

    {recentActivity.length === 0 ? (
      <div className="content-state">
        <div>
          <strong>No financial activity yet</strong>
          <span>
            Recent transactions will appear here once recorded.
          </span>
        </div>
      </div>
    ) : (
      <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Name / Description</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {recentActivity.map(
                  (activity) => (
                    <tr key={activity.id}>
                      <td>
                        <span
                          className={`activity-badge ${activity.type.toLowerCase()}`}
                        >
                          {activity.type}
                        </span>
                      </td>

                      <td>
                        <strong>
                          {activity.name}
                        </strong>
                      </td>

                      <td>
                        {activity.category ||
                          '—'}
                      </td>

                      <td>
                        {formatCurrency(
                          activity.amount
                        )}
                      </td>

                      <td>
                        {formatDate(
                          activity.date
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}
    </div>
  )
}

export default Dashboard