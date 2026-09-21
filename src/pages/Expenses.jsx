import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function Expenses({ profile }) {
  const [expenses, setExpenses] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

    if (!formData.amount || Number(formData.amount) < 0) {
      setError('Please enter a valid expense amount.')
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

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expense.id)

    if (error) {
      console.error(error)
      setError('Unable to delete the expense.')
      return
    }

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

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="filters">
        <input
          type="text"
          placeholder="Search expenses..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

        <select
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

      <div className="dashboard-section">
        <strong>
          Showing {filteredExpenses.length} expense
          {filteredExpenses.length === 1 ? '' : 's'}
        </strong>

        <span style={{ marginLeft: '20px' }}>
          Total: {formatCurrency(totalExpenses)}
        </span>
      </div>

      <div className="table-container">
        {loading ? (
          <p className="empty-state">
            Loading expenses...
          </p>
        ) : filteredExpenses.length === 0 ? (
          <p className="empty-state">
            No expenses found.
          </p>
        ) : (
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
                  <td>
                    <strong>
                      {expense.category}
                    </strong>
                  </td>

                  <td>
                    {expense.description}
                  </td>

                  <td>
                    {formatCurrency(expense.amount)}
                  </td>

                  <td>
                    {expense.expense_date
                      ? new Date(
                          `${expense.expense_date}T00:00:00`
                        ).toLocaleDateString('en-PH')
                      : '—'}
                  </td>

                  <td>
                    {expense.notes || '—'}
                  </td>

                  <td>
                    {expense.profiles?.full_name || '—'}
                  </td>

                  <td>
                    {canManage && (
                      <button
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
                        className="table-button danger"
                        onClick={() =>
                          handleDelete(expense)
                        }
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

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
                className="close-button"
                onClick={closeForm}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
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

              <label htmlFor="amount">
                Amount (PHP)
              </label>

              <input
                id="amount"
                name="amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                required
              />

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

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving
                    ? 'Saving...'
                    : editingExpense
                      ? 'Save Changes'
                      : 'Record Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Expenses