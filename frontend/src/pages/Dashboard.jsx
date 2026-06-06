import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import './Dashboard.css'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [tasks, setTasks] = useState([])
  const [allTasks, setAllTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', dueDate: '' })
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [sidebarFilter, setSidebarFilter] = useState('all')

  useEffect(() => {
    fetchTasks()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filter, search, sidebarFilter, allTasks])

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/tasks')
      setAllTasks(data)
    } catch (err) {
      setError('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...allTasks]

    if (sidebarFilter === 'completed') {
      filtered = filtered.filter(t => t.status === 'completed')
    } else if (sidebarFilter === 'overdue') {
      const now = new Date()
      filtered = filtered.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'completed')
    }

    if (filter === 'pending') filtered = filtered.filter(t => t.status === 'pending')
    else if (filter === 'completed') filtered = filtered.filter(t => t.status === 'completed')

    if (search.trim()) {
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(search.toLowerCase()))
      )
    }

    setTasks(filtered)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const openAddModal = () => {
    setEditTask(null)
    setForm({ title: '', description: '', priority: 'medium', dueDate: '' })
    setFormError('')
    setShowModal(true)
  }

  const openEditModal = (task) => {
    setEditTask(task)
    setForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority || 'medium',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : ''
    })
    setFormError('')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditTask(null)
    setForm({ title: '', description: '', priority: 'medium', dueDate: '' })
    setFormError('')
  }

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setFormError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      setFormError('Title is required')
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        title: form.title,
        description: form.description,
        priority: form.priority,
        dueDate: form.dueDate || null,
      }
      if (editTask) {
        await api.put(`/tasks/${editTask._id}`, payload)
      } else {
        await api.post('/tasks', payload)
      }
      closeModal()
      fetchTasks()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggle = async (task) => {
    try {
      await api.patch(`/tasks/${task._id}/toggle`)
      fetchTasks()
    } catch (err) {
      setError('Failed to update task')
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/tasks/${id}`)
      setDeleteConfirm(null)
      fetchTasks()
    } catch (err) {
      setError('Failed to delete task')
    }
  }

  const isOverdue = (task) => {
    if (!task.dueDate || task.status === 'completed') return false
    return new Date(task.dueDate) < new Date()
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const totalTasks = allTasks.length
  const pendingTasks = allTasks.filter(t => t.status === 'pending').length
  const completedTasks = allTasks.filter(t => t.status === 'completed').length
  const overdueTasks = allTasks.filter(t => isOverdue(t)).length
  const progressPct = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <div className="db-page">
      <div className="db-mesh-bg" />

      <div className="db-content">
        {/* Navbar */}
        <nav className="db-nav">
          <span className="db-logo">Task<span>r</span></span>
          <div className="db-nav-right">
            <span className="db-nav-user">{user?.name}</span>
            <div className="db-avatar">{initials}</div>
            <button className="db-logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </nav>

        <div className="db-body">
          {/* Sidebar */}
          <aside className="db-sidebar">
            <div
              className={`db-sidebar-item ${sidebarFilter === 'all' ? 'active' : ''}`}
              onClick={() => setSidebarFilter('all')}
            >
              <span className="db-sidebar-dot" />
              My Tasks
            </div>
            <div
              className={`db-sidebar-item ${sidebarFilter === 'completed' ? 'active' : ''}`}
              onClick={() => setSidebarFilter('completed')}
            >
              <span className="db-sidebar-dot" />
              Completed
            </div>
            <div
              className={`db-sidebar-item ${sidebarFilter === 'overdue' ? 'active' : ''}`}
              onClick={() => setSidebarFilter('overdue')}
            >
              <span className="db-sidebar-dot" />
              Overdue
            </div>
          </aside>

          {/* Main */}
          <main className="db-main">
            <h1 className="db-page-title">
              {sidebarFilter === 'all' ? 'My Tasks' : sidebarFilter === 'completed' ? 'Completed' : 'Overdue'}
            </h1>

            {/* Stats */}
            <div className="db-stats">
              <div className="db-stat">
                <div className="db-stat-label">Total</div>
                <div className="db-stat-val indigo">{totalTasks}</div>
              </div>
              <div className="db-stat">
                <div className="db-stat-label">Pending</div>
                <div className="db-stat-val amber">{pendingTasks}</div>
              </div>
              <div className="db-stat">
                <div className="db-stat-label">Completed</div>
                <div className="db-stat-val green">{completedTasks}</div>
              </div>
              <div className="db-stat">
                <div className="db-stat-label">Overdue</div>
                <div className="db-stat-val red">{overdueTasks}</div>
              </div>
            </div>

            {/* Progress */}
            <div className="db-progress-wrap">
              <div className="db-progress-header">
                <span>Overall progress</span>
                <span className="db-progress-pct">{progressPct}%</span>
              </div>
              <div className="db-progress-bar">
                <div className="db-progress-fill" style={{ width: `${progressPct}%` }} />
              </div>
            </div>

            {/* Toolbar */}
            <div className="db-toolbar">
              <input
                className="db-search"
                placeholder="Search tasks..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <div className="db-tabs">
                {['all', 'pending', 'completed'].map(tab => (
                  <button
                    key={tab}
                    className={`db-tab ${filter === tab ? 'active' : ''}`}
                    onClick={() => setFilter(tab)}
                  >
                    {tab === 'all' ? 'All' : tab === 'pending' ? 'Pending' : 'Done'}
                  </button>
                ))}
              </div>
              <button className="db-add-btn" onClick={openAddModal}>+ Add Task</button>
            </div>

            {/* Error */}
            {error && <div className="db-error">{error}</div>}

            {/* Table */}
            {loading ? (
              <div className="db-loading">Loading tasks...</div>
            ) : tasks.length === 0 ? (
              <div className="db-empty">
                <p>No tasks found.</p>
                <button className="db-add-btn" onClick={openAddModal}>Add your first task</button>
              </div>
            ) : (
              <div className="db-table-wrap">
                <table className="db-table">
                  <thead>
                    <tr>
                      <th style={{ width: '36px' }}></th>
                      <th>Task</th>
                      <th>Priority</th>
                      <th>Due Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map(task => (
                      <tr key={task._id} className={task.status === 'completed' ? 'done-row' : ''}>
                        <td>
                          <button
                            className={`db-toggle ${task.status === 'completed' ? 'checked' : ''}`}
                            onClick={() => handleToggle(task)}
                            aria-label="Toggle status"
                          >
                            {task.status === 'completed' && '✓'}
                          </button>
                        </td>
                        <td>
                          <div className={`db-task-name ${task.status === 'completed' ? 'done' : ''}`}>
                            {task.title}
                          </div>
                          {task.description && (
                            <div className="db-task-desc">{task.description}</div>
                          )}
                        </td>
                        <td>
                          <span className={`db-badge priority-${task.priority || 'medium'}`}>
                            {task.priority || 'medium'}
                          </span>
                        </td>
                        <td>
                          <span className={`db-due ${isOverdue(task) ? 'overdue' : ''}`}>
                            {formatDate(task.dueDate)}
                          </span>
                        </td>
                        <td>
                          <span className={`db-badge status-${task.status}`}>
                            {task.status}
                          </span>
                        </td>
                        <td>
                          <button className="db-action-btn" onClick={() => openEditModal(task)}>Edit</button>
                          {deleteConfirm === task._id ? (
                            <>
                              <button className="db-action-btn danger" onClick={() => handleDelete(task._id)}>Confirm</button>
                              <button className="db-action-btn" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                            </>
                          ) : (
                            <button className="db-action-btn" onClick={() => setDeleteConfirm(task._id)}>Delete</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="db-modal-overlay" onClick={closeModal}>
          <div className="db-modal" onClick={e => e.stopPropagation()}>
            <div className="db-modal-header">
              <h2>{editTask ? 'Edit Task' : 'New Task'}</h2>
              <button className="db-modal-close" onClick={closeModal}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              {formError && <div className="db-error">{formError}</div>}

              <div className="db-form-group">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="Task title"
                  value={form.title}
                  onChange={handleFormChange}
                  autoFocus
                />
              </div>

              <div className="db-form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  placeholder="Optional description"
                  value={form.description}
                  onChange={handleFormChange}
                  rows={3}
                />
              </div>

              <div className="db-form-row">
                <div className="db-form-group">
                  <label>Priority</label>
                  <select name="priority" value={form.priority} onChange={handleFormChange}>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div className="db-form-group">
                  <label>Due Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    value={form.dueDate}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              <div className="db-modal-footer">
                <button type="button" className="db-cancel-btn" onClick={closeModal}>Cancel</button>
                <button type="submit" className="db-add-btn" disabled={submitting}>
                  {submitting ? 'Saving...' : editTask ? 'Save Changes' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard