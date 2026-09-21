import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function Transparency() {
  const [financialData, setFinancialData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadFinancialSummary()
  }, [])

  async function loadFinancialSummary() {
    setLoading(true)
    setError('')

    const { data, error } = await supabase.rpc(
      'get_public_financial_summary'
    )

    if (error) {
      console.error(
        'Public financial summary error:',
        error
      )

      setError(
        'Unable to load the financial summary.'
      )

      setLoading(false)
      return
    }

    if (data && data.length > 0) {
      setFinancialData(data[0])
    }

    setLoading(false)
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(Number(amount || 0))
  }

  return (
    <div className="public-page">
      <section className="public-page-header">
        <span>TRANSPARENCY</span>

        <h1>Financial Transparency</h1>

        <p>
          An overview of the organization's recorded
          financial resources and expenditures.
        </p>
      </section>

      {loading && (
        <p>
          Loading financial information...
        </p>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {!loading && !error && financialData && (
        <>
          <section className="transparency-summary">
            <div className="transparency-card">
              <span>Donations</span>

              <strong>
                {formatCurrency(
                  financialData.total_donations
                )}
              </strong>
            </div>

            <div className="transparency-card">
              <span>Sponsorships</span>

              <strong>
                {formatCurrency(
                  financialData.total_sponsorships
                )}
              </strong>
            </div>

            <div className="transparency-card">
              <span>Total Funds</span>

              <strong>
                {formatCurrency(
                  financialData.total_funds
                )}
              </strong>
            </div>

            <div className="transparency-card">
              <span>Total Expenses</span>

              <strong>
                {formatCurrency(
                  financialData.total_expenses
                )}
              </strong>
            </div>

            <div className="transparency-card balance-card">
              <span>Remaining Balance</span>

              <strong>
                {formatCurrency(
                  financialData.remaining_balance
                )}
              </strong>
            </div>
          </section>

          <section className="public-content-section">
            <h2>How to Read This Summary</h2>

            <p>
              Donations and sponsorships represent recorded
              incoming funds. Total expenses represent
              recorded expenditures. The remaining balance
              is calculated from total recorded funds minus
              total recorded expenses.
            </p>

            <p className="public-note">
              This page displays aggregate financial
              information only. Individual donor information,
              sponsorship records, expense details, and
              internal financial records are not publicly
              displayed.
            </p>
          </section>
        </>
      )}
    </div>
  )
}

export default Transparency