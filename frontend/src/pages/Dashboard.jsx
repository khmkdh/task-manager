import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import './Dashboard.css'

// ── Toast ──────────────────────────────────────────────
const Toast = ({ toasts, removeToast }) => (
  <div className="toast-container">
    {toasts.map(t => (
      <div key={t.id} className={`toast toast-${t.type}`}>
        <span>{t.message}</span>
        <button onClick={() => removeToast(t.id)}>✕</button>
      </div>
    ))}
  </div>
)

// ── Confetti ───────────────────────────────────────────
const Confetti = ({ active }) => {
  if (!active) return null
  const pieces = Array.from({ length: 40 }, (_, i) => i)
  const colors = ['#818cf8', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#60a5fa']
  return (
    <div className="confetti-wrap">
      {pieces.map(i => (
        <div
          key={i}
          className="confetti-piece"
          style={{
            left: `${Math.random() * 100}%`,
            background: colors[Math.floor(Math.random() * colors.length)],
            animationDelay: `${Math.random() * 0.5}s`,
            animationDuration: `${0.8 + Math.random() * 0.8}s`,
            width: `${6 + Math.random() * 8}px`,
            height: `${6 + Math.random() * 8}px`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  )
}

// ── XP Bar ─────────────────────────────────────────────
const XpForLevel = (level) => level * 100

const getXpInCurrentLevel = (totalXp) => {
  let level = 1
  let remaining = totalXp
  while (remaining >= XpForLevel(level)) {
    remaining -= XpForLevel(level)
    level++
  }
  return { xpInLevel: remaining, xpNeeded: XpForLevel(level) }
}

// ── Badge definitions ──────────────────────────────────
const BADGE_INFO = {
  first_task:    { icon: '🎯', label: 'First Task',     desc: 'Completed your first task' },
  getting_started:{ icon: '🚀', label: 'Getting Started', desc: 'Completed 5 tasks' },
  task_master:   { icon: '⭐', label: 'Task Master',    desc: 'Completed 10 tasks' },
  legend:        { icon: '👑', label: 'Legend',         desc: 'Completed 25 tasks' },
  on_fire:       { icon: '🔥', label: 'On Fire',        desc: '3-day streak' },
  unstoppable:   { icon: '💎', label: 'Unstoppable',    desc: '7-day streak' },
}

// ── Main Dashboard ─────────────────────────────────────
const Dashboard = () => {
  const { user, gameStats, logout, awardXP, refreshStats } = useAuth()
  const navigate = useNavigate()

  const [tasks, setTasks] = useState([])
  const [allTasks, setAllTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [showModal, setShowModal] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', dueDate: '' })
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [sidebarFilter, setSidebarFilter] = useState('all')
  const [toasts, setToasts] = useState([])
  const [confetti, setConfetti] = useState(false)
  const [showBadges, setShowBadges] = useState(false)
  const [newBadgeAlert, setNewBadgeAlert] = useState([])
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') !== 'false')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
    localStorage.setItem('darkMode', darkMode)
  }, [darkMode])

  useEffect(() => {
    fetchTasks()
    refreshStats()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filter, search, sidebarFilter, sortBy, allTasks])

  const addToast = (message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => removeToast(id), 3500)
  }

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id))

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

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt)
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt)
      if (sortBy === 'priority') {
        const order = { high: 0, medium: 1, low: 2 }
        return order[a.priority] - order[b.priority]
      }
      if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(a.dueDate) - new Date(b.dueDate)
      }
      return 0
    })

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
        addToast('✏️ Task updated successfully!')
      } else {
        await api.post('/tasks', payload)
        addToast('✅ Task created successfully!')
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

      if (task.status === 'pending') {
        // Task being completed — award XP
        const result = await awardXP(task)

        // Confetti
        setConfetti(true)
        setTimeout(() => setConfetti(false), 1500)

        // XP toast
        addToast(`⚡ +${result.earnedXp} XP earned!`, 'xp')

        // New badge toast
        if (result.newBadges && result.newBadges.length > 0) {
          setNewBadgeAlert(result.newBadges)
          result.newBadges.forEach(badge => {
            const info = BADGE_INFO[badge]
            if (info) addToast(`🏆 Badge unlocked: ${info.label}!`, 'badge')
          })
          setTimeout(() => setNewBadgeAlert([]), 4000)
        }

        // Motivational message
        const messages = [
          '🚀 Keep it up!',
          '💪 You\'re crushing it!',
          '🔥 On a roll!',
          '⭐ Great work!',
          '🎯 Nailed it!',
        ]
        addToast(messages[Math.floor(Math.random() * messages.length)], 'motivational')
      } else {
        addToast('↩️ Task marked as pending')
      }

      fetchTasks()
    } catch (err) {
      addToast('Failed to update task', 'error')
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/tasks/${id}`)
      setDeleteConfirm(null)
      addToast('🗑️ Task deleted')
      fetchTasks()
    } catch (err) {
      addToast('Failed to delete task', 'error')
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

  const { xpInLevel, xpNeeded } = getXpInCurrentLevel(gameStats.xp)
  const xpPct = Math.round((xpInLevel / xpNeeded) * 100)

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <div className="db-page">
      <div className="db-mesh-bg" />
      <Confetti active={confetti} />
      <Toast toasts={toasts} removeToast={removeToast} />

      <div className="db-content">
        {/* Navbar */}
        <nav className="db-nav">
          <span className="db-logo">Task<span>r</span></span>
          <div className="db-nav-right">
            {/* XP + Level */}
            <div className="db-xp-bar">
              <span className="db-level-badge">Lv.{gameStats.level}</span>
              <div className="db-xp-track">
                <div className="db-xp-fill" style={{ width: `${xpPct}%` }} />
              </div>
              <span className="db-xp-text">{xpInLevel}/{xpNeeded} XP</span>
            </div>

            {/* Streak */}
            {gameStats.streak > 0 && (
              <div className="db-streak">🔥 {gameStats.streak}</div>
            )}

            {/* Badges button */}
            <button className="db-badges-btn" onClick={() => setShowBadges(true)}>
              🏆 {gameStats.badges.length}
            </button>

            {/* Dark mode toggle */}
            <button className="db-theme-btn" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? '☀️' : '🌙'}
            </button>

            <span className="db-nav-user">{user?.name}</span>
            <div className="db-avatar">{initials}</div>
            <button className="db-logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </nav>

        <div className="db-body">
          {/* Sidebar */}
          <aside className="db-sidebar">
            <div className={`db-sidebar-item ${sidebarFilter === 'all' ? 'active' : ''}`} onClick={() => setSidebarFilter('all')}>
              <span className="db-sidebar-dot" /> My Tasks
              <span className="db-sidebar-count">{totalTasks}</span>
            </div>
            <div className={`db-sidebar-item ${sidebarFilter === 'completed' ? 'active' : ''}`} onClick={() => setSidebarFilter('completed')}>
              <span className="db-sidebar-dot" /> Completed
              <span className="db-sidebar-count">{completedTasks}</span>
            </div>
            <div className={`db-sidebar-item ${sidebarFilter === 'overdue' ? 'active' : ''}`} onClick={() => setSidebarFilter('overdue')}>
              <span className="db-sidebar-dot" /> Overdue
              {overdueTasks > 0 && <span className="db-sidebar-count danger">{overdueTasks}</span>}
            </div>

            {/* Gamification sidebar section */}
            <div className="db-sidebar-divider" />
            <div className="db-sidebar-section">
              <div className="db-sidebar-label">Your Progress</div>
              <div className="db-sidebar-stat">
                <span>Tasks Done</span>
                <span>{gameStats.totalCompleted}</span>
              </div>
              <div className="db-sidebar-stat">
                <span>Current Streak</span>
                <span>🔥 {gameStats.streak}</span>
              </div>
              <div className="db-sidebar-stat">
                <span>Level</span>
                <span>⭐ {gameStats.level}</span>
              </div>
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
              <select className="db-sort" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="priority">Priority</option>
                <option value="dueDate">Due Date</option>
              </select>
              <button className="db-add-btn" onClick={openAddModal}>+ Add Task</button>
            </div>

            {/* Error */}
            {error && <div className="db-error">{error}</div>}

            {/* Table */}
            {loading ? (
              <div className="db-loading">Loading tasks...</div>
            ) : tasks.length === 0 ? (
              <div className="db-empty">
                <div className="db-empty-icon">📋</div>
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

      {/* Add/Edit Modal */}
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
                <input type="text" name="title" placeholder="Task title" value={form.title} onChange={handleFormChange} autoFocus />
              </div>
              <div className="db-form-group">
                <label>Description</label>
                <textarea name="description" placeholder="Optional description" value={form.description} onChange={handleFormChange} rows={3} />
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
                  <input type="date" name="dueDate" value={form.dueDate} onChange={handleFormChange} />
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

      {/* Badges Modal */}
      {showBadges && (
        <div className="db-modal-overlay" onClick={() => setShowBadges(false)}>
          <div className="db-modal" onClick={e => e.stopPropagation()}>
            <div className="db-modal-header">
              <h2>🏆 Your Badges</h2>
              <button className="db-modal-close" onClick={() => setShowBadges(false)}>✕</button>
            </div>
            <div className="db-badges-grid">
              {Object.entries(BADGE_INFO).map(([key, info]) => {
                const earned = gameStats.badges.includes(key)
                return (
                  <div key={key} className={`db-badge-card ${earned ? 'earned' : 'locked'}`}>
                    <div className="db-badge-icon">{earned ? info.icon : '🔒'}</div>
                    <div className="db-badge-label">{info.label}</div>
                    <div className="db-badge-desc">{info.desc}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard