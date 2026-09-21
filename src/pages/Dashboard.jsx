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
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    setLoading(true)
    setError('')

    try {
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
          .select('id, donor_name, amount, donation_date'),

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

      if (donationsResult.error) {
        throw donationsResult.error
      }

      if (sponsorshipsResult.error) {
        throw sponsorshipsResult.error
      }

      if (expensesResult.error) {
        throw expensesResult.error
      }

      const donationTotal =
        donationsResult.data.reduce(
          (total, donation) =>
            total + Number(donation.amount || 0),
          0
        )

      const sponsorshipTotal =
        sponsorshipsResult.data.reduce(
          (total, sponsorship) =>
            total + Number(sponsorship.amount || 0),
          0
        )

      const expenseTotal =
        expensesResult.data.reduce(
          (total, expense) =>
            total + Number(expense.amount || 0),
          0
        )

      setStats({
        programs: programsResult.count || 0,
        beneficiaries: beneficiariesResult.count || 0,
        donations: donationTotal,
        sponsorships: sponsorshipTotal,
        expenses: expenseTotal,
      })

      const activities = [
        ...(donationsResult.data || []).map(
          (donation) => ({
            id: `donation-${donation.id}`,
            type: 'Donation',
            name: donation.donor_name,
            amount: Number(donation.amount || 0),
            date: donation.donation_date,
          })
        ),

        ...(sponsorshipsResult.data || []).map(
          (sponsorship) => ({
            id: `sponsorship-${sponsorship.id}`,
            type: 'Sponsorship',
            name: sponsorship.sponsor_name,
            amount: Number(sponsorship.amount || 0),
            date: sponsorship.sponsorship_date,
          })
        ),

        ...(expensesResult.data || []).map(
          (expense) => ({
            id: `expense-${expense.id}`,
            type: 'Expense',
            name: expense.description,
            category: expense.category,
            amount: Number(expense.amount || 0),
            date: expense.expense_date,
          })
        ),
      ]

      activities.sort(
        (a, b) =>
          new Date(b.date) - new Date(a.date)
      )

      setRecentActivity(activities.slice(0, 8))
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

  if (loading) {
    return (
      <div>
        <h1>Dashboard</h1>
        <p>Loading dashboard data...</p>
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
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Summary Cards */}

      <div className="dashboard-grid">
        <div className="stat-card">
          <h3>Programs</h3>
          <p>{stats.programs}</p>
        </div>

        <div className="stat-card">
          <h3>Beneficiaries</h3>
          <p>{stats.beneficiaries}</p>
        </div>

        <div className="stat-card">
          <h3>Total Funds</h3>
          <p>
            {formatCurrency(totalFunds)}
          </p>
        </div>

        <div className="stat-card">
          <h3>Total Expenses</h3>
          <p>
            {formatCurrency(stats.expenses)}
          </p>
        </div>
      </div>

      {/* Financial Overview */}

      <div className="dashboard-section">
        <h2>Financial Overview</h2>

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
              {formatCurrency(
                stats.sponsorships
              )}
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
              {formatCurrency(
                remainingBalance
              )}
            </strong>
          </div>
        </div>
      </div>

      {/* Recent Activity */}

      <div className="dashboard-section">
        <h2>Recent Financial Activity</h2>

        {recentActivity.length === 0 ? (
          <p className="empty-state">
            No financial activity recorded yet.
          </p>
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
    </div>
  )
}

export default Dashboard