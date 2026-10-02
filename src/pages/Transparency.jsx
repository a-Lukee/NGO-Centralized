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
    {/* PAGE HEADER */}

    <section className="public-page-header">
      <span>TRANSPARENCY</span>

      <h1>Financial Transparency</h1>

      <p>
        An aggregate overview of the financial resources
        and expenditures recorded by Minstrels Rhythm of
        Hope Inc.
      </p>
    </section>

    {/* FINANCIAL SUMMARY */}

    <section className="public-transparency-section">
      <div className="public-transparency-container">
        <div className="public-transparency-intro">
          <span className="section-eyebrow">
            FINANCIAL OVERVIEW
          </span>

          <h2>Recorded Financial Summary</h2>

          <p>
            These figures summarize financial records
            maintained within the organization's centralized
            management system.
          </p>
        </div>

        {loading && (
          <div className="public-loading-state">
            <div className="loading-spinner" />
            <p>Loading financial information...</p>
          </div>
        )}

        {error && (
          <div
            className="feedback-message feedback-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {!loading && !error && !financialData && (
          <div className="public-empty-state">
            <h3>Financial Information Unavailable</h3>

            <p>
              Financial summary information is not
              available to display at this time. Please
              check back later.
            </p>
          </div>
        )}

        {!loading && !error && financialData && (
          <>
            <div className="public-financial-grid">
              <article className="public-financial-card">
                <span className="public-financial-label">
                  DONATIONS
                </span>

                <strong>
                  {formatCurrency(
                    financialData.total_donations
                  )}
                </strong>

                <p>Recorded donations</p>
              </article>

              <article className="public-financial-card">
                <span className="public-financial-label">
                  SPONSORSHIPS
                </span>

                <strong>
                  {formatCurrency(
                    financialData.total_sponsorships
                  )}
                </strong>

                <p>Recorded sponsorships</p>
              </article>

              <article className="public-financial-card">
                <span className="public-financial-label">
                  TOTAL FUNDS
                </span>

                <strong>
                  {formatCurrency(
                    financialData.total_funds
                  )}
                </strong>

                <p>Total recorded incoming funds</p>
              </article>

              <article className="public-financial-card">
                <span className="public-financial-label">
                  EXPENSES
                </span>

                <strong>
                  {formatCurrency(
                    financialData.total_expenses
                  )}
                </strong>

                <p>Total recorded expenditures</p>
              </article>

              <article className="public-financial-card balance-card">
                <span className="public-financial-label">
                  REMAINING BALANCE
                </span>

                <strong>
                  {formatCurrency(
                    financialData.remaining_balance
                  )}
                </strong>

                <p>
                  Recorded funds minus recorded expenses
                </p>
              </article>
            </div>

            <div className="transparency-explanation">
              <div className="transparency-explanation-content">
                <span className="section-eyebrow">
                  UNDERSTANDING THE SUMMARY
                </span>

                <h2>How to Read These Figures</h2>

                <p>
                  Donations and sponsorships represent
                  recorded incoming funds. Total funds
                  combines these recorded resources, while
                  total expenses represent recorded
                  expenditures.
                </p>

                <p>
                  The remaining balance is calculated from
                  total recorded funds minus total recorded
                  expenses.
                </p>
              </div>

              <div className="transparency-privacy-note">
                <span className="transparency-privacy-label">
                  PRIVACY
                </span>

                <h3>Only Aggregate Information is Public</h3>

                <p>
                  Individual donor information, sponsorship
                  records, expense details, and internal
                  financial records are not displayed on
                  this public page.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  </div>
)
}

export default Transparency