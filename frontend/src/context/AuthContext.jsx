import { createContext, useContext, useState } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null
    } catch {
      return null
    }
  })

  const [gameStats, setGameStats] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('gameStats')) || {
        xp: 0,
        level: 1,
        badges: [],
        streak: 0,
        totalCompleted: 0,
      }
    } catch {
      return { xp: 0, level: 1, badges: [], streak: 0, totalCompleted: 0 }
    }
  })

  const saveUser = (data) => {
    const userData = { _id: data._id, name: data.name, email: data.email }
    const stats = {
      xp: data.xp || 0,
      level: data.level || 1,
      badges: data.badges || [],
      streak: data.streak || 0,
      totalCompleted: data.totalCompleted || 0,
    }
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('gameStats', JSON.stringify(stats))
    setUser(userData)
    setGameStats(stats)
  }

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    saveUser(data)
    return data
  }

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password })
    saveUser(data)
    return data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('gameStats')
    setUser(null)
    setGameStats({ xp: 0, level: 1, badges: [], streak: 0, totalCompleted: 0 })
  }

  const awardXP = async (task) => {
    try {
      const isEarly = task.dueDate && new Date(task.dueDate) > new Date()
      const priorityXp = task.priority === 'high' ? 20 : task.priority === 'medium' ? 10 : 5

      const { data } = await api.post('/auth/award-xp', {
        xpAmount: priorityXp,
        taskCompletedEarly: isEarly,
        currentBadges: gameStats.badges,
      })

      const updatedStats = {
        xp: data.xp,
        level: data.level,
        badges: data.badges,
        streak: data.streak,
        totalCompleted: data.totalCompleted,
      }

      localStorage.setItem('gameStats', JSON.stringify(updatedStats))
      setGameStats(updatedStats)

      return {
        earnedXp: data.earnedXp,
        newBadges: data.newBadges || [],
        updatedStats,
      }
    } catch (err) {
      console.error('XP award failed:', err)
      return { earnedXp: 0, newBadges: [] }
    }
  }

  const refreshStats = async () => {
    try {
      const { data } = await api.get('/auth/stats')
      const stats = {
        xp: data.xp,
        level: data.level,
        badges: data.badges,
        streak: data.streak,
        totalCompleted: data.totalCompleted,
      }
      localStorage.setItem('gameStats', JSON.stringify(stats))
      setGameStats(stats)
    } catch (err) {
      console.error('Stats refresh failed:', err)
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      gameStats,
      login,
      register,
      logout,
      awardXP,
      refreshStats,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)