import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function Expenses({ profile }) {
  const [expenses, setExpenses] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const [showForm, setShowForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)

  const [formData, setFormData] = useState({
    category: '',
    description: '',
    amount: '',
    expense_date: '',
    notes: '',
  })

  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadExpenses()
  }, [])

  async function loadExpenses() {
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('expenses')
      .select(`
        *,
        profiles (
          id,
          full_name
        )
      `)
      .order('expense_date', {
        ascending: false,
      })
      .order('created_at', {
        ascending: false,
      })

    if (error) {
      console.error(error)
      setError('Unable to load expenses.')
      setLoading(false)
      return
    }

    setExpenses(data || [])
    setLoading(false)
  }

  function openAddForm() {
    setSuccess('')
    setEditingExpense(null)

    setFormData({
      category: '',
      description: '',
      amount: '',
      expense_date: new Date()
        .toISOString()
        .split('T')[0],
      notes: '',
    })

    setShowForm(true)
    setError('')
  }

  function openEditForm(expense) {
    setSuccess('')
    setEditingExpense(expense)

    setFormData({
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      expense_date: expense.expense_date || '',
      notes: expense.notes || '',
    })

    setShowForm(true)
    setError('')
  }

  function closeForm() {
    setShowForm(false)
    setEditingExpense(null)

    setFormData({
      category: '',
      description: '',
      amount: '',
      expense_date: '',
      notes: '',
    })
  }

  function handleChange(event) {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!formData.category.trim()) {
      setError('Expense category is required.')
      return
    }

    if (!formData.description.trim()) {
      setError('Expense description is required.')
      return
    }

    if (
  !formData.amount ||
  Number(formData.amount) <= 0
) {
  setError('Expense amount must be greater than zero.')
  return
}

    setSaving(true)
    setError('')

    const expenseData = {
      category: formData.category.trim(),
      description: formData.description.trim(),
      amount: Number(formData.amount),
      expense_date:
        formData.expense_date ||
        new Date().toISOString().split('T')[0],
      notes: formData.notes.trim() || null,
    }

    if (editingExpense) {
      const { error } = await supabase
        .from('expenses')
        .update(expenseData)
        .eq('id', editingExpense.id)

      if (error) {
        console.error(error)
        setError('Unable to update the expense.')
        setSaving(false)
        return
      }
    } else {
      const { data: userData } =
        await supabase.auth.getUser()

      if (!userData.user) {
        setError(
          'You must be logged in to record an expense.'
        )
        setSaving(false)
        return
      }

      const { error } = await supabase
        .from('expenses')
        .insert({
          ...expenseData,
          recorded_by: userData.user.id,
        })

      if (error) {
        console.error(error)
        setError('Unable to create the expense.')
        setSaving(false)
        return
      }
    }

    setSuccess(
  editingExpense
    ? 'Expense updated successfully.'
    : 'Expense recorded successfully.'
)

await loadExpenses()
closeForm()
setSaving(false)
  }

  async function handleDelete(expense) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${expense.description}"?`
    )

    if (!confirmed) return

    setError('')
    setSuccess('')

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expense.id)

    if (error) {
      console.error(error)
      setError('Unable to delete the expense.')
      return
    }

    setSuccess('Expense deleted successfully.')
    await loadExpenses()
  }

  const categories = [
    ...new Set(
      expenses
        .map((expense) => expense.category)
        .filter(Boolean)
    ),
  ].sort()

  const filteredExpenses = expenses.filter((expense) => {
    const searchTerm = search.toLowerCase()

    const matchesSearch =
      expense.category
        .toLowerCase()
        .includes(searchTerm) ||
      expense.description
        .toLowerCase()
        .includes(searchTerm) ||
      (expense.notes || '')
        .toLowerCase()
        .includes(searchTerm)

    const matchesCategory =
      categoryFilter === 'all' ||
      expense.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(Number(amount || 0))
  }

  const totalExpenses = filteredExpenses.reduce(
    (total, expense) =>
      total + Number(expense.amount || 0),
    0
  )

  const canManage =
    profile?.role === 'admin' ||
    profile?.role === 'finance'

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Expenses</h1>
          <p>
            Record and manage organizational expenses.
          </p>
        </div>

        {canManage && (
          <button
            className="primary-button"
            onClick={openAddForm}
          >
            + Add Expense
          </button>
        )}
      </div>

      {success && (
  <div
    className="feedback-message feedback-success"
    role="status"
  >
    <div>
      <strong>Success</strong>
      <span>{success}</span>
    </div>
  </div>
)}

{error && (
  <div
    className="feedback-message feedback-error"
    role="alert"
  >
    <div>
      <strong>Something went wrong</strong>
      <span>{error}</span>
    </div>
  </div>
)}

      <div className="page-toolbar expenses-toolbar">
  <div className="expense-filter-controls">
    <div className="search-field">
      <input
        type="search"
        aria-label="Search expenses"
        placeholder="Search expenses..."
        value={search}
        onChange={(event) =>
          setSearch(event.target.value)
        }
      />
    </div>

    <select
      className="filter-select"
      aria-label="Filter expenses by category"
      value={categoryFilter}
      onChange={(event) =>
        setCategoryFilter(event.target.value)
      }
    >
      <option value="all">
        All Categories
      </option>

      {categories.map((category) => (
        <option
          key={category}
          value={category}
        >
          {category}
        </option>
      ))}
    </select>
  </div>

  {!loading && (
    <div className="financial-toolbar-summary">
      <span className="toolbar-count">
        {filteredExpenses.length}{' '}
        {filteredExpenses.length === 1
          ? 'expense'
          : 'expenses'}
      </span>

      <strong className="toolbar-total">
        {formatCurrency(totalExpenses)}
      </strong>
    </div>
  )}
</div>

      <div className="dashboard-section">
        <strong>
          Showing {filteredExpenses.length} expense
          {filteredExpenses.length === 1 ? '' : 's'}
        </strong>

        <span style={{ marginLeft: '20px' }}>
          Total: {formatCurrency(totalExpenses)}
        </span>
      </div>

        {loading ? (
  <div
    className="content-state"
    role="status"
  >
    <div className="loading-spinner"></div>

    <div>
      <strong>Loading expenses</strong>
      <span>
        Please wait while we retrieve the latest financial records.
      </span>
    </div>
  </div>
) : filteredExpenses.length === 0 ? (
  <div className="content-state">
    <div>
      <strong>
        {search || categoryFilter !== 'all'
          ? 'No matching expenses'
          : 'No expenses yet'}
      </strong>

      <span>
        {search || categoryFilter !== 'all'
          ? 'No expenses match the current search or category filter.'
          : canManage
            ? 'Record your first expense to get started.'
            : 'There are currently no expenses to display.'}
      </span>
    </div>

    {(search || categoryFilter !== 'all') && (
      <button
        type="button"
        className="secondary-button"
        onClick={() => {
          setSearch('')
          setCategoryFilter('all')
        }}
      >
        Clear Filters
      </button>
    )}
  </div>
) : (
  <div className="table-container">
    <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Notes</th>
                <th>Recorded By</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredExpenses.map((expense) => (
                <tr key={expense.id}>
                  <td className="expense-category-cell">
  <strong>
    {expense.category}
  </strong>
</td>

                  <td className="expense-description-cell">
  {expense.description}
</td>

                  <td className="expense-amount-cell">
  <strong>
    {formatCurrency(expense.amount)}
  </strong>
</td>

                  <td>
                    {expense.expense_date
                      ? new Date(
                          `${expense.expense_date}T00:00:00`
                        ).toLocaleDateString('en-PH')
                      : '—'}
                  </td>

                  <td className="expense-notes-cell">
  {expense.notes || '—'}
</td>

                  <td>
                    {expense.profiles?.full_name || '—'}
                  </td>

                  <td>
  <div className="action-buttons">
    {canManage && (
      <button
        type="button"
        className="table-button"
        onClick={() =>
          openEditForm(expense)
        }
      >
        Edit
      </button>
    )}

    {profile?.role === 'admin' && (
      <button
        type="button"
        className="table-button danger"
        onClick={() =>
          handleDelete(expense)
        }
      >
        Delete
      </button>
    )}
  </div>
</td>
                </tr>
              ))}
            </tbody>
          </table>
  </div>
)}

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>
                {editingExpense
                  ? 'Edit Expense'
                  : 'Add Expense'}
              </h2>

              <button
  type="button"
  className="close-button"
  onClick={closeForm}
  aria-label="Close expense form"
>
  ×
</button>
            </div>

            <div className="form-group">
  <label htmlFor="category">
    Category
  </label>

  <input
    id="category"
    name="category"
    type="text"
    value={formData.category}
    onChange={handleChange}
    placeholder="e.g. Transportation"
    required
  />
</div>

<div className="form-group">
  <label htmlFor="description">
    Description
  </label>

  <input
    id="description"
    name="description"
    type="text"
    value={formData.description}
    onChange={handleChange}
    placeholder="Describe the expense"
    required
  />
</div>

<div className="form-group">
  <label htmlFor="amount">
    Amount (PHP)
  </label>

  <input
    id="amount"
    name="amount"
    type="number"
    min="0.01"
    step="0.01"
    value={formData.amount}
    onChange={handleChange}
    placeholder="0.00"
    required
  />
</div>

<div className="form-group">
  <label htmlFor="expense_date">
    Expense Date
  </label>

  <input
    id="expense_date"
    name="expense_date"
    type="date"
    value={formData.expense_date}
    onChange={handleChange}
    required
  />
</div>

<div className="form-group">
  <label htmlFor="notes">
    Notes
  </label>

  <textarea
    id="notes"
    name="notes"
    value={formData.notes}
    onChange={handleChange}
    placeholder="Optional notes"
    rows="5"
  />
</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Expenses